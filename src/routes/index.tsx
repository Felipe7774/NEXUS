import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  KanbanSquare,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus CRM — Gestión comercial B2B" },
      {
        name: "description",
        content: "Gestiona oportunidades, contactos y actividades de ventas B2B en Nexus CRM.",
      },
    ],
  }),
  component: Landing,
});

const views = [
  {
    id: "pipeline",
    label: "Pipeline",
    icon: KanbanSquare,
    title: "Oportunidades abiertas",
    description: "Consulta el valor y la etapa de cada negociación.",
    rows: [
      ["Renovación anual", "Grupo Andina", "Negociación", "$48.000.000"],
      ["Implementación regional", "Logística Norte", "Propuesta", "$32.000.000"],
      ["Expansión de cuenta", "Vértice Industrial", "Calificación", "$18.000.000"],
    ],
  },
  {
    id: "contactos",
    label: "Contactos",
    icon: UsersRound,
    title: "Contactos por empresa",
    description: "Encuentra a la persona indicada antes del próximo contacto.",
    rows: [
      ["Laura Méndez", "Grupo Andina", "Dirección", "Compras"],
      ["Daniel Reyes", "Logística Norte", "Gerencia", "Operaciones"],
      ["Sara Ortiz", "Vértice Industrial", "Dirección", "Finanzas"],
    ],
  },
  {
    id: "actividades",
    label: "Actividades",
    icon: CalendarCheck,
    title: "Próximas actividades",
    description: "Revisa qué compromisos tiene pendientes tu equipo.",
    rows: [
      ["Revisar la renovación", "Grupo Andina", "Llamada", "Hoy · 10:30"],
      ["Presentar la propuesta", "Logística Norte", "Reunión", "Mañana · 09:00"],
      ["Enviar alcance", "Vértice Industrial", "Tarea", "Mañana · 15:00"],
    ],
  },
];

function ProductDemo() {
  return (
    <section
      id="producto"
      aria-label="Demo de Nexus CRM"
      className="relative min-w-0 scroll-mt-24 rounded-[1.5rem] border border-white/20 bg-[#141821] shadow-[0_36px_100px_-32px_#050611]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4 sm:px-6">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true" className="size-2 rounded-full bg-indigo-300" />
          Espacio comercial
        </span>
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-slate-300">
          Datos de ejemplo
        </span>
      </div>
      <Tabs defaultValue="pipeline" className="p-3 sm:p-5">
        <TabsList
          aria-label="Vistas de la demo"
          className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl bg-[#090c12] p-1"
        >
          {views.map(({ id, icon: Icon, label }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="gap-1.5 rounded-lg px-1 py-2.5 text-xs text-slate-300 ring-offset-[#141821] transition-colors hover:bg-white/10 hover:text-white active:bg-white/20 focus-visible:ring-indigo-300 data-[state=active]:bg-[#2a3042] data-[state=active]:text-white motion-reduce:transition-none sm:text-sm"
            >
              <Icon aria-hidden="true" className="hidden size-4 sm:block" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {views.map(({ id, title, description, rows }) => (
          <TabsContent
            key={id}
            value={id}
            className="mt-4 min-h-[20rem] rounded-xl border border-white/10 bg-[#10141d] p-3 ring-offset-[#141821] focus-visible:ring-indigo-300 motion-safe:data-[state=active]:animate-in motion-safe:data-[state=active]:fade-in motion-safe:duration-150 sm:p-5"
          >
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
            <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
              {rows.map(([name, company, status, detail]) => (
                <li
                  key={name}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-3"
                >
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{company}</p>
                  </div>
                  <span className="col-start-1 row-start-2 w-fit rounded-md bg-indigo-400/15 px-2 py-1 text-xs text-indigo-200 sm:col-start-2 sm:row-start-1">
                    {status}
                  </span>
                  <span className="col-start-2 row-start-1 text-xs font-medium tabular-nums text-slate-200 sm:col-start-3">
                    {detail}
                  </span>
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-[#090c12] text-slate-50">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090c12]/85 backdrop-blur-xl [@media(prefers-reduced-transparency:reduce)]:bg-[#090c12] [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-indigo-300"
          >
            <img src="/nexus-mark.svg" alt="" width={36} height={36} className="shrink-0" />
            Nexus <span className="text-xs font-medium tracking-wider text-slate-400">CRM</span>
          </Link>
          <nav aria-label="Navegación principal" className="flex items-center gap-5">
            <a
              href="#producto"
              className="hidden rounded text-sm text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-indigo-300 sm:block"
            >
              Producto
            </a>
            <Button
              asChild
              variant="outline"
              className="h-9 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white focus-visible:ring-indigo-300 motion-reduce:transition-none"
            >
              <Link to="/auth">
                Iniciar sesión <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <div className="border-b border-white/10 bg-[radial-gradient(ellipse_at_70%_45%,#22234c_0%,#090c12_72%)]">
          <div className="mx-auto grid max-w-7xl gap-9 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12 lg:py-24">
            <section aria-labelledby="landing-title">
              <p className="text-xs font-semibold uppercase tracking-[0.19em] text-indigo-200">
                CRM para ventas B2B
              </p>
              <h1
                id="landing-title"
                className="mt-5 max-w-[13ch] text-[clamp(2.75rem,5.5vw,5rem)] font-semibold leading-[0.99] tracking-[-0.055em]"
              >
                Cada oportunidad <span className="text-indigo-200">tiene un próximo paso.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-slate-300 sm:text-lg">
                Reúne las negociaciones, los contactos y la agenda comercial de tu equipo. Mira qué
                está en juego y a quién le toca actuar.
              </p>
              <Button
                asChild
                className="mt-7 h-11 rounded-full bg-indigo-300 px-5 font-semibold text-slate-950 hover:bg-indigo-200 focus-visible:ring-indigo-200 active:bg-indigo-400 motion-reduce:transition-none"
              >
                <a href="#producto">
                  Explorar la demo <ArrowDownRight aria-hidden="true" />
                </a>
              </Button>
            </section>
            <ProductDemo />
          </div>
        </div>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-7 text-sm text-slate-400 sm:px-8">
        <span className="font-medium text-slate-200">Nexus CRM</span>
        <span>Gestión comercial B2B</span>
      </footer>
    </div>
  );
}
