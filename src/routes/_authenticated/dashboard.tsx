import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      { property: "og:title", content: "Dashboard | Nexo CRM" },
      {
        property: "og:description",
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
    { label: "Pipeline abierto", value: formatCurrency(sum(open)) },
    { label: "Ganado", value: formatCurrency(sum(won)) },
    {
      label: "Tasa de conversión",
      value: `${closed > 0 ? Math.round((won.length / closed) * 100) : 0}%`,
    },
    { label: "Oportunidades activas", value: formatNumber(open.length) },
  ];

  return (
    <div>
      <PageHeader
        title={`Hola, ${profile?.full_name ?? "bienvenido"}`}
        description="Resumen de tu operación comercial."
      />
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tareas pendientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(pending ?? []).slice(0, 6).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{activity.subject}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {activity.due_at ? formatDateTime(activity.due_at) : "Sin fecha"}
                </span>
              </div>
            ))}
            {(pending ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes tareas pendientes.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Últimas oportunidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {all.slice(0, 6).map((deal) => (
              <div key={deal.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{deal.title}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {deal.probability}%
                  </Badge>
                  <span className="tabular-nums">{formatCurrency(Number(deal.amount))}</span>
                </div>
              </div>
            ))}
            {all.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay oportunidades.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
