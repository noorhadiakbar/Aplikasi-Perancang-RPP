import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, ClipboardCheck, DatabaseBackup, FileText, Loader2, Pencil, Plus, Printer, Search, Trash2 } from "lucide-react";
import type { BackupStatus } from "@/lib/types";
import { apiDelete, apiGet } from "@/lib/api";
import { DOC_TYPE_LABELS, LEVELS } from "@/lib/pedagogy";
import type { LessonDocument } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPE_BADGE_STYLES: Record<string, string> = {
  modul_ajar: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#EFF6FF]",
  rpp: "border-[#A7F3D0] bg-[#ECFDF5] text-[#064E3B] hover:bg-[#ECFDF5]",
  atp: "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-50",
  kktp: "border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-50",
  sumatif: "border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-50",
  lkpd: "border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-50",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const params = new URLSearchParams();
  if (typeFilter !== "all") params.set("doc_type", typeFilter);
  if (levelFilter !== "all") params.set("level", levelFilter);
  if (search.trim()) params.set("q", search.trim());

  const allDocs = useQuery({
    queryKey: ["documents", "all"],
    queryFn: () => apiGet<LessonDocument[]>("/documents"),
  });

  const docs = useQuery({
    queryKey: ["documents", typeFilter, levelFilter, search.trim()],
    queryFn: () => apiGet<LessonDocument[]>(`/documents${params.toString() ? `?${params}` : ""}`),
  });

  const backup = useQuery({
    queryKey: ["backup-status"],
    queryFn: () => apiGet<BackupStatus>("/backup/status"),
  });

  const del = useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/documents/${id}`),
    onSuccess: () => {
      toast.success("Dokumen dihapus");
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => toast.error("Gagal menghapus dokumen"),
  });


  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Dasbor Perangkat</h1>
          <p className="mt-1 text-muted-foreground">
            Kelola seluruh dokumen perangkat pembelajaran yang telah Anda rancang.
          </p>
        </div>
        <Link to="/designer">
          <Button size="lg" data-testid="dashboard-create-btn">
            <Plus className="mr-1 h-4 w-4" /> Buat Perangkat Baru
          </Button>
        </Link>
      </div>

      {backup.data?.due && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3" data-testid="backup-reminder-banner">
          <div className="flex items-start gap-3">
            <DatabaseBackup className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-heading font-bold text-amber-900">Saatnya membuat backup data</p>
              <p className="text-sm text-amber-900/80" data-testid="backup-reminder-text">
                {backup.data.days_since === null
                  ? "Anda belum pernah membuat backup. Simpan salinan perangkat & nilai agar tetap aman dan bisa dibuka offline."
                  : `Backup terakhir ${backup.data.days_since} hari lalu (lebih dari ${backup.data.reminder_days} hari).`}
              </p>
            </div>
          </div>
          <Link to="/profile" data-testid="backup-reminder-cta">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">Backup Sekarang</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Object.keys(DOC_TYPE_LABELS).map((type) => [type, allDocs.data?.filter((d) => d.doc_type === type).length ?? 0] as const).map(([type, count]) => (
          <div key={type} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {DOC_TYPE_LABELS[type]}
            </p>
            <p className="mt-1 font-heading text-2xl font-bold text-primary">{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="search">Cari dokumen</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              className="pl-9"
              placeholder="Judul dokumen…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="dashboard-search-input"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Jenis dokumen</Label>
          <Select value={typeFilter} onValueChange={(value: string) => setTypeFilter(value)}>
            <SelectTrigger data-testid="dashboard-filter-type-select" className="w-full">
              <SelectValue>{typeFilter === "all" ? "Semua jenis" : DOC_TYPE_LABELS[typeFilter]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua jenis</SelectItem>
              {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Jenjang</Label>
          <Select value={levelFilter} onValueChange={(value: string) => setLevelFilter(value)}>
            <SelectTrigger data-testid="dashboard-filter-level-select" className="w-full">
              <SelectValue>{levelFilter === "all" ? "Semua jenjang" : levelFilter}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua jenjang</SelectItem>
              {LEVELS.map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      {docs.isPending ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 py-16">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : !docs.data || docs.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="font-heading text-lg font-semibold">Belum ada dokumen</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || typeFilter !== "all" || levelFilter !== "all"
              ? "Tidak ada dokumen yang cocok dengan filter."
              : "Mulai rancang perangkat pembelajaran pertama Anda."}
          </p>
          <Link to="/designer" className="mt-4 inline-block">
            <Button variant="outline" className="border-primary text-primary hover:bg-accent hover:text-accent-foreground">
              <Plus className="mr-1 h-4 w-4" /> Buat Perangkat
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {docs.data.map((doc) => (
            <Card
              key={doc.id}
              data-testid="document-card-item"
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className={TYPE_BADGE_STYLES[doc.doc_type]}>
                    {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(doc.updated_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-heading font-bold leading-snug">{doc.title || "Tanpa judul"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {doc.subject || "-"} • {doc.level}
                    {doc.grade ? ` Kelas ${doc.grade}` : ""}
                    {doc.phase ? ` (Fase ${doc.phase})` : ""}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {doc.model ? `Model: ${doc.model.replace(/_/g, " ")}` : "Model belum dipilih"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid="document-card-edit-btn"
                    onClick={() => navigate(`/designer/${doc.id}`)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid="document-card-print-btn"
                    onClick={() => navigate(`/document/${doc.id}/print`)}
                  >
                    <Printer className="mr-1 h-3.5 w-3.5" /> Cetak
                  </Button>
                  {doc.doc_type === "lkpd" && (
                    <Button
                      size="sm"
                      data-testid="document-card-grade-btn"
                      onClick={() => navigate(`/lkpd/${doc.id}/nilai`)}
                    >
                      <ClipboardCheck className="mr-1 h-3.5 w-3.5" /> Nilai
                    </Button>
                  )}
                  <a href={`/api/documents/${doc.id}/export.docx`} download data-testid="document-card-word-btn">
                    <Button size="sm" variant="outline">
                      <FileText className="mr-1 h-3.5 w-3.5" /> Word
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-rose-50 hover:text-destructive"
                    data-testid="document-card-delete-btn"
                    disabled={del.isPending}
                    onClick={() => del.mutate(doc.id)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
