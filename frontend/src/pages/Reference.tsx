import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Wand2 } from "lucide-react";
import {
  APPROACHES,
  CURRICULA,
  DOC_TYPE_LABELS,
  METHODS,
  MODELS,
  STRATEGIES,
} from "@/lib/pedagogy";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Category = "kurikulum" | "pendekatan" | "model" | "metode" | "strategi";

const CATEGORY_LABELS: Record<Category, string> = {
  kurikulum: "Kurikulum",
  pendekatan: "Pendekatan",
  model: "Model",
  metode: "Metode",
  strategi: "Strategi",
};

export default function Reference() {
  const [category, setCategory] = useState<Category>("model");
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const items: { id: string; name: string; description: string; applyParam: string; details: { label: string; lines: string[] }[] }[] =
    category === "kurikulum"
      ? CURRICULA.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          applyParam: "curriculum",
          details: [
            { label: "Perangkat utama", lines: c.instruments },
            { label: "Asesmen", lines: [c.assessment] },
          ],
        }))
      : category === "pendekatan"
        ? APPROACHES.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            applyParam: "approach",
            details: [{ label: "Cara implementasi", lines: a.implementation }],
          }))
        : category === "model"
          ? MODELS.map((m) => ({
              id: m.id,
              name: m.name,
              description: m.description,
              applyParam: "model",
              details: [
                { label: "Sintaks / langkah model", lines: m.syntax },
                { label: "Mengapa dipilih", lines: [m.rationale] },
                { label: "Cocok untuk jenjang", lines: [m.suitedFor.join(", ")] },
              ],
            }))
          : category === "metode"
            ? METHODS.map((m) => ({
                id: m.id,
                name: m.name,
                description: m.description,
                applyParam: "method",
                details: [{ label: "Kapan digunakan", lines: [m.whenToUse] }],
              }))
            : STRATEGIES.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                applyParam: "strategy",
                details: [{ label: "Kapan digunakan", lines: [s.whenToUse] }],
              }));

  const filtered = items.filter(
    (item) =>
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
  );

  return (
    <div className="min-h-svh bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-fade-up">
          <h1 className="font-heading text-3xl font-bold tracking-tight">Ensiklopedia Pedagogi</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Referensi kurikulum, pendekatan, model, metode, dan strategi pembelajaran yang digunakan
            di Indonesia — lengkap dengan sintaks agar langsung bisa diterapkan.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Tabs value={category} onValueChange={(value: string) => setCategory(value as Category)}>
            <TabsList data-testid="reference-category-filter" className="flex-wrap">
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Cari konsep… (mis. PBL, TaRL)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="reference-search-input"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              data-testid="reference-card"
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-heading text-lg font-bold leading-snug">{item.name}</h2>
                <Badge variant="secondary" className="shrink-0">
                  {CATEGORY_LABELS[category]}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              <div className="mt-3 flex-1 space-y-3">
                {item.details.map((detail) => (
                  <div key={detail.label}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {detail.label}
                    </p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-slate-700">
                      {detail.lines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <Link
                to={`/designer?${item.applyParam}=${item.id}`}
                className="mt-4"
                data-testid="reference-card-apply-btn"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-accent hover:text-accent-foreground"
                >
                  <Wand2 className="mr-1 h-3.5 w-3.5" /> Terapkan ke Perangkat
                </Button>
              </Link>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-muted-foreground">
              Tidak ada konsep yang cocok dengan "{search}".
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
