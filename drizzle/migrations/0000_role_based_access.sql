CREATE OR REPLACE FUNCTION public.has_permission(_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role = public.get_my_role() AND rp.permission_key = _key)
$$;

CREATE OR REPLACE FUNCTION public.is_family_role()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.get_my_role() IN ('parent','student')
$$;

CREATE OR REPLACE FUNCTION public.my_student_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id FROM public.students s WHERE s.profile_id = auth.uid()
  UNION
  SELECT sg.student_id FROM public.student_guardians sg
  JOIN public.guardians g ON g.id = sg.guardian_id WHERE g.profile_id = auth.uid()
$$;

REVOKE EXECUTE ON FUNCTION public.has_permission(text), public.is_family_role(), public.my_student_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(text), public.is_family_role(), public.my_student_ids() TO authenticated;

-- Schools: school admins may only edit their own school; only superadmin creates/deletes
DROP POLICY IF EXISTS schools_write_admin ON public.schools;
CREATE POLICY schools_insert_super ON public.schools FOR INSERT TO authenticated WITH CHECK (public.get_my_role() = 'superadmin');
CREATE POLICY schools_delete_super ON public.schools FOR DELETE TO authenticated USING (public.get_my_role() = 'superadmin');
CREATE POLICY schools_update_admin ON public.schools FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'superadmin' OR (public.get_my_role() = 'admin' AND id = public.get_my_school_id()))
  WITH CHECK (public.get_my_role() = 'superadmin' OR (public.get_my_role() = 'admin' AND id = public.get_my_school_id()));

-- Students: family roles only see their own child(ren); writes need students.write
DROP POLICY IF EXISTS students_select_same ON public.students;
CREATE POLICY students_select_scoped ON public.students FOR SELECT TO authenticated USING (
  public.get_my_role() = 'superadmin'
  OR (school_id = public.get_my_school_id() AND (NOT public.is_family_role() OR id IN (SELECT public.my_student_ids())))
);
DROP POLICY IF EXISTS students_write_admin ON public.students;
CREATE POLICY students_write_perm ON public.students FOR ALL TO authenticated
  USING (public.has_permission('students.write') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'))
  WITH CHECK (public.has_permission('students.write') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'));

-- Staff: writes need staff.write (admin, hr); family roles cannot browse staff list
DROP POLICY IF EXISTS staff_select_same ON public.staff;
CREATE POLICY staff_select_scoped ON public.staff FOR SELECT TO authenticated USING (
  public.get_my_role() = 'superadmin'
  OR (school_id = public.get_my_school_id() AND (NOT public.is_family_role() OR id IN (
      SELECT ts.staff_id FROM public.timetable_slots ts JOIN public.students s ON s.section_id = ts.section_id
      WHERE s.id IN (SELECT public.my_student_ids()))))
);
DROP POLICY IF EXISTS staff_write_admin ON public.staff;
CREATE POLICY staff_write_perm ON public.staff FOR ALL TO authenticated
  USING (public.has_permission('staff.write') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'))
  WITH CHECK (public.has_permission('staff.write') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'));

-- Attendance: family only own child; writes need attendance.write
DROP POLICY IF EXISTS att_select_same ON public.attendance;
CREATE POLICY att_select_scoped ON public.attendance FOR SELECT TO authenticated USING (
  public.get_my_role() = 'superadmin'
  OR (school_id = public.get_my_school_id() AND (NOT public.is_family_role() OR student_id IN (SELECT public.my_student_ids())))
);
DROP POLICY IF EXISTS att_write_staff ON public.attendance;
CREATE POLICY att_write_perm ON public.attendance FOR ALL TO authenticated
  USING (public.has_permission('attendance.write') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'))
  WITH CHECK (public.has_permission('attendance.write') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'));

-- Classes: writes need classes.write (admin, coordinator)
DROP POLICY IF EXISTS classes_write_admin ON public.classes;
CREATE POLICY classes_write_perm ON public.classes FOR ALL TO authenticated
  USING (public.has_permission('classes.write') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'))
  WITH CHECK (public.has_permission('classes.write') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'));