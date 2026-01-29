"use client";
import { useEffect, useState } from "react";

type ReceptionRow = { id: string; expected_qty: number; received_qty: number; status: string };
type AlertRow = { type: string; message: string; reception_id: string };

export default function ReceptionsPage() {
  const [receptions, setReceptions] = useState<ReceptionRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);

useEffect(() => {
    fetch("/api/receptions")
      .then((r) => r.json())
      .then((json) => setReceptions(json.data ?? []))
      .catch(() => setReceptions([]));
    fetch("/api/receptions/alerts")
      .then((r) => r.json())
      .then((json) => setAlerts(json.data ?? []))
      .catch(() => setAlerts([]));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Recepción</p>
        <h1 className="text-3xl font-semibold">Recepciones y alertas</h1>
        <p className="text-slate-300">Marca parciales y detecta retrasos/roturas.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Recepciones</h2>
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
