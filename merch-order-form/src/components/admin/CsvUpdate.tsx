"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ImportResult = {
  dryRun: boolean;
  created: number;
  updated: number;
  errors: { line: number; message: string }[];
};

export function CsvUpdate({ columns }: { columns: string[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [applied, setApplied] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function clearFile() {
    setFile(null);
    setPreview(null);
    setApplied(null);
    setError(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function send(dryRun: boolean) {
    if (!file) return;
    setPending(true);
    setError(null);

    const body = new FormData();
    body.append("file", file);
    body.append("dryRun", String(dryRun));

    const response = await fetch("/api/admin/products/import", { method: "POST", body });
    const data = await response.json().catch(() => ({}));
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? "The file could not be read.");
      setPreview(null);
      return;
    }

    if (dryRun) {
      setPreview(data);
      setApplied(null);
      return;
    }

    setApplied(data);
    setPreview(null);
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`rounded-brand border px-4 py-2.5 font-subheading text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
          open
            ? "border-brand-teal text-brand-teal"
            : "border-brand-darkgray/25 text-brand-darkgray hover:border-brand-black hover:text-brand-black"
        }`}
      >
        Update by CSV
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full z-20 mt-2 w-[min(30rem,calc(100vw-3rem))] rounded-brand border border-brand-darkgray/25 bg-brand-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <h3 className="rule-rust font-heading text-lg text-brand-black">Update by CSV</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="font-body text-lg leading-none text-brand-darkgray/60 hover:text-brand-black"
              >
                ×
              </button>
            </div>

            <p className="mt-5 font-body text-sm leading-relaxed text-brand-darkgray/80">
              Download the catalog, edit it in Excel or Sheets, then upload it back. Rows match on
              SKU — known SKUs are updated, new ones added. Nothing is ever deleted.
            </p>

            {/* A real navigation, not a client-side route change — otherwise the file never downloads. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api/admin/products/export"
              className="mt-5 inline-block rounded-brand border border-brand-darkgray/25 px-4 py-2 font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-darkgray transition-colors hover:border-brand-teal hover:text-brand-teal"
            >
              Download current catalog
            </a>

            <div className="mt-6 border-t border-brand-darkgray/15 pt-5">
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setPreview(null);
                  setApplied(null);
                  setError(null);
                }}
                className="block w-full font-body text-sm text-brand-darkgray file:mr-3 file:rounded-brand file:border file:border-brand-darkgray/25 file:bg-brand-white file:px-3 file:py-1.5 file:font-subheading file:text-[0.625rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-brand-darkgray"
              />

              {error ? (
                <p className="mt-4 rounded-brand border border-brand-rust px-3 py-2 font-body text-sm text-brand-rust">
                  {error}
                </p>
              ) : null}

              {preview ? (
                <div className="mt-4 rounded-brand border border-brand-teal px-3 py-2">
                  <p className="font-body text-sm text-brand-teal">
                    Ready to apply: <strong>{preview.created}</strong> new,{" "}
                    <strong>{preview.updated}</strong> updated.
                  </p>
                  <IssueList issues={preview.errors} />
                </div>
              ) : null}

              {applied ? (
                <div className="mt-4 rounded-brand border border-brand-teal px-3 py-2">
                  <p className="font-body text-sm text-brand-teal">
                    Imported: <strong>{applied.created}</strong> added,{" "}
                    <strong>{applied.updated}</strong> updated.
                  </p>
                  <IssueList issues={applied.errors} />
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                {preview ? (
                  <button
                    type="button"
                    onClick={() => send(false)}
                    disabled={pending}
                    className="rounded-brand bg-brand-gold px-4 py-2 font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white disabled:opacity-60"
                  >
                    {pending ? "Applying…" : "Apply import"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => send(true)}
                    disabled={!file || pending}
                    className="rounded-brand bg-brand-gold px-4 py-2 font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white disabled:opacity-60"
                  >
                    {pending ? "Checking…" : "Check file"}
                  </button>
                )}

                {file || preview || applied ? (
                  <button
                    type="button"
                    onClick={clearFile}
                    className="rounded-brand border border-brand-darkgray/25 px-4 py-2 font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-darkgray transition-colors hover:border-brand-black hover:text-brand-black"
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              <p className="mt-5 font-body text-xs leading-relaxed text-brand-darkgray/70">
                Columns: {columns.join(", ")}. Only <strong>sku</strong> is required; a blank cell
                leaves that field unchanged. Set <strong>active</strong> to <strong>no</strong> to
                hide an item. Images are uploaded on the product page, not by CSV.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function IssueList({ issues }: { issues: { line: number; message: string }[] }) {
  if (issues.length === 0) return null;

  return (
    <div className="mt-2 border-t border-brand-darkgray/15 pt-2">
      <p className="font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-rust">
        {issues.length} row{issues.length === 1 ? "" : "s"} skipped
      </p>
      <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
        {issues.map((issue, index) => (
          <li key={index} className="font-body text-xs text-brand-darkgray">
            Line {issue.line}: {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
