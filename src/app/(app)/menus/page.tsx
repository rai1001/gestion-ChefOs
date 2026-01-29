"use client";
import { useEffect, useState } from "react";

type Recipe = { name: string; cost: number };
type Menu = {
  id: string;
  name: string;
  cost_theoretical: number;
  servings: number;
  allergens: string[];
  recipes: Recipe[];
};

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [message, setMessage] = useState("");

  async function refresh() {
    const res = await fetch("/api/menus");
    const json = await res.json();
    setMenus(json.data ?? []);
  }

  useEffect(() => {
    refresh().catch(() => setMessage("Error cargando menús"));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Menús</p>
        <h1 className="text-3xl font-semibold">Menús, escandallos y alérgenos</h1>
        <p className="text-slate-300">Coste teórico por ración, recetas y alérgenos por menú.</p>
        {message && <p className="text-xs text-emerald-200">{message}</p>}
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {menus.map((menu) => (
          <article key={menu.id} className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{menu.name}</h2>
                <p className="text-sm text-slate-300">Raciones: {menu.servings}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Coste teórico</p>
                <p className="text-xl font-semibold text-emerald-200">€{menu.cost_theoretical.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-200">
              {menu.allergens.length ? menu.allergens.map((a) => (
                <span key={a} className="rounded-full bg-amber-500/20 text-amber-100 px-2 py-1">Alérgeno: {a}</span>
              )) : <span className="text-slate-400">Sin alérgenos declarados</span>}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-200">Escandallo</p>
              <ul className="text-sm text-slate-300 space-y-1">
                {menu.recipes.map((r) => (
                  <li key={r.name} className="flex justify-between">
                    <span>{r.name}</span>
                    <span className="text-emerald-200">€{r.cost.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
        {menus.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-300">
            Sin menús cargados aún.
          </div>
        )}
      </section>
    </main>
  );
}
