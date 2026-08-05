import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EntityDialog } from "@/components/crm/entity-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  LIFECYCLE_STAGES,
  STATUS_LABEL,
  useCompanies,
  useSaveContact,
  type Contact,
} from "@/lib/crm";

const NONE = "__none__";

const schema = z.object({
  first_name: z.string().trim().min(2, "Mínimo 2 caracteres").max(60),
  last_name: z.string().trim().min(2, "Mínimo 2 caracteres").max(60),
  email: z.union([z.literal(""), z.string().trim().email("Correo inválido").max(255)]),
  phone: z.string().trim().max(40).optional(),
  job_title: z.string().trim().max(80).optional(),
  company_id: z.string(),
  lifecycle_stage: z.enum(LIFECYCLE_STAGES),
  notes: z.string().trim().max(2000).optional(),
});

type Values = z.infer<typeof schema>;

const empty: Values = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  job_title: "",
  company_id: NONE,
  lifecycle_stage: "lead",
  notes: "",
};

export function ContactDialog({
  open,
  onOpenChange,
  contact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
}) {
  const save = useSaveContact();
  const { data: companies } = useCompanies();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    form.reset(
      contact
        ? {
            first_name: contact.first_name,
            last_name: contact.last_name,
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            job_title: contact.job_title ?? "",
            company_id: contact.company_id ?? NONE,
            lifecycle_stage: (contact.lifecycle_stage as Values["lifecycle_stage"]) ?? "lead",
            notes: contact.notes ?? "",
          }
        : empty,
    );
  }, [open, contact, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    await save.mutateAsync({
      id: contact?.id,
      values: {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || null,
        phone: values.phone || null,
        job_title: values.job_title || null,
        company_id: values.company_id === NONE ? null : values.company_id,
        lifecycle_stage: values.lifecycle_stage,
        notes: values.notes || null,
      },
    });
    onOpenChange(false);
  });

  return (
    <EntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={contact ? "Editar contacto" : "Nuevo contacto"}
      description="Persona de contacto dentro de una empresa."
      onSubmit={onSubmit}
      submitting={form.formState.isSubmitting}
    >
      <Form {...form}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="job_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="Gerente de compras" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lifecycle_stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etapa</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LIFECYCLE_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {STATUS_LABEL[stage]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Empresa</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin empresa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>Sin empresa</SelectItem>
                    {(companies ?? []).map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Notas</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </EntityDialog>
  );
}
