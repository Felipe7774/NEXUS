import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { CompanyDialog } from "@/components/crm/company-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { STATUS_LABEL, useCompanies, useDeleteCompany, type Company } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/companies")({
  head: () => ({
    meta: [
      { title: "Empresas | Nexo CRM" },
      { name: "description", content: "Cuentas y organizaciones registradas." },
      { property: "og:title", content: "Empresas | Nexo CRM" },
      { property: "og:description", content: "Cuentas y organizaciones registradas." },
    ],
  }),
  component: Page,
});

function Page() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const { data, isLoading } = useCompanies(search);
  const remove = useDeleteCompany();

  return (
    <div>
      <PageHeader
        title="Empresas"
        description="Cuentas y organizaciones registradas."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva empresa
          </Button>
        }
      />

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por nombre..."
        className="mb-4 max-w-sm"
      />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Industria</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ingresos</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : (data ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Aún no tienes empresas registradas.
                </TableCell>
              </TableRow>
            ) : (
              (data ?? []).map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="text-muted-foreground">{company.industry ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{company.city ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {STATUS_LABEL[company.status] ?? company.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {company.annual_revenue ? formatCurrency(Number(company.annual_revenue)) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(company.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(company);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(company.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CompanyDialog open={open} onOpenChange={setOpen} company={editing} />
    </div>
  );
}
