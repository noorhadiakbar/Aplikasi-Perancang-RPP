import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Database, FileJson, FileSpreadsheet, Globe, ImagePlus, Loader2, Save, Trash2, Upload } from "lucide-react";
import { apiGet, apiPost, apiPut, ApiError } from "@/lib/api";
import { fetchMe } from "@/lib/auth";
import { buildOfflineHtml, downloadText } from "@/lib/offlineExport";
import type { ImportResult, LessonDocument, ProfileUpdate, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELDS: { key: keyof ProfileUpdate; label: string; placeholder: string }[] = [
  { key: "name", label: "Nama Guru (dengan gelar)", placeholder: "Sari Wulandari, S.Pd." },
  { key: "nip", label: "NIP Guru", placeholder: "19790812 200604 1 002" },
  { key: "school", label: "Nama Satuan Pendidikan", placeholder: "SD Negeri 1 Harapan Bangsa" },
  { key: "npsn", label: "NPSN", placeholder: "20212345" },
  { key: "school_address", label: "Alamat Sekolah", placeholder: "Jl. Pendidikan No. 17, …" },
  { key: "city", label: "Kota / Kabupaten (untuk tanggal tanda tangan)", placeholder: "Bandung" },
  { key: "principal_name", label: "Nama Kepala Sekolah", placeholder: "Drs. H. Ahmad Fauzi, M.Pd." },
  { key: "principal_nip", label: "NIP Kepala Sekolah", placeholder: "19700101 199503 1 001" },
];

// Downscale the uploaded logo to =256px PNG so it stays small inside the profile + backups.
function resizeLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("File bukan gambar yang valid"));
      img.onload = () => {
        const scale = Math.min(1, 256 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function ProfileForm({ me }: { me: User }) {
  const queryClient = useQueryClient();
  const logoInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileUpdate>({
    name: me.name, school: me.school, nip: me.nip, school_address: me.school_address, npsn: me.npsn,
    city: me.city, principal_name: me.principal_name, principal_nip: me.principal_nip, logo: me.logo,
  });

  const save = useMutation({
    mutationFn: () => apiPut<User>("/auth/profile", form),
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
      toast.success("Profil sekolah tersimpan — kop & tanda tangan dokumen diperbarui");
    },
    onError: (error) => {
      const body = error instanceof ApiError ? (error.body as { detail?: unknown } | null) : null;
      toast.error(body && typeof body.detail === "string" ? body.detail : "Gagal menyimpan profil");
    },
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-heading text-xl font-bold">Profil & Identitas Sekolah</h2>
      <p className="mt-1 text-sm text-muted-foreground">Dipakai otomatis di kop dan tanda tangan setiap perangkat ajar.</p>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50" data-testid="profile-logo-preview">
          {form.logo ? <img src={form.logo} alt="Logo sekolah" className="h-full w-full object-contain" /> : <ImagePlus className="h-8 w-8 text-slate-400" />}
        </div>
        <div className="space-y-2">
          <input
            ref={logoInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            data-testid="profile-logo-input"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                setForm((f) => ({ ...f, logo: "" }));
                const logo = await resizeLogo(file);
                setForm((f) => ({ ...f, logo }));
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Gagal memuat logo");
              }
              e.target.value = "";
            }}
          />
          <Button variant="outline" size="sm" onClick={() => logoInput.current?.click()} data-testid="profile-logo-upload-btn">
            <Upload className="mr-1 h-4 w-4" /> Unggah Logo Sekolah
          </Button>
          {form.logo && (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setForm((f) => ({ ...f, logo: "" }))} data-testid="profile-logo-remove-btn">
              <Trash2 className="mr-1 h-4 w-4" /> Hapus Logo
            </Button>
          )}
          <p className="text-xs text-muted-foreground">PNG/JPG/WEBP — otomatis diperkecil.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input id={f.key} value={form[f.key]} placeholder={f.placeholder} onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} data-testid={`profile-${f.key.replace(/_/g, "-")}-input`} />
          </div>
        ))}
      </div>
      <Button className="mt-5" disabled={save.isPending || form.name.trim().length < 2} onClick={() => save.mutate()} data-testid="profile-save-btn">
        {save.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Simpan Profil
      </Button>
    </div>
  );
}

function BackupPanel({ me }: { me: User }) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [building, setBuilding] = useState(false);

  const restore = useMutation({
    mutationFn: (data: unknown) => apiPost<ImportResult>("/backup/import", data),
    onSuccess: (r) => {
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success(`Pemulihan selesai: ${r.documents_added} dokumen baru, ${r.documents_updated} diperbarui, ${r.submissions_added} nilai LKPD`);
    },
    onError: (error) => {
      const body = error instanceof ApiError ? (error.body as { detail?: unknown } | null) : null;
      toast.error(body && typeof body.detail === "string" ? body.detail : "File backup tidak valid");
    },
  });

  const exportHtml = async () => {
    setBuilding(true);
    try {
      const docs = await apiGet<LessonDocument[]>("/documents");
      const stamp = new Date().toISOString().slice(0, 10);
      downloadText(`arsip-offline-perancangrpp-${stamp}.html`, buildOfflineHtml(docs, me), "text/html");
      await apiPost("/backup/mark", {});
      void queryClient.invalidateQueries({ queryKey: ["backup-status"] });
      toast.success(`Arsip offline berisi ${docs.length} dokumen diunduh`);
    } catch {
      toast.error("Gagal membuat arsip offline");
    } finally {
      setBuilding(false);
    }
  };

  const options = [
    { icon: FileJson, title: "Cadangan .json", desc: "Semua dokumen, nilai LKPD, dan profil. Bisa dipulihkan kapan saja.", href: "/api/backup/export.json", testid: "backup-export-json-btn" },
    { icon: FileSpreadsheet, title: "Spreadsheet .xlsx", desc: "Daftar dokumen, kisi-kisi & soal, serta rekap nilai LKPD untuk Excel.", href: "/api/backup/export.xlsx", testid: "backup-export-xlsx-btn" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="flex items-center gap-2 font-heading text-xl font-bold"><Database className="h-5 w-5 text-primary" /> Backup Database Manual</h2>
      <p className="mt-1 text-sm text-muted-foreground">Simpan salinan data di perangkat Anda — tetap bisa dibuka dan dicetak tanpa internet.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {options.map(({ icon: Icon, title, desc, href, testid }) => (
          <a key={title} href={href} download data-testid={testid} onClick={() => setTimeout(() => void queryClient.invalidateQueries({ queryKey: ["backup-status"] }), 1500)} className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-primary hover:bg-accent">
            <Icon className="h-6 w-6 text-primary" />
            <p className="mt-2 font-heading font-bold">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
          </a>
        ))}
        <button type="button" onClick={() => void exportHtml()} disabled={building} data-testid="backup-export-html-btn" className="rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-primary hover:bg-accent disabled:opacity-60">
          {building ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Globe className="h-6 w-6 text-primary" />}
          <p className="mt-2 font-heading font-bold">Arsip Offline .html</p>
          <p className="mt-1 text-xs text-muted-foreground">Satu file berisi semua perangkat siap cetak; dibuka di browser tanpa internet.</p>
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-heading font-bold text-amber-900">Pulihkan dari file .json</p>
        <p className="mt-1 text-xs text-amber-900/80">Data digabungkan: dokumen yang sama diperbarui, sisanya ditambahkan. Data lama tetap aman.</p>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          data-testid="backup-import-input"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              restore.mutate(JSON.parse(await file.text()));
            } catch {
              toast.error("File bukan JSON yang valid");
            }
          }}
        />
        <Button variant="outline" size="sm" className="mt-3 border-amber-300 bg-white" disabled={restore.isPending} onClick={() => fileInput.current?.click()} data-testid="backup-import-btn">
          {restore.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />} Pilih File Backup
        </Button>
      </div>
    </div>
  );
}

export default function Profile() {
  const me = useQuery({ queryKey: ["auth", "me"], queryFn: fetchMe, retry: false });
  if (!me.data) return null;
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Profil Sekolah & Backup</h1>
        <p className="mt-1 text-muted-foreground">Kelola identitas perangkat ajar dan cadangan data Anda.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm me={me.data} />
        <BackupPanel me={me.data} />
      </div>
    </div>
  );
}
