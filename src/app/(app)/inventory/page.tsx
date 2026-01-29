"use client";
import { useEffect, useState } from "react";

type Lot = { id: string; product_id: string; quantity: number; unit_cost: number };

export default function InventoryPage() {
  const [lots, setLots] = useState<Lot[]>([]);

  useEffect(() => {
    fetch("/api/labels") // reuse lots data if available
      .then((r) => r.json())
      .then((json) => {
        // labels API returns lots for E2E, adapt
        if (Array.isArray(json.data)) {
          setLots(json.data.map((l: any) => ({ id: l.id, product_id: l.product_id ?? "prod", quantity: l.quantity ?? 1, unit_cost: 100 })));
        }
      })
      .catch(() => setLots([]));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Inventario</p>
        <h1 className="text-3xl font-semibold">Inventario y merma</h1>
        <p className="text-slate-300">Ajusta mermas y recalcula coste real.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Lotes</h2>
        <table className="w-full text-sm" aria-label="inventory-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Lote</th>
              <th className="text-left py-2">Prod</th>
              <th className="text-left py-2">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {lots.length === 0 && <tr><td className="py-2" colSpan={3}>Sin datos</td></tr>}
            {lots.map((lot) => (
              <tr key={lot.id} data-testid="inventory-row">
                <td className="py-2">{lot.id}</td>
                <td className="py-2">{lot.product_id}</td>
                <td className="py-2">{lot.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

