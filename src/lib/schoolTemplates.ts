// Excel templates that mirror the database tables one-to-one.
// school_id and ids are filled automatically; links use readable keys
// (class_name, section_name, admission_number, employee_code, subject_name).
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

type Row = Record<string, unknown>;
export type TableKey =
  | "classes" | "sections" | "subjects" | "staff" | "students"
  | "guardians" | "teacher_assignments" | "timetable_slots" | "attendance";

export const TEMPLATES: { key: TableKey; label: string; required: string[]; columns: string[] }[] = [
  { key: "classes", label: "Classes", required: ["name"], columns: ["name", "grade_level"] },
  { key: "staff", label: "Staff", required: ["employee_code", "full_name"], columns: ["employee_code", "full_name", "designation", "department", "subject", "phone", "email", "joining_date", "status"] },
  { key: "sections", label: "Sections", required: ["class_name", "name"], columns: ["class_name", "name", "capacity", "class_teacher_employee_code"] },
  { key: "subjects", label: "Subjects", required: ["name"], columns: ["class_name", "name", "code"] },
  { key: "students", label: "Students", required: ["admission_number", "full_name"], columns: ["admission_number", "full_name", "class_name", "section_name", "roll_number", "date_of_birth", "gender", "house", "bus_route", "status"] },
  { key: "guardians", label: "Guardians", required: ["full_name"], columns: ["full_name", "phone", "email", "relation", "student_admission_number", "is_primary"] },
  { key: "teacher_assignments", label: "Teacher assignments", required: ["employee_code", "subject_name", "class_name", "section_name"], columns: ["employee_code", "subject_name", "class_name", "section_name"] },
  { key: "timetable_slots", label: "Timetable", required: ["class_name", "section_name", "weekday", "period_no"], columns: ["class_name", "section_name", "weekday", "period_no", "start_time", "end_time", "subject_name", "employee_code", "room"] },
  { key: "attendance", label: "Attendance", required: ["admission_number", "date", "status"], columns: ["admission_number", "date", "status", "remarks"] },
];

const SAMPLE: Record<TableKey, unknown[]> = {
  classes: ["Class 1", 1],
  sections: ["Class 1", "A", 40, "EMP001"],
  subjects: ["Class 1", "Mathematics", "MATH1"],
  staff: ["EMP001", "Priya Verma", "Teacher", "Academics", "Mathematics", "9876543210", "priya@school.in", "2024-04-01", "active"],
  students: ["ADM001", "Aarav Sharma", "Class 1", "A", "1", "2018-05-12", "Male", "Blue", "Route 3", "active"],
  guardians: ["Rakesh Sharma", "9876500000", "rakesh@mail.com", "Father", "ADM001", "yes"],
  teacher_assignments: ["EMP001", "Mathematics", "Class 1", "A"],
  timetable_slots: ["Class 1", "A", 1, 1, "08:00", "08:45", "Mathematics", "EMP001", "R-101"],
  attendance: ["ADM001", "2026-09-28", "present", ""],
};

export const s = (v: unknown) => (v === undefined || v === null ? "" : String(v).trim());
const n = (v: unknown) => { const x = parseInt(s(v), 10); return isNaN(x) ? null : x; };
const norm = (r: Row) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase().trim().replace(/\s+/g, "_"), v]));
function date(v: unknown) {
  if (typeof v === "number") { const d = XLSX.SSF.parse_date_code(v); return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`; }
  const t = s(v); return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null;
}
function time(v: unknown) {
  if (typeof v === "number") { const m = Math.round(v * 1440); return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; }
  return s(v) || null;
}

function sheetFor(t: (typeof TEMPLATES)[number]) {
  const ws = XLSX.utils.aoa_to_sheet([t.columns, SAMPLE[t.key]]);
  ws["!cols"] = t.columns.map((c) => ({ wch: Math.max(14, c.length + 2) }));
  return ws;
}
export function downloadOne(key: TableKey) {
  const t = TEMPLATES.find((x) => x.key === key)!;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheetFor(t), t.key);
  XLSX.writeFile(wb, `${t.key}-template.xlsx`);
}
export function downloadAll() {
  const wb = XLSX.utils.book_new();
  const help = XLSX.utils.aoa_to_sheet([
    ["How to use"],
    ["Each sheet matches one table. Keep the header row and sheet names unchanged. Delete the example row."],
    ["Fill in order: classes → staff → sections → subjects → students → guardians → teacher_assignments → timetable_slots → attendance."],
    ["Dates: YYYY-MM-DD. Times: HH:MM. weekday: 1=Mon … 6=Sat. Attendance status: present / absent / late / leave."],
  ]);
  XLSX.utils.book_append_sheet(wb, help, "README");
  TEMPLATES.forEach((t) => XLSX.utils.book_append_sheet(wb, sheetFor(t), t.key));
  XLSX.writeFile(wb, "school-data-template.xlsx");
}

/** Reads a workbook; returns rows per table (sheet name or single-sheet fallback). */
export async function readWorkbook(file: File, fallback?: TableKey) {
  const wb = XLSX.read(await file.arrayBuffer());
  const out: Partial<Record<TableKey, Row[]>> = {};
  for (const name of wb.SheetNames) {
    const key = (TEMPLATES.find((t) => t.key === name.trim().toLowerCase())?.key ?? (wb.SheetNames.length === 1 ? fallback : undefined));
    if (!key) continue;
    const rows = XLSX.utils.sheet_to_json<Row>(wb.Sheets[name], { defval: "" }).map(norm)
      .filter((r) => Object.values(r).some((v) => s(v) !== ""));
    if (rows.length) out[key] = rows;
  }
  return out;
}

export function validate(key: TableKey, rows: Row[]) {
  const t = TEMPLATES.find((x) => x.key === key)!;
  const errs: string[] = [];
  rows.forEach((r, i) => t.required.forEach((c) => { if (!s(r[c])) errs.push(`${key} row ${i + 2}: missing ${c}`); }));
  return errs;
}

async function lookups(schoolId: string) {
  const [c, sec, sub, st, stu] = await Promise.all([
    supabase.from("classes").select("id,name").eq("school_id", schoolId),
    supabase.from("sections").select("id,name,class_id").eq("school_id", schoolId),
    supabase.from("subjects").select("id,name,class_id").eq("school_id", schoolId),
    supabase.from("staff").select("id,employee_code").eq("school_id", schoolId),
    supabase.from("students").select("id,admission_number").eq("school_id", schoolId),
  ]);
  const cls = new Map((c.data ?? []).map((x) => [x.name.toLowerCase(), x.id]));
  const secs = new Map((sec.data ?? []).map((x) => [`${x.class_id}|${x.name.toLowerCase()}`, x.id]));
  const subs = new Map<string, string>();
  (sub.data ?? []).forEach((x) => { subs.set(`${x.class_id ?? ""}|${x.name.toLowerCase()}`, x.id); if (!subs.has(`*|${x.name.toLowerCase()}`)) subs.set(`*|${x.name.toLowerCase()}`, x.id); });
  const staff = new Map((st.data ?? []).map((x) => [x.employee_code.toLowerCase(), x.id]));
  const students = new Map((stu.data ?? []).map((x) => [x.admission_number.toLowerCase(), x.id]));
  const classId = (r: Row, k = "class_name") => cls.get(s(r[k]).toLowerCase()) ?? null;
  const sectionId = (r: Row) => { const cid = classId(r); return cid ? secs.get(`${cid}|${s(r.section_name).toLowerCase()}`) ?? null : null; };
  const subjectId = (r: Row) => { const nm = s(r.subject_name).toLowerCase(); if (!nm) return null; const cid = classId(r); return subs.get(`${cid ?? ""}|${nm}`) ?? subs.get(`*|${nm}`) ?? null; };
  return { classId, sectionId, subjectId, staffId: (r: Row) => staff.get(s(r.employee_code).toLowerCase()) ?? null, studentId: (v: unknown) => students.get(s(v).toLowerCase()) ?? null };
}

function need<T>(v: T | null, msg: string): T { if (!v) throw new Error(msg); return v; }

/** Imports one table's rows. Throws with a readable message on the first problem. */
export async function importTable(key: TableKey, rows: Row[], schoolId: string): Promise<number> {
  const L = await lookups(schoolId);
  const S = schoolId;
  const ins = async (table: string, payload: Row[]) => {
    const { error } = await supabase.from(table as never).insert(payload as never);
    if (error) throw new Error(`${table}: ${error.message}`);
    return payload.length;
  };
  switch (key) {
    case "classes": return ins("classes", rows.map((r) => ({ school_id: S, name: s(r.name), grade_level: n(r.grade_level) ?? n(s(r.name).replace(/\D/g, "")) })));
    case "sections": return ins("sections", rows.map((r, i) => ({ school_id: S, class_id: need(L.classId(r), `sections row ${i + 2}: class "${s(r.class_name)}" not found`), name: s(r.name), ...(n(r.capacity) ? { capacity: n(r.capacity) } : {}), class_teacher_staff_id: s(r.class_teacher_employee_code) ? need(L.staffId({ employee_code: r.class_teacher_employee_code }), `sections row ${i + 2}: class teacher "${s(r.class_teacher_employee_code)}" not found in Staff`) : null })));
    case "subjects": return ins("subjects", rows.map((r) => ({ school_id: S, class_id: L.classId(r), name: s(r.name), code: s(r.code) || null })));
    case "staff": return ins("staff", rows.map((r) => ({ school_id: S, employee_code: s(r.employee_code), full_name: s(r.full_name), designation: s(r.designation) || null, department: s(r.department) || null, subject: s(r.subject) || null, phone: s(r.phone) || null, email: s(r.email) || null, joining_date: date(r.joining_date), ...(s(r.status) ? { status: s(r.status).toLowerCase() } : {}) })));
    case "students": return ins("students", rows.map((r) => ({ school_id: S, admission_number: s(r.admission_number), full_name: s(r.full_name), class_id: L.classId(r), section_id: L.sectionId(r), roll_number: s(r.roll_number) || null, date_of_birth: date(r.date_of_birth), gender: s(r.gender) || null, house: s(r.house) || null, bus_route: s(r.bus_route) || null, ...(s(r.status) ? { status: s(r.status).toLowerCase() } : {}) })));
    case "guardians": {
      let count = 0;
      for (const [i, r] of rows.entries()) {
        const { data, error } = await supabase.from("guardians").insert({ school_id: S, full_name: s(r.full_name), phone: s(r.phone) || null, email: s(r.email) || null, relation: s(r.relation) || null }).select("id").single();
        if (error) throw new Error(`guardians row ${i + 2}: ${error.message}`);
        if (s(r.student_admission_number)) {
          const sid = need(L.studentId(r.student_admission_number), `guardians row ${i + 2}: student "${s(r.student_admission_number)}" not found`);
          const { error: e2 } = await supabase.from("student_guardians").insert({ student_id: sid, guardian_id: data.id, is_primary: !/^(no|false|0)$/i.test(s(r.is_primary)) });
          if (e2) throw new Error(`guardians row ${i + 2}: ${e2.message}`);
        }
        count++;
      }
      return count;
    }
    case "teacher_assignments": return ins("teacher_assignments", rows.map((r, i) => ({ school_id: S, staff_id: need(L.staffId(r), `row ${i + 2}: employee "${s(r.employee_code)}" not found`), subject_id: need(L.subjectId(r), `row ${i + 2}: subject "${s(r.subject_name)}" not found`), section_id: need(L.sectionId(r), `row ${i + 2}: section "${s(r.class_name)} ${s(r.section_name)}" not found`) })));
    case "timetable_slots": return ins("timetable_slots", rows.map((r, i) => ({ school_id: S, section_id: need(L.sectionId(r), `timetable row ${i + 2}: section "${s(r.class_name)} ${s(r.section_name)}" not found`), subject_id: L.subjectId(r), staff_id: L.staffId(r), weekday: n(r.weekday), period_no: n(r.period_no), start_time: time(r.start_time), end_time: time(r.end_time), room: s(r.room) || null })));
    case "attendance": {
      const payload = rows.map((r, i) => ({ school_id: S, student_id: need(L.studentId(r.admission_number), `attendance row ${i + 2}: student "${s(r.admission_number)}" not found`), date: need(date(r.date), `attendance row ${i + 2}: bad date`), status: s(r.status).toLowerCase(), remarks: s(r.remarks) || null }));
      const { error } = await supabase.from("attendance").upsert(payload, { onConflict: "student_id,date" });
      if (error) throw new Error(`attendance: ${error.message}`);
      return payload.length;
    }
  }
}
