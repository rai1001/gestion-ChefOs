"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Algo salió mal</h1>
          <p className="text-slate-300">{error.message}</p>
          <button
            onClick={reset}
            className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black hover:bg-emerald-400"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
