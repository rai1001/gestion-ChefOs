'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/forecasts", label: "Previsión", badge: "P1" },
  { href: "/events", label: "Eventos", badge: "P1" },
  { href: "/purchases", label: "Compras", badge: "P1" },
  { href: "/receptions", label: "Recepciones", badge: "P1" },
  { href: "/inventory", label: "Inventario", badge: "P2" },
  { href: "/tasks", label: "Tareas", badge: "P2" },
  { href: "/dashboards", label: "Dashboards", badge: "P2" },
  { href: "/menus", label: "Menús/Escandallos", badge: "P2" },
  { href: "/calendar/month", label: "Calendario mes", badge: "P2" },
  { href: "/calendar/week", label: "Calendario semana", badge: "P2" },
  { href: "/calendar/biweek", label: "Calendario quincena", badge: "P2" },
  { href: "/hotels", label: "Hoteles", badge: "P2" },
  { href: "/employees", label: "Empleados", badge: "P2" },
  { href: "/shifts", label: "Turnos", badge: "P2" },
  { href: "/mobile/turnos", label: "Turnos móvil", badge: "P3" },
  { href: "/mobile/tasks", label: "Tareas móvil", badge: "P3" },
];

function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
              active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>{item.label}</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
              {item.badge}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
              active ? "bg-white/20 text-white" : "bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-slate-900/60 p-6 backdrop-blur md:flex">
        <div className="space-y-1 pb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Cocina Hotels</p>
          <h1 className="text-xl font-semibold">Operaciones</h1>
        </div>
        <SideNav />
        <div className="mt-auto space-y-1 pt-6 text-xs text-slate-400">
          <p>Org: demo</p>
          <p>Modo: stub/E2E</p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="relative z-10 flex flex-col gap-3 border-b border-white/10 bg-slate-900/70 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300">Cocina Hotels</p>
              <h1 className="text-lg font-semibold">Operaciones</h1>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-100">E2E</span>
          </div>
          <MobileNav />
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-950">{children}</main>
      </div>
    </div>
  );
}
