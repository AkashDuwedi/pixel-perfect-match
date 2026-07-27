// @ts-nocheck
// Shared utilities for the Super Admin "Data Import" onboarding feature.
// Handles: template generation, CSV/XLSX parsing, and per-row validation
// for the four importable data types (Students, Staff, Classes & Sections, Fee Structure).
import * as XLSX from "xlsx";

export const IMPORT_TYPES = [
  {
    key: "students",
    label: "Students",
    headers: [
      "name", "date_of_birth", "class", "section", "roll_number", "admission_number",
      "parent_name", "parent_phone", "parent_email", "house", "bus_route",
    ],
    required: ["name", "date_of_birth", "class", "section", "roll_number", "admission_number", "parent_name", "parent_phone"],
    sampleRow: {
      name: "Aarav Sharma", date_of_birth: "12-04-2016", class: "Class 3", section: "A", roll_number: "14",
      admission_number: "ADM-2026-014", parent_name: "Rakesh Sharma", parent_phone: "9876543210",
      parent_email: "rakesh.sharma@example.com", house: "Red House", bus_route: "Route 1",
    },
  },
  {
    key: "staff",
    label: "Staff",
    headers: ["name", "role", "subject_or_department", "email", "phone", "status"],
    required: ["name", "role", "email", "phone", "status"],
    sampleRow: {
      name: "Ms. Kavita Rao", role: "Teacher", subject_or_department: "Science",
      email: "kavita.rao@example.edu", phone: "9876500000", status: "Active",
    },
  },
  {
    key: "classes",
    label: "Classes & Sections",
    headers: ["class", "section", "capacity", "class_teacher_name"],
    required: ["class", "section", "capacity"],
    sampleRow: { class: "Class 4", section: "A", capacity: "40", class_teacher_name: "Ms. Kavita Rao" },
  },
  {
    key: "fees",
    label: "Fee Structure",
    headers: ["fee_head_name", "term", "amount"],
    required: ["fee_head_name", "term", "amount"],
    sampleRow: { fee_head_name: "Tuition Fee", term: "Per term", amount: "18000" },
  },
];

export function getImportType(key) {
  return IMPORT_TYPES.find((t) => t.key === key);
}

/* ---------------------------------------------------------
   Template generation
--------------------------------------------------------- */

export function toCSV(headers, rows) {
  const escape = (val) => {
    const s = val === undefined || val === null ? "" : String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

export function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadTemplate(typeKey) {
  const type = getImportType(typeKey);
  if (!type) return;
  const csv = toCSV(type.headers, [type.sampleRow]);
  downloadCSV(`${typeKey}-import-template.csv`, csv);
}

/* ---------------------------------------------------------
   File parsing (CSV via a small hand-rolled parser, XLSX via SheetJS)
--------------------------------------------------------- */

function parseCSVText(text) {
  // Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes, commas/newlines inside quotes.
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function rowsToObjects(rawRows) {
  if (rawRows.length === 0) return [];
  const headers = rawRows[0].map((h) => String(h).trim().toLowerCase().replace(/\s+/g, "_"));
  return rawRows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = r[idx] !== undefined ? String(r[idx]).trim() : ""; });
    return obj;
  });
}

// Reads a File (.csv or .xlsx) and resolves to an array of row objects keyed by header name.
export function parseSpreadsheetFile(file) {
  const isXlsx = /\.xlsx?$/i.test(file.name);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    if (isXlsx) {
      reader.onload = () => {
        try {
          const workbook = XLSX.read(reader.result, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false, defval: "" });
          resolve(rowsToObjects(rawRows));
        } catch (e) {
          reject(new Error("This file doesn't look like a valid Excel file."));
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = () => {
        try {
          const rawRows = parseCSVText(String(reader.result));
          resolve(rowsToObjects(rawRows));
        } catch (e) {
          reject(new Error("This file doesn't look like a valid CSV file."));
        }
      };
      reader.readAsText(file);
    }
  });
}

/* ---------------------------------------------------------
   Validation
--------------------------------------------------------- */

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldError(type, field, value, row, allRows, classSectionKeys) {
  const isRequired = type.required.includes(field);
  if (isRequired && (!value || String(value).trim() === "")) {
    return `Missing ${field.replace(/_/g, " ")}`;
  }
  if (!value) return null;

  if (type.key === "students") {
    if (field === "parent_phone" && !PHONE_RE.test(value.replace(/\D/g, ""))) return "Invalid phone format";
    if (field === "parent_email" && value && !EMAIL_RE.test(value)) return "Invalid email format";
    if (field === "roll_number") {
      const key = `${row.class}||${row.section}||${value}`;
      const dupCount = allRows.filter((r) => `${r.class}||${r.section}||${r.roll_number}` === key).length;
      if (dupCount > 1) return `Duplicate roll number in ${row.class} - ${row.section}`;
    }
    if (field === "class" && classSectionKeys && classSectionKeys.size > 0) {
      const key = `${row.class}||${row.section}`;
      if (!classSectionKeys.has(key)) return null; // warn-only, handled separately as a non-blocking note
    }
  }
  if (type.key === "staff") {
    if (field === "phone" && !PHONE_RE.test(value.replace(/\D/g, ""))) return "Invalid phone format";
    if (field === "email" && !EMAIL_RE.test(value)) return "Invalid email format";
  }
  if (type.key === "classes") {
    if (field === "capacity" && (isNaN(Number(value)) || Number(value) <= 0)) return "Capacity must be a positive number";
  }
  if (type.key === "fees") {
    if (field === "amount" && (isNaN(Number(value)) || Number(value) <= 0)) return "Amount must be a positive number";
  }
  return null;
}

// Validates all rows for a given import type. Returns rows annotated with
// `_rowErrors` (blocking, field -> message) and `_rowWarnings` (non-blocking notes).
export function validateRows(typeKey, rows, context = {}) {
  const type = getImportType(typeKey);
  const classSectionKeys = context.classSectionKeys || null;

  return rows.map((row) => {
    const errors = {};
    let hasBlocking = false;
    for (const field of type.headers) {
      const msg = fieldError(type, field, row[field], row, rows, classSectionKeys);
      if (msg) { errors[field] = msg; hasBlocking = true; }
    }
    const warnings = {};
    if (type.key === "students" && classSectionKeys && classSectionKeys.size > 0 && row.class && row.section) {
      const key = `${row.class}||${row.section}`;
      if (!classSectionKeys.has(key)) warnings.class = `"${row.class} - ${row.section}" not found in Classes & Sections import`;
    }
    return { ...row, _rowErrors: errors, _hasBlockingError: hasBlocking, _rowWarnings: warnings };
  });
}

export function summarize(validatedRows) {
  const total = validatedRows.length;
  const invalid = validatedRows.filter((r) => r._hasBlockingError).length;
  return { total, valid: total - invalid, invalid };
}

export function downloadErrorReport(typeKey, validatedRows) {
  const type = getImportType(typeKey);
  const failed = validatedRows.filter((r) => r._hasBlockingError);
  const headers = [...type.headers, "errors"];
  const rows = failed.map((r) => ({
    ...r,
    errors: Object.values(r._rowErrors).join("; "),
  }));
  const csv = toCSV(headers, rows);
  downloadCSV(`${typeKey}-import-errors.csv`, csv);
}
