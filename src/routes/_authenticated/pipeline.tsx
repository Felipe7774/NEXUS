import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { DealDialog } from "@/components/crm/deal-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  useDeals,
  useDeleteDeal,
  useMoveDeal,
  usePipelines,
  useStages,
  type DealRow,
} from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline | Nexo CRM" },
      { name: "description", content: "Tablero de oportunidades por etapa." },
      { property: "og:title", content: "Pipeline | Nexo CRM" },
      { property: "og:description", content: "Tablero de oportunidades por etapa." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: pipelines, isLoading: loadingPipelines } = usePipelines();
  const pipelineId = pipelines?.[0]?.id;
  const { data: stages } = useStages(pipelineId);
  const { data: deals, isLoading } = useDeals(pipelineId);
  const move = useMoveDeal();
  const remove = useDeleteDeal();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DealRow | null>(null);
  const [defaultStageId, setDefaultStageId] = useState<string | undefined>(undefined);
  const [dragging, setDragging] = useState<string | null>(null);

  function openNew(stageId?: string) {
    setEditing(null);
    setDefaultStageId(stageId);
    setOpen(true);
  }

  if (loadingPipelines || !pipelineId) {
    return (
      <div>
        <PageHeader title="Pipeline" description="Tablero de oportunidades por etapa." />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="nexus-page">
      <PageHeader
        title="Pipeline"
        description="Arrastra una oportunidad para cambiarla de etapa."
        actions={
          <Button className="rounded-lg shadow-sm" onClick={() => openNew(stages?.[0]?.id)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva oportunidad
          </Button>
        }
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {(stages ?? []).map((stage) => {
          const stageDeals = (deals ?? []).filter((deal) => deal.stage_id === stage.id);
          const total = stageDeals.reduce((sum, deal) => sum + Number(deal.amount), 0);
          return (
            <div
              key={stage.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragging) move.mutate({ id: dragging, stage_id: stage.id });
                setDragging(null);
              }}
              className="flex w-[290px] shrink-0 flex-col rounded-xl border bg-muted/45"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{stage.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {stageDeals.length} · {formatCurrency(total)}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-md bg-background text-xs">
                  {stage.default_probability}%
                </Badge>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-2.5">
                {isLoading ? <Skeleton className="h-20 w-full" /> : null}
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => setDragging(deal.id)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => {
                      setEditing(deal);
                      setDefaultStageId(undefined);
                      setOpen(true);
                    }}
                    className="group cursor-pointer rounded-lg border bg-card p-3.5 shadow-[0_1px_2px_rgb(16_16_20/0.05)] transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight">{deal.title}</p>
                      <button
                        type="button"
                        aria-label="Eliminar oportunidad"
                        onClick={(event) => {
                          event.stopPropagation();
                          remove.mutate(deal.id);
                        }}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm font-semibold tabular-nums">
                      {formatCurrency(Number(deal.amount))}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {deal.companies?.name ?? "Sin empresa"}
                    </p>
                    {deal.expected_close_date ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cierre: {formatDate(deal.expected_close_date)}
                      </p>
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => openNew(stage.id)}
                  className="rounded-lg border border-dashed py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-background hover:text-primary"
                >
                  Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <DealDialog
        open={open}
        onOpenChange={setOpen}
        pipelineId={pipelineId}
        deal={editing}
        {...(defaultStageId ? { defaultStageId } : {})}
      />
    </div>
  );
}
