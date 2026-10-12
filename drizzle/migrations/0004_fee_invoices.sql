CREATE TABLE public.fee_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  title text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  due_date date,
  status text NOT NULL DEFAULT 'due' CHECK (status IN ('due','paid','partial','waived')),
  paid_amount numeric(12,2) NOT NULL DEFAULT 0,
  paid_on date,
  receipt_no text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fee_invoices_school_idx ON public.fee_invoices(school_id);
CREATE INDEX fee_invoices_student_idx ON public.fee_invoices(student_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_invoices TO authenticated;
GRANT ALL ON public.fee_invoices TO service_role;
ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY fee_select_scoped ON public.fee_invoices FOR SELECT TO authenticated USING (
  public.get_my_role() = 'superadmin'
  OR (school_id = public.get_my_school_id() AND (NOT public.is_family_role() OR student_id IN (SELECT public.my_student_ids())))
);
CREATE POLICY fee_write_staff ON public.fee_invoices FOR ALL TO authenticated
  USING (public.get_my_role() = 'superadmin' OR (school_id = public.get_my_school_id() AND public.get_my_role() IN ('admin','accounts','principal')))
  WITH CHECK (public.get_my_role() = 'superadmin' OR (school_id = public.get_my_school_id() AND public.get_my_role() IN ('admin','accounts','principal')));