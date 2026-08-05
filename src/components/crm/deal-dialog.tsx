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
import { useCompanies, useContacts, useSaveDeal, useStages, type Deal } from "@/lib/crm";

const NONE = "__none__";

const schema = z.object({
  title: z.string().trim().min(2, "Mínimo 2 caracteres").max(140),
  amount: z.string().trim().min(1, "Indica un monto"),
  stage_id: z.string().min(1, "Selecciona una etapa"),
  company_id: z.string(),
  contact_id: z.string(),
  expected_close_date: z.string(),
});

type Values = z.infer<typeof schema>;

export function DealDialog({
  open,
  onOpenChange,
  pipelineId,
  deal,
  defaultStageId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string;
  deal?: Deal | null;
  defaultStageId?: string;
}) {
  const save = useSaveDeal();
  const { data: stages } = useStages(pipelineId);
  const { data: companies } = useCompanies();
  const { data: contacts } = useContacts();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      amount: "0",
      stage_id: "",
      company_id: NONE,
      contact_id: NONE,
      expected_close_date: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      title: deal?.title ?? "",
      amount: deal ? String(deal.amount) : "0",
      stage_id: deal?.stage_id ?? defaultStageId ?? stages?.[0]?.id ?? "",
      company_id: deal?.company_id ?? NONE,
      contact_id: deal?.contact_id ?? NONE,
      expected_close_date: deal?.expected_close_date ?? "",
    });
  }, [open, deal, defaultStageId, stages, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    await save.mutateAsync({
      id: deal?.id,
      values: {
        title: values.title,
        amount: Number(values.amount || 0),
        pipeline_id: pipelineId,
        stage_id: values.stage_id,
        company_id: values.company_id === NONE ? null : values.company_id,
        contact_id: values.contact_id === NONE ? null : values.contact_id,
        expected_close_date: values.expected_close_date || null,
      },
    });
    onOpenChange(false);
  });

  return (
    <EntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={deal ? "Editar oportunidad" : "Nueva oportunidad"}
      description="La probabilidad y el estado se calculan según la etapa."
      onSubmit={onSubmit}
      submitting={form.formState.isSubmitting}
    >
      <Form {...form}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Implementación ERP - Acme" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto (COP)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={1000} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stage_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etapa</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(stages ?? []).map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
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
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
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
            name="contact_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contacto</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>Sin contacto</SelectItem>
                    {(contacts ?? []).map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
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
            name="expected_close_date"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Cierre estimado</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
