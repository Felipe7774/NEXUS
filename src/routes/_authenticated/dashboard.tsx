import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleCheck,
  CircleDollarSign,
  ListTodo,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-auth";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { useActivities, useDeals } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Nexo CRM" },
      {
        name: "description",
        content: "Indicadores de ventas B2B, pipeline abierto y actividad del equipo.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: profile } = useProfile();
  const { data: deals, isLoading } = useDeals();
  const { data: pending } = useActivities("pending");
  const all = deals ?? [];
  const open = all.filter((deal) => deal.status === "open");
  const won = all.filter((deal) => deal.status === "won");
  const lost = all.filter((deal) => deal.status === "lost");
  const sum = (rows: typeof all) => rows.reduce((total, deal) => total + Number(deal.amount), 0);
  const closed = won.length + lost.length;
  const kpis = [
    {
      label: "Pipeline abierto",
      value: formatCurrency(sum(open)),
      icon: CircleDollarSign,
      tone: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
    },
    {
      label: "Ganado",
      value: formatCurrency(sum(won)),
      icon: CircleCheck,
      tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
    {
      label: "Tasa de conversión",
      value: `${closed > 0 ? Math.round((won.length / closed) * 100) : 0}%`,
      icon: TrendingUp,
      tone: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    },
    {
      label: "Oportunidades activas",
      value: formatNumber(open.length),
      icon: BriefcaseBusiness,
      tone: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    },
  ];

  return (
    <div className="nexus-page">
      <PageHeader
        title={`Hola, ${profile?.full_name ?? "bienvenido"}`}
        description="Resumen de tu operación comercial."
      />
      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <section key={kpi.label} className="nexus-kpi">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] tabular-nums">
                    {kpi.value}
                  </p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.tone}`}>
                  <kpi.icon className="h-[18px] w-[18px]" />
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="nexus-surface overflow-hidden">
          <SectionHeading
            icon={<ListTodo className="h-4 w-4" />}
            title="Tareas pendientes"
            action="Ver todas"
          />
          <div className="space-y-1 p-2">
            {(pending ?? []).slice(0, 6).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/70"
              >
                <span className="truncate font-medium">{activity.subject}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {activity.due_at ? formatDateTime(activity.due_at) : "Sin fecha"}
                </span>
              </div>
            ))}
            {(pending ?? []).length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No tienes tareas pendientes.
              </p>
            ) : null}
          </div>
        </section>
        <section className="nexus-surface overflow-hidden">
          <SectionHeading
            icon={<BriefcaseBusiness className="h-4 w-4" />}
            title="Últimas oportunidades"
            action="Ver pipeline"
          />
          <div className="space-y-1 p-2">
            {all.slice(0, 6).map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/70"
              >
                <span className="truncate font-medium">{deal.title}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="rounded-md text-xs">
                    {deal.probability}%
                  </Badge>
                  <span className="tabular-nums">{formatCurrency(Number(deal.amount))}</span>
                </div>
              </div>
            ))}
            {all.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Aún no hay oportunidades.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  action,
}: {
  icon: ReactNode;
  title: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between border-b px-5 py-4">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
        {action}
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
