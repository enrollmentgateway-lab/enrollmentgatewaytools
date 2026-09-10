"use client";

import { useState } from "react";

const labelClass =
  "font-subheading text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-darkgray";
const inputClass =
  "mt-2 w-full rounded-brand border border-brand-darkgray/25 bg-brand-white px-3 py-2 font-body text-sm text-brand-black outline-none focus:border-brand-teal";

type Props = { productCount: number; emailConfigured: boolean };

export function CatalogActions({ productCount, emailConfigured }: Props) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const disabled = productCount === 0;

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setStatus(null);

    const response = await fetch("/api/admin/catalog/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, message }),
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      setStatus({ kind: "ok", text: `Catalog sent to ${to}.` });
      setTo("");
      setMessage("");
    } else {
      const fieldIssue = data.issues
        ? Object.values(data.issues as Record<string, string[]>)[0]?.[0]
        : null;
      setStatus({ kind: "error", text: fieldIssue ?? data.error ?? "The catalog could not be sent." });
    }
    setSending(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <section className="rounded-brand border border-brand-darkgray/20 p-6">
        <h2 className="rule-rust font-heading text-xl text-brand-black">Download or preview</h2>
        <p className="mt-5 font-body text-sm leading-relaxed text-brand-darkgray/80">
          Generates a fresh PDF from the current catalog, grouped by category with the same
          branding as the order form.
        </p>

        {disabled ? (
          <p className="mt-5 rounded-brand border border-brand-rust px-3 py-2 font-body text-sm text-brand-rust">
            Add at least one active product first.
          </p>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/api/admin/catalog/pdf"
              className="rounded-brand bg-brand-gold px-5 py-2.5 font-subheading text-xs font-semibold uppercase tracking-[0.14em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white"
            >
              Download PDF
            </a>
            <a
              href="/api/admin/catalog/pdf?inline=1"
              target="_blank"
              rel="noreferrer"
              className="rounded-brand border border-brand-darkgray/25 px-5 py-2.5 font-subheading text-xs font-semibold uppercase tracking-[0.14em] text-brand-darkgray transition-colors hover:border-brand-teal hover:text-brand-teal"
            >
              Preview in browser
            </a>
          </div>
        )}
      </section>

      <section className="rounded-brand border border-brand-darkgray/20 p-6">
        <h2 className="rule-rust font-heading text-xl text-brand-black">Email the catalog</h2>

        {!emailConfigured ? (
          <p className="mt-5 rounded-brand border border-brand-grayblue px-3 py-2 font-body text-sm text-brand-grayblue">
            Email is not configured yet. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and
            MAIL_FROM in your environment to enable sending.
          </p>
        ) : (
          <form onSubmit={handleSend} className="mt-5 space-y-4">
            <label className="block">
              <span className={labelClass}>Recipient</span>
              <input
                type="email"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Subject</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Gateway Seminary merchandise catalog"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </label>

            {status ? (
              <p
                className={`rounded-brand border px-3 py-2 font-body text-sm ${
                  status.kind === "ok"
                    ? "border-brand-teal text-brand-teal"
                    : "border-brand-rust text-brand-rust"
                }`}
              >
                {status.text}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={sending || disabled}
              className="rounded-brand bg-brand-gold px-5 py-2.5 font-subheading text-xs font-semibold uppercase tracking-[0.14em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send catalog"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
