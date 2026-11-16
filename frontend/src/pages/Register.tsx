import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpenCheck, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";
import { ApiError } from "@/lib/apiError";
import { beginSession } from "@/lib/session";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ONBOARDING_STEPS = [
  "Registrasi guru & satuan pendidikan",
  "Pilih kurikulum: Merdeka, K13, atau PAUD",
  "Susun Modul Ajar / RPP / ATP / KKTP lewat wizard",
  "Cetak dokumen siap tanda tangan",
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    school: "",
    nip: "",
    password: "",
  });

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const register = useMutation({
    mutationFn: () => apiPost<User>("/auth/register", form),
    onSuccess: (user) => {
      beginSession();
      toast.success(`Akun dibuat. Selamat datang, ${user.name}!`);
      navigate("/dashboard");
    },
    onError: (error) => {
      const body = error instanceof ApiError ? (error.body as { detail?: unknown } | null) : null;
      const detail =
        body && typeof body.detail === "string"
          ? body.detail
          : "Gagal mendaftar. Periksa kembali data Anda.";
      toast.error(detail);
    },
  });

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Onboarding panel */}
      <div className="hidden flex-col justify-between bg-[#0F4C81] p-10 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2.5" data-testid="register-brand-link">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <BookOpenCheck className="h-6 w-6" />
          </span>
          <span className="font-heading text-xl font-bold">
            Perancang<span className="text-teal-300">RPP</span>
          </span>
        </Link>
        <div>
          <p className="font-heading text-3xl font-bold leading-snug">
            Peta jalan guru di PerancangRPP
          </p>
          <ol className="mt-6 space-y-4">
            {ONBOARDING_STEPS.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-[#E0F2FE]">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-white/60">Bergabung bersama guru PAUD, SD, SMP, SMA, dan SMK se-Indonesia</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <Card className="w-full max-w-md animate-fade-up border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Registrasi Guru</CardTitle>
            <CardDescription>Gratis  akun Anda menyimpan seluruh perangkat pembelajaran.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                register.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap (dengan gelar)</Label>
                <Input
                  id="name"
                  required
                  minLength={2}
                  placeholder="Sari Wulandari, S.Pd."
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  data-testid="register-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="guru@sekolah.id"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  data-testid="register-email-input"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">Satuan Pendidikan</Label>
                <Input
                  id="school"
                  placeholder="SD Negeri 1 Harapan Bangsa"
                  value={form.school}
                  onChange={(e) => set("school", e.target.value)}
                  data-testid="register-school-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nip">NIP (opsional)</Label>
                <Input
                  id="nip"
                  placeholder="19790812 200604 1 002"
                  value={form.nip}
                  onChange={(e) => set("nip", e.target.value)}
                  data-testid="register-nip-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi (min. 8 karakter)</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  data-testid="register-password-input"
                  autoComplete="new-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={register.isPending}
                data-testid="register-submit-button"
              >
                {register.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                Buat Akun Guru
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline" data-testid="register-to-login-link">
                Masuk di sini
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
