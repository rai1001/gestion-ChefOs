"use client";
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        setProducts(json.data ?? []);
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
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Productos</p>
          <h1 className="text-3xl font-semibold">Catálogo de productos</h1>
          <p className="text-slate-300 text-sm">Precios usados para recetas y escandallos.</p>
        </div>
        <a href="/products/import" className="rounded-md bg-emerald-500 text-black font-semibold px-3 py-2 text-sm">Importar</a>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5" data-testid="products-table">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Unidad</th>
              <th className="px-4 py-3">Precio unidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.length === 0 && (
              <tr><td className="px-4 py-4 text-slate-400" colSpan={3}>{loading ? "Cargando…" : "Sin productos."}</td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                <td className="px-4 py-3 text-slate-300">{p.unit}</td>
                <td className="px-4 py-3 text-emerald-200">{(p.unit_price ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
