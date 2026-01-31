"use client";
import { useEffect, useMemo, useState } from "react";
import type { Supplier, SupplierProduct } from "@/lib/purchases/catalog";

type SupplierSheet = {
  supplier: string;
  deadline: string;
  delivery_eta?: string;
  lines: { product: string; quantity: number; unit: string; event_date?: string }[];
};

const fmtDays = (days?: number[]) => {
  if (!days || days.length === 0) return "—";
  const map = ["L", "M", "X", "J", "V", "S", "D"];
  return days.map((d) => map[d - 1] ?? d).join(" ");
};

export default function PurchasesPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [sheets, setSheets] = useState<SupplierSheet[]>([]);
  const [eventDate, setEventDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [loadingSheet, setLoadingSheet] = useState(false);

  useEffect(() => {
    fetch("/api/purchases/suppliers")
      .then((r) => r.json())
      .then((json) => setSuppliers(json.data ?? []))
      .catch(() => setSuppliers([]));

    fetch("/api/purchases/products")
      .then((r) => r.json())
      .then((json) => setProducts(json.data ?? []))
      .catch(() => setProducts([]));

    fetch("/api/purchases/sheet")
      .then((r) => r.json())
      .then((json) => setSheets(json.data ?? []))
      .catch(() => setSheets([]));
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((p) => supplierFilter === "all" || p.supplier_id === supplierFilter),
    [products, supplierFilter]
  );

  const generateSheet = async () => {
    setLoadingSheet(true);
    const items = filteredProducts.slice(0, 4).map((p) => {
      const sup = suppliers.find((s) => s.id === p.supplier_id);
      return {
        supplier: sup?.name ?? p.supplier_name,
        product: p.product_name,
        quantity: 1,
        unit: p.unit,
        event_date: eventDate,
        supplier_config: sup
          ? {
              delivery_days: sup.delivery_days,
              cutoff_time: sup.cutoff_time,
              prep_hours: sup.prep_hours,
              ship_hours: sup.ship_hours,
            }
          : undefined,
      };
    });

    const res = await fetch("/api/purchases/sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const json = await res.json();
    setSheets(json.data ?? []);
    setLoadingSheet(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Compras</p>
        <h1 className="text-3xl font-semibold">Hoja de compras</h1>
        <p className="text-slate-300">Agrupa pedidos por proveedor, calcula fecha límite y reparto.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div>
            <h2 className="text-lg font-semibold">Proveedores</h2>
            <p className="text-sm text-slate-300">Ventanas de pedido y reparto (no afecta inventario).</p>
          </div>
          <label className="text-sm text-slate-200 flex items-center gap-2">
            Evento:
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white"
            />
          </label>
        </div>

        <table className="w-full text-sm" aria-label="suppliers-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Proveedor</th>
              <th className="text-left py-2">Reparto</th>
              <th className="text-left py-2">Cutoff</th>
              <th className="text-left py-2">Prep+Env</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 && (
              <tr>
                <td className="py-2" colSpan={4}>
                  Sin datos
                </td>
              </tr>
            )}
            {suppliers.map((sup) => (
              <tr key={sup.id}>
                <td className="py-2">{sup.name}</td>
                <td className="py-2">{fmtDays(sup.delivery_days)}</td>
                <td className="py-2">{sup.cutoff_time ?? "—"}</td>
                <td className="py-2">
                  {(sup.prep_hours ?? 0) + (sup.ship_hours ?? 0)}h (prep {sup.prep_hours ?? 0} + envío{" "}
                  {sup.ship_hours ?? 0})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Catálogo</h2>
            <p className="text-sm text-slate-300">Productos comprables (no decrementa stock).</p>
          </div>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white text-sm"
          >
            <option value="all">Todos los proveedores</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <table className="w-full text-sm" aria-label="catalog-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Producto</th>
              <th className="text-left py-2">Proveedor</th>
              <th className="text-left py-2">Unidad</th>
              <th className="text-left py-2">Categoría</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 && (
              <tr>
                <td className="py-2" colSpan={4}>
                  Sin datos
                </td>
              </tr>
            )}
            {filteredProducts.map((p) => (
              <tr key={p.id}>
                <td className="py-2">{p.product_name}</td>
                <td className="py-2">{p.supplier_name}</td>
                <td className="py-2">{p.unit}</td>
                <td className="py-2">{p.category ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={generateSheet}
          disabled={loadingSheet}
          className="bg-emerald-500 text-black font-semibold px-4 py-2 rounded hover:bg-emerald-400 transition"
        >
          {loadingSheet ? "Calculando..." : "Generar hoja demo"}
        </button>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Hoja de proveedores</h2>
        <table className="w-full text-sm" aria-label="purchases-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Proveedor</th>
              <th className="text-left py-2">Pedido antes de</th>
              <th className="text-left py-2">Entrega prevista</th>
              <th className="text-left py-2">Productos</th>
            </tr>
          </thead>
          <tbody>
            {sheets.length === 0 && (
              <tr>
                <td className="py-2" colSpan={4}>
                  Sin datos
                </td>
              </tr>
            )}
            {sheets.map((sheet) => (
              <tr key={sheet.supplier} data-testid="supplier-row">
                <td className="py-2">{sheet.supplier}</td>
                <td className="py-2">{sheet.deadline}</td>
                <td className="py-2">{sheet.delivery_eta ?? "—"}</td>
                <td className="py-2">
                  {sheet.lines.map((l) => `${l.product}${l.event_date ? ` (${l.event_date})` : ""}`).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
