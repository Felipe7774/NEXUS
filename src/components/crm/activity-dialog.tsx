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
  ACTIVITY_PRIORITIES,
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABEL,
  STATUS_LABEL,
  useDeals,
  useSaveActivity,
  type Activity,
} from "@/lib/crm";

const NONE = "__none__";

const schema = z.object({
  subject: z.string().trim().min(2, "Mínimo 2 caracteres").max(140),
  type: z.enum(ACTIVITY_TYPES),
  priority: z.enum(ACTIVITY_PRIORITIES),
  due_at: z.string(),
  deal_id: z.string(),
  description: z.string().trim().max(2000).optional(),
});

type Values = z.infer<typeof schema>;

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ActivityDialog({
  open,
  onOpenChange,
  activity,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
}) {
  const save = useSaveActivity();
  const { data: deals } = useDeals();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: "",
      type: "tarea",
      priority: "media",
      due_at: "",
      deal_id: NONE,
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      subject: activity?.subject ?? "",
      type: (activity?.type as Values["type"]) ?? "tarea",
      priority: (activity?.priority as Values["priority"]) ?? "media",
      due_at: toLocalInput(activity?.due_at ?? null),
      deal_id: activity?.deal_id ?? NONE,
      description: activity?.description ?? "",
    });
  }, [open, activity, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    await save.mutateAsync({
      id: activity?.id,
      values: {
        subject: values.subject,
        type: values.type,
        priority: values.priority,
        due_at: values.due_at ? new Date(values.due_at).toISOString() : null,
        deal_id: values.deal_id === NONE ? null : values.deal_id,
        description: values.description || null,
      },
    });
    onOpenChange(false);
  });

  return (
    <EntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={activity ? "Editar actividad" : "Nueva actividad"}
      description="Tareas, llamadas, reuniones y notas del equipo."
      onSubmit={onSubmit}
      submitting={form.formState.isSubmitting}
    >
      <Form {...form}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Asunto</FormLabel>
                <FormControl>
                  <Input placeholder="Llamar para seguimiento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {ACTIVITY_TYPE_LABEL[type]}
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
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ACTIVITY_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {STATUS_LABEL[priority]}
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
            name="due_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vence</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deal_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Oportunidad</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>Sin oportunidad</SelectItem>
                    {(deals ?? []).map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.title}
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
            name="description"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Descripción</FormLabel>
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
