import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { ActivityDialog } from "@/components/crm/activity-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/format";
import {
  ACTIVITY_TYPE_LABEL,
  STATUS_LABEL,
  useActivities,
  useDeleteActivity,
  useToggleActivity,
  type ActivityRow,
} from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/activities")({
  head: () => ({
    meta: [
      { title: "Actividades | Nexo CRM" },
      { name: "description", content: "Tareas, llamadas, reuniones y notas." },
      { property: "og:title", content: "Actividades | Nexo CRM" },
      { property: "og:description", content: "Tareas, llamadas, reuniones y notas." },
    ],
  }),
  component: Page,
});

function Page() {
  const [filter, setFilter] = useState<"all" | "pending" | "done">("pending");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityRow | null>(null);
  const { data, isLoading } = useActivities(filter);
  const toggle = useToggleActivity();
  const remove = useDeleteActivity();

  return (
    <div className="nexus-page">
      <PageHeader
        title="Actividades"
        description="Tareas, llamadas, reuniones y notas."
        actions={
          <Button
            className="rounded-lg shadow-sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva actividad
          </Button>
        }
      />

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as typeof filter)}
        className="mb-4"
      >
        <TabsList className="rounded-lg bg-muted/70 p-1">
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="done">Completadas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))
        ) : (data ?? []).length === 0 ? (
          <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed bg-card text-sm text-muted-foreground">
            No hay actividades en esta vista.
          </div>
        ) : (
          (data ?? []).map((activity) => (
            <div
              key={activity.id}
              className="nexus-surface flex items-start gap-3 p-4 transition-shadow hover:shadow-sm"
            >
              <Checkbox
                checked={Boolean(activity.completed_at)}
                onCheckedChange={(checked) =>
                  toggle.mutate({ id: activity.id, done: checked === true })
                }
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={
                      activity.completed_at
                        ? "text-sm font-medium line-through text-muted-foreground"
                        : "text-sm font-medium"
                    }
                  >
                    {activity.subject}
                  </p>
                  <Badge variant="secondary" className="rounded-md text-xs">
                    {ACTIVITY_TYPE_LABEL[activity.type] ?? activity.type}
                  </Badge>
                  <Badge variant="outline" className="rounded-md text-xs">
                    {STATUS_LABEL[activity.priority] ?? activity.priority}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activity.due_at ? `Vence ${formatDateTime(activity.due_at)}` : "Sin fecha"}
                  {activity.deals?.title ? ` · ${activity.deals.title}` : ""}
                </p>
                {activity.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditing(activity);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(activity.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <ActivityDialog open={open} onOpenChange={setOpen} activity={editing} />
    </div>
  );
}
