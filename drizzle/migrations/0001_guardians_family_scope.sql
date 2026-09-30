DROP POLICY IF EXISTS guardians_select_same ON public.guardians;
CREATE POLICY guardians_select_scoped ON public.guardians FOR SELECT TO authenticated USING (
  public.get_my_role() = 'superadmin'
  OR (school_id = public.get_my_school_id() AND (NOT public.is_family_role() OR profile_id = auth.uid() OR id IN (
    SELECT sg.guardian_id FROM public.student_guardians sg WHERE sg.student_id IN (SELECT public.my_student_ids()))))
);