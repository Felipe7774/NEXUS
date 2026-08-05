import { createFileRoute, Link } from "@tanstack/react-router";

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
      { property: "og:title", content: "Nexo CRM — CRM de ventas B2B" },
      {
        property: "og:description",
        content:
          "Nexo CRM organiza contactos, empresas, oportunidades y actividades de tu equipo comercial B2B.",
      },
    ],
  }),
  component: Index,
});

const features = [
  { title: "Pipeline claro", text: "Oportunidades por etapa, con montos y probabilidad al día." },
  {
    title: "Equipo alineado",
    text: "Roles de vendedor, gerente y administrador con accesos separados.",
  },
  {
    title: "Historial completo",
    text: "Actividades, notas y cambios de etapa registrados automáticamente.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center justify-between border-b px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            N
          </div>
          <span className="text-sm font-semibold tracking-tight">Nexo CRM</span>
        </div>
        <Button asChild size="sm">
          <Link to="/auth">Iniciar sesión</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-20 md:px-8">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
          El CRM denso y directo para ventas B2B
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          Contactos, empresas, oportunidades y tareas en un solo lugar. Sin ruido, con la
          información que tu equipo comercial realmente usa.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link to="/auth">Comenzar</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border bg-card p-5">
              <h2 className="text-sm font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
