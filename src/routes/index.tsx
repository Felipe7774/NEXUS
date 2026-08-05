import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, KanbanSquare, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexo CRM — CRM de ventas B2B" },
      {
        name: "description",
        content:
          "Nexo CRM organiza contactos, empresas, oportunidades y actividades de tu equipo comercial B2B.",
      },
    ],
  }),
  component: Index,
});

const features = [
  {
    title: "Pipeline claro",
    text: "Oportunidades por etapa, con montos y probabilidad al día.",
    icon: KanbanSquare,
  },
  {
    title: "Contexto para vender",
    text: "Contactos, empresas y actividad conectados en una misma vista.",
    icon: UsersRound,
  },
  {
    title: "Operación ordenada",
    text: "Seguimiento comercial sin ruido ni hojas de cálculo dispersas.",
    icon: Building2,
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            n
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Nexo</span>
        </div>
        <Button asChild size="sm" className="rounded-lg px-4">
          <Link to="/auth">Iniciar sesión</Link>
        </Button>
      </header>
      <main className="mx-auto max-w-7xl px-5 pb-16 pt-20 md:px-8 md:pt-28">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            CRM para equipos B2B
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.06] tracking-[-0.045em] md:text-6xl">
            La claridad que tu equipo necesita para vender mejor.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            Nexo concentra la operación comercial en una interfaz rápida, densa y agradable de usar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="h-10 rounded-lg px-5">
              <Link to="/auth">
                Comenzar ahora <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-10 rounded-lg px-5">
              <Link to="/auth">Ver el producto</Link>
            </Button>
          </div>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <section key={feature.title} className="nexus-surface p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                <feature.icon className="h-[18px] w-[18px]" />
              </div>
              <h2 className="mt-5 text-sm font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
