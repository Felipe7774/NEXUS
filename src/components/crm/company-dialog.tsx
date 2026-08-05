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
import { COMPANY_STATUSES, STATUS_LABEL, useSaveCompany, type Company } from "@/lib/crm";

const schema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120 caracteres"),
  industry: z.string().trim().max(80).optional(),
  website: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(40).optional(),
  city: z.string().trim().max(80).optional(),
  status: z.enum(COMPANY_STATUSES),
  employee_count: z.string().trim().optional(),
  annual_revenue: z.string().trim().optional(),
  notes: z.string().trim().max(2000).optional(),
});

type Values = z.infer<typeof schema>;

const empty: Values = {
  name: "",
  industry: "",
  website: "",
  phone: "",
  city: "",
  status: "prospecto",
  employee_count: "",
  annual_revenue: "",
  notes: "",
};

export function CompanyDialog({
  open,
  onOpenChange,
  company,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
}) {
  const save = useSaveCompany();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    form.reset(
      company
        ? {
            name: company.name,
            industry: company.industry ?? "",
            website: company.website ?? "",
            phone: company.phone ?? "",
            city: company.city ?? "",
            status: (company.status as Values["status"]) ?? "prospecto",
            employee_count: company.employee_count?.toString() ?? "",
            annual_revenue: company.annual_revenue?.toString() ?? "",
            notes: company.notes ?? "",
          }
        : empty,
    );
  }, [open, company, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    await save.mutateAsync({
      id: company?.id,
      values: {
        name: values.name,
        industry: values.industry || null,
        website: values.website || null,
        phone: values.phone || null,
        city: values.city || null,
        status: values.status,
        employee_count: values.employee_count ? Number(values.employee_count) : null,
        annual_revenue: values.annual_revenue ? Number(values.annual_revenue) : null,
        notes: values.notes || null,
      },
    });
    onOpenChange(false);
  });

  return (
    <EntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={company ? "Editar empresa" : "Nueva empresa"}
      description="Datos de la cuenta con la que trabaja tu equipo."
      onSubmit={onSubmit}
      submitting={form.formState.isSubmitting}
    >
      <Form {...form}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Acme S.A.S." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industria</FormLabel>
                <FormControl>
                  <Input placeholder="Software" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMPANY_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABEL[status]}
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
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitio web</FormLabel>
                <FormControl>
                  <Input placeholder="acme.com" {...field} />
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
                  <Input placeholder="+57 300 000 0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input placeholder="Bogotá" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employee_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empleados</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="annual_revenue"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Ingresos anuales (COP)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
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
