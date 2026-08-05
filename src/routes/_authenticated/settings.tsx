import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRoles } from "@/hooks/use-auth";
import { formatDate } from "@/lib/format";
import { usePipelines, useProfiles, useStages } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Configuración | Nexo CRM" },
      { name: "description", content: "Usuarios, pipelines, etapas y etiquetas." },
      { property: "og:title", content: "Configuración | Nexo CRM" },
      { property: "og:description", content: "Usuarios, pipelines, etapas y etiquetas." },
    ],
  }),
  component: Page,
});

function Page() {
  const { isAdmin, isLoading: loadingRoles } = useRoles();
  const { data: profiles, isLoading } = useProfiles();
  const { data: pipelines } = usePipelines();
  const { data: stages } = useStages(pipelines?.[0]?.id);

  if (loadingRoles) {
    return (
      <div>
        <PageHeader title="Configuración" description="Usuarios, pipelines y etapas." />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <PageHeader title="Configuración" description="Usuarios, pipelines y etapas." />
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          Solo los administradores pueden ver esta sección.
        </div>
      </div>
    );
  }

  return (
    <div className="nexus-page space-y-6">
      <PageHeader title="Configuración" description="Usuarios, pipelines y etapas." />

      <Card className="overflow-hidden rounded-xl shadow-[0_1px_2px_rgb(16_16_20/0.04)]">
        <CardHeader>
          <CardTitle className="text-sm">Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/45 hover:bg-muted/45">
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>Alta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ) : (
                (profiles ?? []).map((profile) => (
                  <TableRow key={profile.id} className="hover:bg-muted/35">
                    <TableCell className="font-semibold">{profile.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{profile.email}</TableCell>
                    <TableCell>
                      <Badge variant={profile.is_active ? "secondary" : "outline"}>
                        {profile.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(profile.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-[0_1px_2px_rgb(16_16_20/0.04)]">
        <CardHeader>
          <CardTitle className="text-sm">
            Etapas de {pipelines?.[0]?.name ?? "el pipeline"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(stages ?? []).map((stage) => (
            <div
              key={stage.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
            >
              <span>
                {stage.position}. {stage.name}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {stage.default_probability}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
