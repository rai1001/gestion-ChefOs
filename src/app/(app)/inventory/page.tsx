"use client";
import { useEffect, useState } from "react";

type Lot = { id: string; product_id: string; quantity: number; unit_cost: number };

export default function InventoryPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [message, setMessage] = useState("");
  const [newProd, setNewProd] = useState("PROD-001");
  const [newQty, setNewQty] = useState<number | "">("");
  const [newExpiry, setNewExpiry] = useState("");

  async function refresh() {
    const res = await fetch("/api/labels");
    const json = await res.json();
    if (Array.isArray(json.data)) {
      setLots(json.data.map((l: any) => ({ id: l.id, product_id: l.product_id ?? "prod", quantity: l.quantity ?? 1, unit_cost: 100 })));
    } else {
      setLots([]);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function seedLot() {
    // seed a task, mark done, create label -> generates lot
    const taskId = "inv-seed";
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: taskId, title: "Etiqueta inventario", org_id: "org-dev" }),
    });
    await fetch(`/api/tasks/${taskId}/start`, { method: "POST" });
    await fetch(`/api/tasks/${taskId}/finish`, { method: "POST" });
    await fetch("/api/labels", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task_id: taskId, org_id: "org-dev", expires_at: "2026-02-10", product_id: "PROD-001" }),
    });
    await refresh();
    setMessage("Demo de lote creada");
  }

  async function createLotManual() {
    if (!newProd || !newExpiry || newQty === "") return;
    const taskId = `inv-${Date.now()}`;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: taskId, title: `Etiqueta ${newProd}`, org_id: "org-dev" }),
    });
    await fetch(`/api/tasks/${taskId}/start`, { method: "POST" });
    await fetch(`/api/tasks/${taskId}/finish`, { method: "POST" });
    await fetch("/api/labels", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task_id: taskId, org_id: "org-dev", expires_at: newExpiry, product_id: newProd }),
    });
    await refresh();
    setMessage("Lote añadido");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Inventario</p>
        <h1 className="text-3xl font-semibold">Inventario y merma</h1>
        <p className="text-slate-300">Ajusta mermas y recalcula coste real.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Lotes</h2>
        <div className="flex flex-wrap gap-2 text-sm text-slate-200">
          <button onClick={seedLot} className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10">Cargar demo</button>
          <button onClick={refresh} className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10">Recargar</button>
          {message && <span className="text-emerald-200 text-xs">{message}</span>}
        </div>
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <label className="flex flex-col gap-1">
            Producto
            <input value={newProd} onChange={(e) => setNewProd(e.target.value)} className="rounded bg-slate-900 border border-white/10 px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1">
            Cantidad
            <input value={newQty} onChange={(e) => setNewQty(e.target.value === "" ? "" : Number(e.target.value))} type="number" className="rounded bg-slate-900 border border-white/10 px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1">
            Caducidad
            <input value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} type="date" className="rounded bg-slate-900 border border-white/10 px-3 py-2" />
          </label>
          <button onClick={createLotManual} className="md:col-span-3 rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2">Añadir lote manual</button>
        </div>
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
