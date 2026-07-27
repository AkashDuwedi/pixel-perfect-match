// @ts-nocheck
import React, { useState, useMemo, useRef } from "react";
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, X, Loader2, RefreshCw } from "lucide-react";
import {
  IMPORT_TYPES, getImportType, downloadTemplate, parseSpreadsheetFile,
  validateRows, summarize, downloadErrorReport,
} from "./dataImportUtils";

const STATUS_STYLE = {
  not_started: { label: "Not Started", className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
  uploaded: { label: "Uploaded", className: "bg-amber-50 text-amber-700" },
  needs_review: { label: "Needs Review", className: "bg-rose-50 text-rose-600" },
  live: { label: "Live", className: "bg-emerald-50 text-emerald-700" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.not_started;
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${s.className}`}>{s.label}</span>;
}

function OnboardingProgressCard({ importState }) {
  const liveCount = IMPORT_TYPES.filter((t) => (importState[t.key]?.status || "not_started") === "live").length;
  const pct = Math.round((liveCount / IMPORT_TYPES.length) * 100);
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12.5px] font-medium text-slate-600 dark:text-slate-300">Onboarding Progress</div>
        <div className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-200">Setup {pct}% complete</div>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {IMPORT_TYPES.map((t) => (
          <div key={t.key} className="flex items-center justify-between gap-2 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2">
            <span className="text-[12.5px] text-slate-700 dark:text-slate-200 font-medium truncate">{t.label}</span>
            <StatusBadge status={importState[t.key]?.status || "not_started"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ImportTypeUploader({ typeKey, record, classSectionKeys, onConfirm }) {
  const type = getImportType(typeKey);
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [preview, setPreview] = useState(null); // validated rows for the *pending* (unconfirmed) upload
  const [pendingReplace, setPendingReplace] = useState(false);

  const alreadyLive = record?.status === "live";
  const summary = preview ? summarize(preview) : null;

  async function handleFile(file) {
    if (!file) return;
    setParsing(true);
    setParseError(null);
    setPreview(null);
    try {
      const rows = await parseSpreadsheetFile(file);
      if (rows.length === 0) {
        setParseError("No rows found in this file. Please check it has a header row and at least one data row.");
        setParsing(false);
        return;
      }
      const validated = validateRows(typeKey, rows, { classSectionKeys });
      setPreview(validated);
    } catch (e) {
      setParseError(e.message || "Could not parse this file.");
    }
    setParsing(false);
  }

  function onInputChange(e) {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  function doConfirm(mode) {
    if (alreadyLive && !pendingReplace) {
      setPendingReplace(true);
      return;
    }
    const rowsToImport = mode === "skip-errors" ? preview.filter((r) => !r._hasBlockingError) : preview;
    onConfirm(typeKey, rowsToImport);
    setPreview(null);
    setPendingReplace(false);
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[14px] font-semibold text-slate-900 dark:text-white">{type.label}</div>
          <div className="text-[12px] text-slate-400 dark:text-slate-500">
            {record?.count ? `${record.count} rows currently live` : "No data imported yet"}
          </div>
        </div>
        <StatusBadge status={record?.status || "not_started"} />
      </div>

      <button
        onClick={() => downloadTemplate(typeKey)}
        className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-[12.5px] font-medium mb-3 hover:text-indigo-700"
      >
        <Download size={13} /> Download template ({type.headers.join(", ")})
      </button>

      {!preview && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border border-dashed rounded-xl py-6 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            dragActive ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10" : "border-slate-300 dark:border-slate-700 hover:border-indigo-300"
          }`}
        >
          {parsing ? (
            <Loader2 size={18} className="text-indigo-500 animate-spin" />
          ) : (
            <Upload size={18} className="text-slate-400" />
          )}
          <div className="text-[12.5px] text-slate-500 dark:text-slate-400">
            {parsing ? "Parsing file..." : "Drag & drop, or click to upload .csv or .xlsx"}
          </div>
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onInputChange} />
        </div>
      )}

      {parseError && (
        <div className="flex items-start gap-2 bg-rose-50 text-rose-600 rounded-lg px-3 py-2 text-[12.5px] mt-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {parseError}
        </div>
      )}

      {preview && summary && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[12.5px] text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-200">{summary.total} rows found</span>
              {" · "}
              <span className="text-emerald-600">{summary.valid} valid</span>
              {summary.invalid > 0 && <> {" · "}<span className="text-rose-500">{summary.invalid} need attention</span></>}
            </div>
            <button onClick={() => { setPreview(null); setPendingReplace(false); }} className="text-slate-400 hover:text-slate-600">
              <X size={15} />
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-3">
            <div className="overflow-x-auto overflow-y-auto max-h-64">
              <table className="w-full text-left text-[12px]">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {type.headers.map((h) => (
                      <th key={h} className="font-medium px-3 py-2 text-slate-400 dark:text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-t border-slate-100 dark:border-slate-800 ${row._hasBlockingError ? "border-l-4 border-l-rose-500" : ""}`}
                    >
                      {type.headers.map((h) => (
                        <td key={h} className="px-3 py-2 whitespace-nowrap text-slate-700 dark:text-slate-200">
                          {row[h]}
                          {row._rowErrors[h] && (
                            <div className="text-rose-500 text-[10.5px] mt-0.5">{row._rowErrors[h]}</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 20 && (
              <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 py-2 border-t border-slate-100 dark:border-slate-800">
                Showing first 20 of {preview.length} rows
              </div>
            )}
          </div>

          {summary.invalid > 0 && (
            <button
              onClick={() => downloadErrorReport(typeKey, preview)}
              className="text-[12px] text-rose-500 font-medium mb-3 hover:text-rose-600"
            >
              Download error report ({summary.invalid} rows)
            </button>
          )}

          {pendingReplace && (
            <div className="flex items-start gap-2 bg-amber-50 text-amber-700 rounded-lg px-3 py-2 text-[12.5px] mb-3">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              This will replace the {record.count} rows currently live for {type.label.toLowerCase()}. Confirm again to proceed.
            </div>
          )}

          <div className="flex gap-2">
            <button
              disabled={summary.valid === 0}
              onClick={() => doConfirm("all")}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg py-2 text-[13px] font-medium flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              {summary.invalid === 0
                ? (pendingReplace ? "Confirm replace" : "Confirm import")
                : `Import ${summary.valid} valid rows, skip ${summary.invalid}`}
            </button>
          </div>
        </div>
      )}

      {!preview && alreadyLive && (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-2 hover:text-slate-700"
        >
          <RefreshCw size={12} /> Re-upload to append or replace
        </button>
      )}
    </div>
  );
}

export default function DataImportSection({ school, importState, onConfirmImport }) {
  const [activeType, setActiveType] = useState("students");

  const classSectionKeys = useMemo(() => {
    const classesRecord = importState.classes;
    if (!classesRecord || classesRecord.status !== "live") return new Set();
    return new Set(classesRecord.rows.map((r) => `${r.class}||${r.section}`));
  }, [importState.classes]);

  return (
    <div>
      <OnboardingProgressCard importState={importState} />

      <div className="flex gap-1.5 mb-3 overflow-x-auto">
        {IMPORT_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveType(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap shrink-0 ${
              activeType === t.key
                ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
            }`}
          >
            <FileSpreadsheet size={13} /> {t.label}
          </button>
        ))}
      </div>

      <ImportTypeUploader
        key={activeType}
        typeKey={activeType}
        record={importState[activeType]}
        classSectionKeys={activeType === "students" ? classSectionKeys : undefined}
        onConfirm={(typeKey, rows) => onConfirmImport(school.id, typeKey, rows)}
      />

      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3">
        School Admins only see the finished result (populated staff directory, student rosters, fee structure) — not this import tool.
      </p>
    </div>
  );
}
