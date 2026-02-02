"use client";
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<{ id: string; price: string } | null>(null);
  const [saving, setSaving] = useState(false);

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

  async function savePrice(id: string, price: number) {
    setSaving(true);
    const target = products.find((p) => p.id === id);
    if (!target) return;
    await fetch("/api/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id,
        org_id: target.org_id ?? "org-dev",
        name: target.name,
        unit: target.unit ?? "UD",
        unit_price: price,
      }),
    });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, unit_price: price } : p)));
    setEditing(null);
    setSaving(false);
  }

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
                <td className="px-4 py-3 text-emerald-200">
                  {editing?.id === p.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editing.price}
                        onChange={(e) => setEditing({ id: p.id, price: e.target.value })}
                        className="w-24 rounded bg-slate-900 border border-white/10 px-2 py-1 text-white text-sm"
                      />
                      <button
                        className="text-xs rounded bg-emerald-500 text-black px-2 py-1 disabled:opacity-50"
                        disabled={saving || editing.price === ""}
                        onClick={() => savePrice(p.id, Number(editing.price))}
                      >
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                      <button className="text-xs text-slate-400" onClick={() => setEditing(null)}>Cancelar</button>
                    </div>
                  ) : (
                    <button
                      className="underline text-emerald-200"
                      onClick={() => setEditing({ id: p.id, price: String(p.unit_price ?? 0) })}
                    >
                      {(p.unit_price ?? 0).toFixed(2)}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
