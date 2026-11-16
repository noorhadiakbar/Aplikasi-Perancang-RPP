// Builds a single self-contained .html archive: every document rendered with the exact
// print styles (CSS inlined from the live stylesheets), openable and printable offline.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DocumentSheet } from "@/components/DocumentSheet";
import { DOC_TYPE_LABELS } from "@/lib/pedagogy";
import type { LessonDocument, User } from "@/lib/types";

function collectCss(): string {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) chunks.push(rule.cssText);
    } catch {
      // cross-origin sheet — skip
    }
  }
  return chunks.join("\n");
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

export function buildOfflineHtml(docs: LessonDocument[], profile: User): string {
  const toc = docs
    .map(
      (d, i) =>
        `<li><a href="#doc-${i}">[${esc(DOC_TYPE_LABELS[d.doc_type] ?? d.doc_type)}] ${esc(d.title || "Tanpa judul")}</a> — ${esc(d.subject)} ${esc(d.level)} ${d.grade ? `Kelas ${esc(d.grade)}` : ""}</li>`
    )
    .join("");
  const sheets = docs
    .map(
      (d, i) =>
        `<section id="doc-${i}" class="offline-doc">${renderToStaticMarkup(createElement(DocumentSheet, { doc: d, profile }))}<p class="no-print offline-top"><a href="#top">? Kembali ke daftar isi</a></p></section>`
    )
    .join("");
  const stamp = new Date().toLocaleString("id-ID");
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Arsip Offline PerancangRPP — ${esc(profile.school || profile.name)}</title>
<style>${collectCss()}
body{background:#f1f5f9;padding:24px 12px;font-family:'DM Sans Variable',system-ui,sans-serif}
.offline-head{max-width:794px;margin:0 auto 24px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px}
.offline-head a{color:#0F4C81}.offline-head li{margin:4px 0}
.offline-doc{margin:0 auto 32px}.offline-top{text-align:center;margin-top:8px}
@media print{.offline-doc{break-after:page}body{padding:0}}
</style></head>
<body id="top">
<div class="offline-head no-print">
<h1 style="font-size:20px;font-weight:700;color:#0F4C81">Arsip Offline Perangkat Pembelajaran</h1>
<p style="font-size:13px;color:#64748b">${esc(profile.name)} — ${esc(profile.school)} · diekspor ${esc(stamp)} · ${docs.length} dokumen. File ini dapat dibuka tanpa internet. Tekan Ctrl+P untuk mencetak semua dokumen.</p>
<button onclick="window.print()" style="margin-top:8px;background:#0F4C81;color:#fff;border-radius:8px;padding:6px 14px">Cetak Semua</button>
<ol style="margin-top:12px;font-size:13px;list-style:decimal;padding-left:20px">${toc}</ol>
</div>
${sheets}
</body></html>`;
}

export function downloadText(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
