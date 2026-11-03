"use client";

import { useState } from "react";
import { Copy, Download, Printer, X } from "lucide-react";
import type { IssuedPass } from "@/app/admin/finals-actions";

function csv(passes: IssuedPass[]) {
  const cell = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
  return ["Name,Login ID,Pass", ...passes.map((p) => [p.name, p.loginId, p.pass].map(cell).join(","))].join("\r\n");
}

/** Newly issued logins. Passes are never stored in plain text, so this is the only time they can be read. */
export function IssuedPasses({ passes, onDismiss }: { passes: IssuedPass[]; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);
  if (!passes.length) return null;

  const loginUrl = `${window.location.origin}/portal/login`;
  const text = passes.map((p) => `${p.name}\nLogin ID: ${p.loginId}\nPass: ${p.pass}`).join("\n\n");

  function download() {
    const url = URL.createObjectURL(new Blob([`﻿${csv(passes)}`], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `innovahack-passes-${Date.now()}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }

  function print() {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
    w.document.write(`<!doctype html><title>InnovaHack passes</title>
<style>body{font-family:system-ui,sans-serif;margin:24px}.g{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.c{border:2px solid #171717;padding:16px;break-inside:avoid}.k{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#941b45}
.n{font-size:20px;font-weight:700;margin:6px 0 12px}.m{font-family:ui-monospace,monospace;font-size:18px;letter-spacing:.06em}
.u{font-size:12px;color:#5a5348;margin-top:10px}</style>
<div class="g">${passes
      .map(
        (p) => `<div class="c"><div class="k">InnovaHack · Finals pass</div><div class="n">${esc(p.name)}</div>
<div>Login ID <span class="m">${esc(p.loginId)}</span></div><div>Pass <span class="m">${esc(p.pass)}</span></div>
<div class="u">Sign in at ${esc(loginUrl)}</div></div>`,
      )
      .join("")}</div><script>print()</script>`);
    w.document.close();
  }

  return (
    <section aria-label="New passes" className="mt-6 border-2 border-ink bg-taxi/30 p-5 shadow-[6px_6px_0_0_var(--color-ink)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            {passes.length} new pass{passes.length === 1 ? "" : "es"} — save them now
          </p>
          <p className="text-sm text-charcoal">They can&apos;t be shown again. If one is lost, issue a new pass.</p>
        </div>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="grid size-8 place-items-center hover:bg-paper-white">
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={download} className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper-white px-3 py-1.5 text-sm font-semibold hover:bg-taxi">
          <Download aria-hidden className="size-4" /> Download CSV
        </button>
        <button type="button" onClick={print} className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper-white px-3 py-1.5 text-sm font-semibold hover:bg-taxi">
          <Printer aria-hidden className="size-4" /> Print pass cards
        </button>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
          }}
          className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper-white px-3 py-1.5 text-sm font-semibold hover:bg-taxi"
        >
          <Copy aria-hidden className="size-4" /> {copied ? "Copied" : "Copy all"}
        </button>
      </div>
      <div className="mt-4 max-h-80 overflow-auto border-2 border-ink bg-paper-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-ink bg-paper-deep">
            <tr>
              <th scope="col" className="px-3 py-2">Name</th>
              <th scope="col" className="px-3 py-2">Login ID</th>
              <th scope="col" className="px-3 py-2">Pass</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {passes.map((p) => (
              <tr key={p.loginId}>
                <td className="px-3 py-2 font-semibold">{p.name}</td>
                <td className="px-3 py-2 font-mono">{p.loginId}</td>
                <td className="px-3 py-2 font-mono">{p.pass}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
