"use client";
import { useState } from "react";

export default function ProductsImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setStatus("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/products/import", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error importando productos");
      setStatus(`Importados ${json.count ?? 0} productos`);
    } catch (err: any) {
      setStatus(err?.message ?? "Error importando productos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Productos</p>
        <h1 className="text-3xl font-semibold">Importar catálogo</h1>
        <p className="text-slate-300 text-sm">Acepta CSV/XLSX o imagen/PDF (OCR genérico) con líneas producto, unidad, precio.</p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4" data-testid="products-import-card">
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-200 file:mr-3 file:rounded-md file:border file:border-white/20 file:bg-white/10 file:px-3 file:py-1 file:text-slate-100"
        />
        <div className="flex gap-2 text-sm">
          <button
            disabled={!file || loading}
            onClick={handleImport}
            className="rounded-md bg-emerald-500 px-3 py-2 text-black font-semibold disabled:opacity-50"
            data-testid="products-import-excel"
          >
            Importar
          </button>
          {loading && <span className="text-xs text-slate-300">Cargando…</span>}
          {status && <span className="text-xs text-emerald-200" data-testid="products-import-status">{status}</span>}
        </div>
      </div>
    </main>
  );
}
