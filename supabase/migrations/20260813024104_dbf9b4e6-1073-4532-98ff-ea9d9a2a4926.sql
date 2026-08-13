CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  module text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissions_read" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "permissions_write_admin" ON public.permissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission_key text NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission_key)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_permissions_read" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "role_permissions_write_admin" ON public.role_permissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, school_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_read_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() = 'superadmin' OR (public.is_admin() AND school_id = public.get_my_school_id()));
CREATE POLICY "user_roles_write_admin" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin() AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'))
  WITH CHECK (public.is_admin() AND (school_id = public.get_my_school_id() OR public.get_my_role() = 'superadmin'));

INSERT INTO public.permissions (key, module, action, description) VALUES
  ('students.read','students','read','View students'),
  ('students.write','students','write','Create/edit students'),
  ('staff.read','staff','read','View staff'),
  ('staff.write','staff','write','Create/edit staff'),
  ('classes.read','classes','read','View classes and sections'),
  ('classes.write','classes','write','Create/edit classes and sections'),
  ('attendance.read','attendance','read','View attendance'),
  ('attendance.write','attendance','write','Mark attendance'),
  ('fees.read','fees','read','View fees'),
  ('fees.write','fees','write','Manage fees'),
  ('exams.read','exams','read','View exams and marks'),
  ('exams.write','exams','write','Manage exams and marks'),
  ('reports.read','reports','read','View reports'),
  ('settings.write','settings','write','Manage school settings')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_key)
SELECT r.role, p.key FROM public.permissions p
CROSS JOIN (VALUES ('superadmin'::public.app_role), ('admin'::public.app_role)) AS r(role)
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('principal','students.read'),('principal','staff.read'),('principal','classes.read'),
  ('principal','attendance.read'),('principal','fees.read'),('principal','exams.read'),('principal','reports.read'),
  ('coordinator','students.read'),('coordinator','classes.read'),('coordinator','classes.write'),
  ('coordinator','attendance.read'),('coordinator','exams.read'),('coordinator','reports.read'),
  ('teacher','students.read'),('teacher','classes.read'),('teacher','attendance.read'),
  ('teacher','attendance.write'),('teacher','exams.read'),('teacher','exams.write'),
  ('counselor','students.read'),('counselor','attendance.read'),('counselor','reports.read'),
  ('receptionist','students.read'),('receptionist','staff.read'),('receptionist','attendance.read'),
  ('accounts','students.read'),('accounts','fees.read'),('accounts','fees.write'),('accounts','reports.read'),
  ('hr','staff.read'),('hr','staff.write'),('hr','reports.read'),
  ('parent','students.read'),('parent','attendance.read'),('parent','fees.read'),('parent','exams.read'),
  ('student','attendance.read'),('student','exams.read')
ON CONFLICT DO NOTHING;
