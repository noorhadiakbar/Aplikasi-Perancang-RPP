import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Reference from "@/pages/Reference";
import Dashboard from "@/pages/Dashboard";
import Designer from "@/pages/Designer";
import PrintView from "@/pages/PrintView";
import Profile from "@/pages/Profile";
import LkpdGrade from "@/pages/LkpdGrade";
import LkpdCards from "@/pages/LkpdCards";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reference" element={<Reference />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/designer" element={<Designer />} />
          <Route path="/designer/:id" element={<Designer />} />
          <Route path="/document/:id/print" element={<PrintView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/lkpd/:id/nilai" element={<LkpdGrade />} />
          <Route path="/lkpd/:id/kartu" element={<LkpdCards />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </div>
  );
}
