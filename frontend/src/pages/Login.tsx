import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpenCheck, Loader2 } from "lucide-react";
import { apiPost, ApiError } from "@/lib/api";
import { beginSession } from "@/lib/session";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: () => apiPost<User>("/auth/login", { email, password }),
    onSuccess: (user) => {
      beginSession();
      toast.success(`Selamat datang kembali, ${user.name}!`);
      navigate("/dashboard");
    },
    onError: (error) => {
      const body = error instanceof ApiError ? (error.body as { detail?: unknown } | null) : null;
      const detail =
        body && typeof body.detail === "string" ? body.detail : "Gagal masuk. Coba lagi.";
      toast.error(detail);
    },
  });

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Branding panel */}
      <div className="hidden flex-col justify-between bg-[#0F4C81] p-10 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2.5" data-testid="login-brand-link">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <BookOpenCheck className="h-6 w-6" />
          </span>
          <span className="font-heading text-xl font-bold">
            Perancang<span className="text-teal-300">RPP</span>
          </span>
        </Link>
        <div>
          <p className="font-heading text-3xl font-bold leading-snug">
            "Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani."
          </p>
          <p className="mt-4 text-[#E0F2FE]">— Ki Hadjar Dewantara, pemersatu jiwa dan karakter bangsa</p>
          <p className="mt-8 text-sm text-[#E0F2FE]/80">
            Satu akun untuk semua perangkat pembelajaran Anda: Modul Ajar, RPP, ATP, dan KKTP/KKM.
          </p>
        </div>
        <p className="text-xs text-white/60">Sistem Desain Perangkat Pembelajaran Indonesia</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <Card className="w-full max-w-md animate-fade-up border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Masuk Akun Guru</CardTitle>
            <CardDescription>Rancang perangkat pembelajaran Anda dengan lebih cepat.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                login.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="guru@sekolah.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="login-email-input"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password-input"
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={login.isPending}
                data-testid="login-submit-button"
              >
                {login.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                Masuk
              </Button>
            </form>

            <Button
              variant="outline"
              className="mt-3 w-full border-primary text-primary hover:bg-accent hover:text-accent-foreground"
              data-testid="login-demo-fill-button"
              onClick={() => {
                setEmail("guru@sekolah.id");
                setPassword("demo1234");
                toast.info("Kredensial demo terisi — klik Masuk.");
              }}
            >
              Isi Akun Demo
            </Button>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline" data-testid="login-to-register-link">
                Registrasi di sini
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
