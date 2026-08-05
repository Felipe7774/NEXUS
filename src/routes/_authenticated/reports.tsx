import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useDeals, usePipelines, useStages } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reportes | Nexo CRM" },
      { name: "description", content: "Análisis de conversión y desempeño comercial." },
      { property: "og:title", content: "Reportes | Nexo CRM" },
      { property: "og:description", content: "Análisis de conversión y desempeño comercial." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: pipelines } = usePipelines();
  const pipelineId = pipelines?.[0]?.id;
  const { data: stages } = useStages(pipelineId);
  const { data: deals, isLoading } = useDeals(pipelineId);

  const all = deals ?? [];
  const open = all.filter((deal) => deal.status === "open");
  const won = all.filter((deal) => deal.status === "won");
  const lost = all.filter((deal) => deal.status === "lost");
  const sum = (rows: typeof all) => rows.reduce((total, deal) => total + Number(deal.amount), 0);
  const closed = won.length + lost.length;
  const winRate = closed > 0 ? Math.round((won.length / closed) * 100) : 0;
  const weighted = open.reduce(
    (total, deal) => total + (Number(deal.amount) * deal.probability) / 100,
    0,
  );

  const kpis = [
    { label: "Pipeline abierto", value: formatCurrency(sum(open)) },
    { label: "Pipeline ponderado", value: formatCurrency(weighted) },
    { label: "Ganado", value: formatCurrency(sum(won)) },
    { label: "Tasa de conversión", value: `${winRate}%` },
  ];

  return (
    <div>
      <PageHeader title="Reportes" description="Análisis de conversión y desempeño comercial." />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Embudo por etapa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(stages ?? []).map((stage) => {
                const rows = all.filter((deal) => deal.stage_id === stage.id);
                const share = all.length > 0 ? (rows.length / all.length) * 100 : 0;
                return (
                  <div key={stage.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{stage.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatNumber(rows.length)} · {formatCurrency(sum(rows))}
                      </span>
                    </div>
                    <Progress value={share} />
                  </div>
                );
              })}
              {all.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Registra oportunidades para ver el embudo.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resultados</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Abiertas</p>
                <p className="text-lg font-semibold tabular-nums">{formatNumber(open.length)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Ganadas</p>
                <p className="text-lg font-semibold tabular-nums">{formatNumber(won.length)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Perdidas</p>
                <p className="text-lg font-semibold tabular-nums">{formatNumber(lost.length)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
