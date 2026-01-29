"use client";
import { useEffect, useState } from "react";

type SupplierSheet = { supplier: string; deadline: string; lines: { product: string; quantity: number; unit: string }[] };

export default function PurchasesPage() {
  const [sheets, setSheets] = useState<SupplierSheet[]>([]);

  useEffect(() => {
    fetch("/api/purchases/sheet")
      .then((r) => r.json())
      .then((json) => setSheets(json.data ?? []))
      .catch(() => setSheets([]));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Compras</p>
        <h1 className="text-3xl font-semibold">Hoja de compras</h1>
        <p className="text-slate-300">Agrupa pedidos por proveedor y fija fecha límite.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Vista proveedores</h2>
        <table className="w-full text-sm" aria-label="purchases-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Proveedor</th>
              <th className="text-left py-2">Deadline</th>
              <th className="text-left py-2">Productos</th>
            </tr>
          </thead>
          <tbody>
            {sheets.length === 0 && (
              <tr>
                <td className="py-2" colSpan={3}>Sin datos</td>
              </tr>
            )}
            {sheets.map((sheet) => (
              <tr key={sheet.supplier} data-testid="supplier-row">
                <td className="py-2">{sheet.supplier}</td>
                <td className="py-2">{sheet.deadline}</td>
                <td className="py-2">{sheet.lines.map((l) => l.product).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
