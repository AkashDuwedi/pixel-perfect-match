-- =========================================================
-- 1. SCHOOLS
-- =========================================================
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  city TEXT,
  board TEXT,
  principal_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 2. Convert profiles.school_id text -> uuid FK
-- =========================================================
DROP POLICY IF EXISTS "Staff can view same-school profiles" ON public.profiles;

ALTER TABLE public.profiles
  ALTER COLUMN school_id DROP DEFAULT,
  ALTER COLUMN school_id TYPE UUID USING NULLIF(school_id, '')::uuid;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_school_id_fkey
  FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;

-- Rewrite helpers to return uuid
DROP FUNCTION IF EXISTS public.get_my_school_id();
CREATE FUNCTION public.get_my_school_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT school_id FROM public.profiles WHERE id = auth.uid() $$;

CREATE POLICY "Staff can view same-school profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (school_id IS NOT NULL AND school_id = public.get_my_school_id());

-- Rewrite handle_new_user to cast school_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, school_id, is_demo)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'parent'),
    NULLIF(NEW.raw_user_meta_data->>'school_id','')::uuid,
    COALESCE((NEW.raw_user_meta_data->>'is_demo')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

-- =========================================================
-- 3. CLASSES / SECTIONS
-- =========================================================
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,           -- e.g. "Class 3"
  grade_level INT,              -- e.g. 3
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,           -- "A"
  capacity INT NOT NULL DEFAULT 40,
  class_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sections TO authenticated;
GRANT ALL ON public.sections TO service_role;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 4. GUARDIANS
-- =========================================================
CREATE TABLE public.guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- optional login
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  relation TEXT,               -- Father, Mother, Guardian
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardians TO authenticated;
GRANT ALL ON public.guardians TO service_role;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 5. STUDENTS
-- =========================================================
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- optional student login
  full_name TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  roll_number TEXT,
  date_of_birth DATE,
  gender TEXT,
  house TEXT,
  bus_route TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, admission_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.student_guardians (
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (student_id, guardian_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_guardians TO authenticated;
GRANT ALL ON public.student_guardians TO service_role;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 6. STAFF
-- =========================================================
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  designation TEXT,           -- Teacher, Principal, Counselor...
  department TEXT,
  subject TEXT,
  phone TEXT,
  email TEXT,
  joining_date DATE,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, employee_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 7. RLS POLICIES (same-school read; superadmin/admin write)
-- =========================================================
-- Helper: is caller admin-ish?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.get_my_role() IN ('superadmin','admin') $$;

-- Schools
CREATE POLICY schools_select_same ON public.schools FOR SELECT TO authenticated
  USING (id = public.get_my_school_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY schools_write_admin ON public.schools FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Generic same-school policies for the other tables
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['classes','sections','guardians','students','staff']) LOOP
    EXECUTE format('
      CREATE POLICY %I ON public.%I FOR SELECT TO authenticated
      USING (school_id = public.get_my_school_id() OR public.get_my_role() = ''superadmin'');',
      t||'_select_same', t);
    EXECUTE format('
      CREATE POLICY %I ON public.%I FOR ALL TO authenticated
      USING (public.is_admin() AND (school_id = public.get_my_school_id() OR public.get_my_role() = ''superadmin''))
      WITH CHECK (public.is_admin() AND (school_id = public.get_my_school_id() OR public.get_my_role() = ''superadmin''));',
      t||'_write_admin', t);
  END LOOP;
END $$;

-- student_guardians: piggyback on student's school
CREATE POLICY sg_select ON public.student_guardians FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id
    AND (s.school_id = public.get_my_school_id() OR public.get_my_role()='superadmin')));
CREATE POLICY sg_write ON public.student_guardians FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================
-- 8. updated_at trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['schools','classes','sections','guardians','students','staff']) LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();', t);
  END LOOP;
END $$;

-- =========================================================
-- 9. SEED demo school + link superadmin + demo rows
-- =========================================================
WITH new_school AS (
  INSERT INTO public.schools (name, code, city, board, principal_name)
  VALUES ('Vedaalay Demo School', 'VDS-001', 'Bengaluru', 'CBSE', 'Dr. Meera Iyer')
  RETURNING id
),
linked AS (
  UPDATE public.profiles
     SET school_id = (SELECT id FROM new_school)
   WHERE id = '41252846-e0d1-469d-b0c0-a0cb05005e8c'
   RETURNING id
),
cls AS (
  INSERT INTO public.classes (school_id, name, grade_level)
  SELECT (SELECT id FROM new_school), x.name, x.g
  FROM (VALUES ('Class 1',1),('Class 2',2),('Class 3',3),('Class 4',4),('Class 5',5)) AS x(name,g)
  RETURNING id, name
),
sec AS (
  INSERT INTO public.sections (school_id, class_id, name, capacity)
  SELECT (SELECT id FROM new_school), c.id, s.name, 40
  FROM cls c CROSS JOIN (VALUES ('A'),('B')) AS s(name)
  RETURNING id, class_id, name
),
g AS (
  INSERT INTO public.guardians (school_id, full_name, phone, email, relation)
  VALUES
    ((SELECT id FROM new_school),'Rakesh Sharma','9876543210','rakesh.sharma@example.com','Father'),
    ((SELECT id FROM new_school),'Priya Verma','9876543211','priya.verma@example.com','Mother'),
    ((SELECT id FROM new_school),'Anil Kumar','9876543212','anil.kumar@example.com','Father'),
    ((SELECT id FROM new_school),'Sunita Rao','9876543213','sunita.rao@example.com','Mother')
  RETURNING id, full_name
),
stu AS (
  INSERT INTO public.students (school_id, class_id, section_id, full_name, admission_number, roll_number, date_of_birth, gender, house)
  SELECT (SELECT id FROM new_school),
         (SELECT id FROM cls WHERE name = v.cls),
         (SELECT id FROM sec WHERE class_id=(SELECT id FROM cls WHERE name=v.cls) AND name=v.sec),
         v.full_name, v.adm, v.roll, v.dob::date, v.gender, v.house
  FROM (VALUES
    ('Aarav Sharma','ADM-2026-001','1','2016-04-12','M','Red House','Class 3','A'),
    ('Isha Verma','ADM-2026-002','2','2016-06-18','F','Blue House','Class 3','A'),
    ('Rohan Kumar','ADM-2026-003','3','2015-02-05','M','Green House','Class 4','A'),
    ('Ananya Rao','ADM-2026-004','4','2015-09-22','F','Yellow House','Class 4','B'),
    ('Kabir Singh','ADM-2026-005','5','2014-11-30','M','Red House','Class 5','A'),
    ('Meera Nair','ADM-2026-006','6','2014-07-14','F','Blue House','Class 5','B')
  ) AS v(full_name,adm,roll,dob,gender,house,cls,sec)
  RETURNING id, admission_number
)
INSERT INTO public.student_guardians (student_id, guardian_id, is_primary)
SELECT s.id, g.id, true
FROM stu s
JOIN g ON (s.admission_number='ADM-2026-001' AND g.full_name='Rakesh Sharma')
       OR (s.admission_number='ADM-2026-002' AND g.full_name='Priya Verma')
       OR (s.admission_number='ADM-2026-003' AND g.full_name='Anil Kumar')
       OR (s.admission_number='ADM-2026-004' AND g.full_name='Sunita Rao')
       OR (s.admission_number='ADM-2026-005' AND g.full_name='Rakesh Sharma')
       OR (s.admission_number='ADM-2026-006' AND g.full_name='Priya Verma');

-- Sample staff rows (not tied to auth logins yet)
INSERT INTO public.staff (school_id, employee_code, full_name, designation, department, subject, phone, email, joining_date, status)
SELECT id, v.code, v.name, v.desig, v.dept, v.subj, v.phone, v.email, v.jd::date, 'Active'
FROM public.schools, (VALUES
  ('EMP-001','Ms. Kavita Rao','Teacher','Academics','Science','9876500001','kavita.rao@vedaalay.com','2022-06-01'),
  ('EMP-002','Mr. Arjun Mehta','Teacher','Academics','Mathematics','9876500002','arjun.mehta@vedaalay.com','2021-07-15'),
  ('EMP-003','Ms. Neha Gupta','Counselor','Wellbeing',NULL,'9876500003','neha.gupta@vedaalay.com','2023-01-10'),
  ('EMP-004','Dr. Meera Iyer','Principal','Administration',NULL,'9876500004','meera.iyer@vedaalay.com','2020-04-01')
) AS v(code,name,desig,dept,subj,phone,email,jd)
WHERE public.schools.code = 'VDS-001';