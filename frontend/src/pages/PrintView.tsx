import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, Loader2, Printer } from "lucide-react";
import { apiGet } from "@/lib/api";
import { fetchMe } from "@/lib/auth";
import type { LessonDocument } from "@/lib/types";
import { DocumentSheet } from "@/components/DocumentSheet";
import { Button } from "@/components/ui/button";

export default function PrintView() {
  const { id } = useParams<{ id: string }>();
  const me = useQuery({ queryKey: ["auth", "me"], queryFn: fetchMe, retry: false });
  const doc = useQuery({
    queryKey: ["document", id],
    queryFn: () => apiGet<LessonDocument>(`/documents/${id}`),
  });

  if (doc.isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!doc.data) {
    return (
      <div className="no-print flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-100 text-center">
        <p className="font-heading text-xl font-bold">Dokumen tidak ditemukan</p>
        <p className="text-sm text-muted-foreground">
          Dokumen mungkin telah dihapus atau bukan milik akun ini.
        </p>
        <Link to="/dashboard">
          <Button variant="outline" data-testid="print-back-button">
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Dasbor
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-6 flex max-w-[794px] flex-wrap items-center justify-between gap-3 px-4">
        <Link to="/dashboard">
          <Button variant="outline" data-testid="print-back-button">
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Dasbor
          </Button>
        </Link>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/documents/${doc.data.id}/export.docx`} download data-testid="print-page-word-button">
            <Button variant="outline"><FileText className="mr-1 h-4 w-4" /> Unduh Word (.docx)</Button>
          </a>
          <Button data-testid="print-page-print-button" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" /> Cetak / Unduh PDF
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto px-4 print:overflow-visible print:p-0">
        <DocumentSheet doc={doc.data} profile={me.data ?? null} />
      </div>
    </div>
  );
}
