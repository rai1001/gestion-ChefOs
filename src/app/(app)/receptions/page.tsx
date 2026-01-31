"use client";
import { useEffect, useState, useCallback, useRef, ChangeEvent } from "react";

type ReceptionRow = { id: string; expected_qty: number; received_qty: number; status: string };
type AlertRow = { type: string; message: string; reception_id: string };

export default function ReceptionsPage() {
  const [receptions, setReceptions] = useState<ReceptionRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [newId, setNewId] = useState("PO-1001");
  const [expected, setExpected] = useState<number | "">(10);
  const [expectedDate, setExpectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [recvId, setRecvId] = useState("");
  const [recvQty, setRecvQty] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [ocrNote, setOcrNote] = useState<string>("");
  const ocrInputRef = useRef<HTMLInputElement | null>(null);

  const seedDemo = useCallback(async () => {
    await fetch("/api/receptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "PO-1001", expected_qty: 50, expected_date: "2026-02-01" }),
    });
    await fetch("/api/receptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "PO-1002", expected_qty: 30, expected_date: "2026-02-02" }),
    });
    setMessage("Demo cargada: PO-1001/1002");
  }, []);

  const refresh = useCallback(
    async (allowSeed = true) => {
      const recRes = await fetch("/api/receptions");
      const recJson = await recRes.json();
      const recs: ReceptionRow[] = recJson.data ?? [];
      if (allowSeed && recs.length === 0) {
        await seedDemo();
        return refresh(false);
      }
      setReceptions(recs);
      const alRes = await fetch("/api/receptions/alerts");
      const alJson = await alRes.json();
      setAlerts(alJson.data ?? []);
    },
    [seedDemo],
  );

useEffect(() => {
    refresh();
  }, [refresh]);

  async function createReception() {
    if (!expected || !newId) return;
    await fetch("/api/receptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: newId,
        expected_qty: Number(expected),
        expected_date: expectedDate || new Date().toISOString().slice(0, 10),
      }),
    });
    setMessage(`Pedido ${newId} creado`);
    await refresh();
  }

  async function receivePartial() {
    if (!recvId || !recvQty) return;
    await fetch(`/api/receptions/${recvId}/lines`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ qty: Number(recvQty), received_at: new Date().toISOString().slice(0, 10) }),
    });
    setMessage(`Recepción parcial ${recvId}`);
    await refresh();
  }

  async function finalize() {
    if (!recvId) return;
    await fetch(`/api/receptions/${recvId}/lines`, { method: "PATCH" });
    setMessage(`Finalizado ${recvId}`);
    await refresh();
  }

  async function handleOcrUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/ocr?kind=albaran", { method: "POST", body: form });
    const json = await res.json();
    if (json?.data?.text) {
      setOcrNote(`OCR albarán: ${json.data.text}`);
      // Crear lotes en inventario a partir de líneas OCR si existen
      if (Array.isArray(json.data.lines) && json.data.lines.length > 0) {
        for (const line of json.data.lines) {
          await fetch("/api/inventory/lots", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              org_id: "org-dev",
              product_id: line.item || "Producto OCR",
              quantity: line.qty ?? 1,
              expires_at: json.data.date ?? new Date().toISOString().slice(0, 10),
            }),
          });
        }
        setMessage("Lotes creados desde albarán OCR");
        await refresh();
      }
    } else {
      setOcrNote("No se pudo leer el albarán");
    }
    e.target.value = "";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Recepción</p>
        <h1 className="text-3xl font-semibold">Recepciones y alertas</h1>
        <p className="text-slate-300">Marca parciales y detecta retrasos/roturas.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Recepciones</h2>
        <div className="flex flex-wrap gap-2 text-sm text-slate-200">
          <button onClick={seedDemo} className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10">Cargar demo</button>
          <button onClick={refresh} className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10">Recargar</button>
          <button
            onClick={() => ocrInputRef.current?.click()}
            aria-label="btn-escaneo-albaran"
            className="rounded-md border border-emerald-300/50 px-3 py-1 text-emerald-200 hover:bg-emerald-300/10 bg-emerald-500/10"
          >
            Escanear albarán / hoja
          </button>
          <input
            ref={ocrInputRef}
            type="file"
            accept="image/*,.pdf,.txt"
            className="hidden"
            onChange={handleOcrUpload}
            aria-label="ocr-upload"
          />
          {message && <span className="text-emerald-200 text-xs">{message}</span>}
          {ocrNote && <span className="text-emerald-200 text-xs" aria-label="ocr-note">{ocrNote}</span>}
        </div>
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <label className="flex flex-col gap-1">
            ID pedido
            <input value={newId} onChange={(e) => setNewId(e.target.value)} className="rounded bg-slate-900 border border-white/10 px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1">
            Cant. esperada
            <input value={expected} onChange={(e) => setExpected(e.target.value === "" ? "" : Number(e.target.value))} type="number" className="rounded bg-slate-900 border border-white/10 px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1">
            Fecha esperada
            <input value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} type="date" className="rounded bg-slate-900 border border-white/10 px-3 py-2" />
          </label>
          <button onClick={createReception} className="md:self-end rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2">Crear recepción</button>
        </div>
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <label className="flex flex-col gap-1">
            ID a recibir
            <input value={recvId} onChange={(e) => setRecvId(e.target.value)} className="rounded bg-slate-900 border border-white/10 px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1">
            Qty recibida
            <input value={recvQty} onChange={(e) => setRecvQty(e.target.value === "" ? "" : Number(e.target.value))} type="number" className="rounded bg-slate-900 border border-white/10 px-3 py-2" />
          </label>
          <div className="flex items-end gap-2">
            <button onClick={receivePartial} className="rounded-lg bg-white/10 border border-white/10 px-4 py-2">Registrar parcial</button>
            <button onClick={finalize} className="rounded-lg bg-white/10 border border-white/10 px-4 py-2">Finalizar</button>
          </div>
        </div>
        <table className="w-full text-sm" aria-label="receptions-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">ID</th>
              <th className="text-left py-2">Esperado</th>
              <th className="text-left py-2">Recibido</th>
              <th className="text-left py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {receptions.length === 0 && <tr><td className="py-2" colSpan={4}>Sin datos</td></tr>}
            {receptions.map((r) => (
              <tr key={r.id} data-testid="reception-row">
                <td className="py-2">{r.id}</td>
                <td className="py-2">{r.expected_qty}</td>
                <td className="py-2">{r.received_qty}</td>
                <td className="py-2">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Alertas</h2>
        <ul className="text-sm space-y-2" aria-label="alerts-list">
          {alerts.length === 0 && <li>Sin alertas</li>}
          {alerts.map((a, idx) => (
            <li key={idx} data-testid="alert-item">{a.type}: {a.message}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
