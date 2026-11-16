import { Outlet, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { fetchMe } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

// Guards guru-only pages: resolves GET /auth/me, redirects guests to /login,
// and renders the shared Navbar + main shell for authenticated pages.
export function ProtectedRoute() {
  const me = useQuery({ queryKey: ["auth", "me"], queryFn: fetchMe, retry: false });

  if (me.isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!me.data) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
