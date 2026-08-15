-- SUBJECTS
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY subjects_select_same ON public.subjects FOR SELECT TO authenticated
  USING (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY subjects_write_admin ON public.subjects FOR ALL TO authenticated
  USING (public.get_my_role() IN ('superadmin','admin','principal') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'))
  WITH CHECK (public.get_my_role() IN ('superadmin','admin','principal') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'));
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_subjects_school ON public.subjects(school_id);

-- TEACHER ASSIGNMENTS
CREATE TABLE public.teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, subject_id, section_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_assignments TO authenticated;
GRANT ALL ON public.teacher_assignments TO service_role;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY ta_select_same ON public.teacher_assignments FOR SELECT TO authenticated
  USING (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY ta_write_admin ON public.teacher_assignments FOR ALL TO authenticated
  USING (public.get_my_role() IN ('superadmin','admin','principal') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'))
  WITH CHECK (public.get_my_role() IN ('superadmin','admin','principal') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'));
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.teacher_assignments FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- TIMETABLE
CREATE TABLE public.timetable_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  period_no smallint NOT NULL CHECK (period_no BETWEEN 1 AND 12),
  start_time time,
  end_time time,
  room text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section_id, weekday, period_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable_slots TO authenticated;
GRANT ALL ON public.timetable_slots TO service_role;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY tt_select_same ON public.timetable_slots FOR SELECT TO authenticated
  USING (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY tt_write_admin ON public.timetable_slots FOR ALL TO authenticated
  USING (public.get_my_role() IN ('superadmin','admin','principal') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'))
  WITH CHECK (public.get_my_role() IN ('superadmin','admin','principal') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'));
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.timetable_slots FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_tt_section ON public.timetable_slots(section_id, weekday);

-- ATTENDANCE
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.sections(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','excused')),
  remarks text,
  marked_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY att_select_same ON public.attendance FOR SELECT TO authenticated
  USING (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY att_write_staff ON public.attendance FOR ALL TO authenticated
  USING (public.get_my_role() IN ('superadmin','admin','principal','teacher','coordinator') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'))
  WITH CHECK (public.get_my_role() IN ('superadmin','admin','principal','teacher','coordinator') AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'));
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_att_school_date ON public.attendance(school_id, date);