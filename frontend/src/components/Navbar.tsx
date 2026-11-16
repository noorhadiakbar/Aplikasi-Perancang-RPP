import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpenCheck, ChevronDown, LayoutDashboard, LogOut, Plus, School, UserRound } from "lucide-react";
import { fetchMe } from "@/lib/auth";
import { endSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dasbor", testid: "nav-dashboard-link", icon: LayoutDashboard },
  { to: "/designer", label: "Buat Perangkat", testid: "nav-create-doc-link", icon: Plus },
  { to: "/reference", label: "Ensiklopedia Pedagogi", testid: "nav-reference-link", icon: BookOpenCheck },
  { to: "/profile", label: "Profil & Backup", testid: "nav-profile-link", icon: School },
];

export function Navbar() {
  const navigate = useNavigate();
  const me = useQuery({ queryKey: ["auth", "me"], queryFn: fetchMe, retry: false });

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" data-testid="navbar-brand" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpenCheck className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-primary">
            Perancang<span className="text-teal-600">RPP</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ to, label, testid, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              data-testid={testid}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {me.data ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              data-testid="nav-user-menu-button"
              className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
            >
              <UserRound className="h-4 w-4" />
              <span className="hidden max-w-40 truncate sm:inline">{me.data.name}</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <p className="font-semibold">{me.data.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{me.data.email}</p>
                  {me.data.school ? (
                    <p className="mt-1 text-xs font-normal text-muted-foreground">{me.data.school}</p>
                  ) : null}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-testid="nav-profile-menu-item"
                onClick={() => navigate("/profile")}
              >
                <School className="h-4 w-4" /> Profil & Backup
              </DropdownMenuItem>
              <DropdownMenuItem
                data-testid="nav-logout-button"
                variant="destructive"
                onClick={() => void endSession()}
              >
                <LogOut className="h-4 w-4" /> Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" data-testid="nav-login-button">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
            <Link to="/register" data-testid="nav-register-button">
              <Button size="sm">Registrasi Guru</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
        {NAV_LINKS.map(({ to, label, testid }) => (
          <Link
            key={to}
            to={to}
            data-testid={testid}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-accent hover:text-accent-foreground"
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
