"use client";
import { useEffect, useState } from "react";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/recipes");
        const json = await res.json();
        setRecipes(json.data ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Recetas</p>
          <h1 className="text-3xl font-semibold">Listado de recetas</h1>
          <p className="text-slate-300 text-sm">Costes y raciones calculadas.</p>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5" data-testid="recipes-table">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Raciones</th>
              <th className="px-4 py-3">Coste total</th>
              <th className="px-4 py-3">Coste/ración</th>
              <th className="px-4 py-3">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recipes.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={6}>
                  {loading ? "Cargando…" : "Sin recetas."}
                </td>
              </tr>
            )}
            {recipes.map((r: any) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-semibold text-white">{r.name}</td>
                <td className="px-4 py-3 text-slate-300">{r.date ?? "-"}</td>
                <td className="px-4 py-3 text-slate-300">{r.servings ?? "-"}</td>
                <td className="px-4 py-3 text-emerald-200">{(r.total_cost ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-emerald-200">{(r.cost_per_serving ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-300">{r.items?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
