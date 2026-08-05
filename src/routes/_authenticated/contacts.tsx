import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { ContactDialog } from "@/components/crm/contact-dialog";
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
import { STATUS_LABEL, useContacts, useDeleteContact, type Contact } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "Contactos | Nexo CRM" },
      { name: "description", content: "Personas con las que trabaja tu equipo comercial." },
      { property: "og:title", content: "Contactos | Nexo CRM" },
      { property: "og:description", content: "Personas con las que trabaja tu equipo comercial." },
    ],
  }),
  component: Page,
});

function Page() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const { data, isLoading } = useContacts(search);
  const remove = useDeleteContact();

  return (
    <div className="nexus-page">
      <PageHeader
        title="Contactos"
        description="Personas con las que trabaja tu equipo comercial."
        actions={
          <Button
            className="rounded-lg shadow-sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo contacto
          </Button>
        }
      />

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por nombre o correo..."
        className="mb-4 h-9 max-w-sm rounded-lg bg-card"
      />

      <div className="nexus-table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Etapa</TableHead>
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
              <TableRow className="bg-muted/45 hover:bg-muted/45">
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Aún no tienes contactos registrados.
                </TableCell>
              </TableRow>
            ) : (
              (data ?? []).map((contact) => (
                <TableRow key={contact.id} className="hover:bg-muted/35">
                  <TableCell className="font-semibold">
                    {contact.first_name} {contact.last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.companies?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.job_title ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{contact.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{contact.phone ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-md font-medium">
                      {STATUS_LABEL[contact.lifecycle_stage] ?? contact.lifecycle_stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(contact);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(contact.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ContactDialog open={open} onOpenChange={setOpen} contact={editing} />
    </div>
  );
}
