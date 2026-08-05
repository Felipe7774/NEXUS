import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Company = Tables<"companies">;
export type Contact = Tables<"contacts">;
export type Deal = Tables<"deals">;
export type Stage = Tables<"stages">;
export type Pipeline = Tables<"pipelines">;
export type Activity = Tables<"activities">;
export type Profile = Tables<"profiles">;

// Keep these values aligned with the Postgres CHECK constraints in the Supabase migrations.
export const COMPANY_STATUSES = ["prospecto", "activo", "inactivo", "churn"] as const;
export const LIFECYCLE_STAGES = [
  "lead",
  "contactado",
  "calificado",
  "oportunidad",
  "cliente",
  "perdido",
] as const;
export const ACTIVITY_TYPES = ["llamada", "reunion", "email", "tarea", "nota"] as const;
export const ACTIVITY_PRIORITIES = ["baja", "media", "alta"] as const;

export const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  llamada: "Llamada",
  reunion: "Reunión",
  email: "Correo",
  tarea: "Tarea",
  nota: "Nota",
};

export const STATUS_LABEL: Record<string, string> = {
  prospecto: "Prospecto",
  activo: "Activo",
  cliente: "Cliente",
  inactivo: "Inactivo",
  churn: "Churn",
  lead: "Lead",
  contactado: "Contactado",
  calificado: "Calificado",
  oportunidad: "Oportunidad",
  perdido: "Perdido",
  open: "Abierta",
  won: "Ganada",
  lost: "Perdida",
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sesión no disponible");
  return data.user.id;
}

function fail(message: string) {
  return (error: unknown) => {
    console.error(error);
    toast.error(message);
  };
}

/* ---------------- profiles ---------------- */

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("full_name");
      if (error) throw error;
      return data;
    },
  });
}

/* ---------------- companies ---------------- */

export function useCompanies(search = "") {
  return useQuery({
    queryKey: ["companies", search],
    queryFn: async () => {
      let query = supabase
        .from("companies")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string | undefined;
      values: Omit<TablesInsert<"companies">, "owner_id">;
    }) => {
      if (input.id) {
        const { error } = await supabase
          .from("companies")
          .update(input.values as TablesUpdate<"companies">)
          .eq("id", input.id);
        if (error) throw error;
        return;
      }
      const owner_id = await currentUserId();
      const { error } = await supabase.from("companies").insert({ ...input.values, owner_id });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Empresa guardada");
    },
    onError: fail("No pudimos guardar la empresa"),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("companies")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Empresa eliminada");
    },
    onError: fail("No pudimos eliminar la empresa"),
  });
}

/* ---------------- contacts ---------------- */

export function useContacts(search = "") {
  return useQuery({
    queryKey: ["contacts", search],
    queryFn: async () => {
      let query = supabase
        .from("contacts")
        .select("*, companies(id, name)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as (Contact & { companies: { id: string; name: string } | null })[];
    },
  });
}

export function useSaveContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string | undefined;
      values: Omit<TablesInsert<"contacts">, "owner_id">;
    }) => {
      if (input.id) {
        const { error } = await supabase
          .from("contacts")
          .update(input.values as TablesUpdate<"contacts">)
          .eq("id", input.id);
        if (error) throw error;
        return;
      }
      const owner_id = await currentUserId();
      const { error } = await supabase.from("contacts").insert({ ...input.values, owner_id });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contacto guardado");
    },
    onError: fail("No pudimos guardar el contacto"),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contacts")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contacto eliminado");
    },
    onError: fail("No pudimos eliminar el contacto"),
  });
}

/* ---------------- pipelines & stages ---------------- */

export function usePipelines() {
  return useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useStages(pipelineId?: string) {
  return useQuery({
    queryKey: ["stages", pipelineId ?? "all"],
    enabled: Boolean(pipelineId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .eq("pipeline_id", pipelineId!)
        .order("position");
      if (error) throw error;
      return data;
    },
  });
}

/* ---------------- deals ---------------- */

export type DealRow = Deal & {
  companies: { id: string; name: string } | null;
  contacts: { id: string; first_name: string; last_name: string } | null;
};

export function useDeals(pipelineId?: string) {
  return useQuery({
    queryKey: ["deals", pipelineId ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("deals")
        .select("*, companies(id, name), contacts(id, first_name, last_name)")
        .is("deleted_at", null)
        .order("position");
      if (pipelineId) query = query.eq("pipeline_id", pipelineId);
      const { data, error } = await query;
      if (error) throw error;
      return data as DealRow[];
    },
  });
}

export function useSaveDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string | undefined;
      values: Omit<TablesInsert<"deals">, "owner_id">;
    }) => {
      if (input.id) {
        const { error } = await supabase
          .from("deals")
          .update(input.values as TablesUpdate<"deals">)
          .eq("id", input.id);
        if (error) throw error;
        return;
      }
      const owner_id = await currentUserId();
      const { error } = await supabase.from("deals").insert({ ...input.values, owner_id });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Oportunidad guardada");
    },
    onError: fail("No pudimos guardar la oportunidad"),
  });
}

export function useMoveDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; stage_id: string }) => {
      const { error } = await supabase
        .from("deals")
        .update({ stage_id: input.stage_id })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["deals"] });
    },
    onError: fail("No pudimos mover la oportunidad"),
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("deals")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Oportunidad eliminada");
    },
    onError: fail("No pudimos eliminar la oportunidad"),
  });
}

/* ---------------- activities ---------------- */

export type ActivityRow = Activity & {
  deals: { id: string; title: string } | null;
  contacts: { id: string; first_name: string; last_name: string } | null;
  companies: { id: string; name: string } | null;
};

export function useActivities(filter: "all" | "pending" | "done" = "all") {
  return useQuery({
    queryKey: ["activities", filter],
    queryFn: async () => {
      let query = supabase
        .from("activities")
        .select("*, deals(id, title), contacts(id, first_name, last_name), companies(id, name)")
        .order("due_at", { ascending: true, nullsFirst: false });
      if (filter === "pending") query = query.is("completed_at", null);
      if (filter === "done") query = query.not("completed_at", "is", null);
      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityRow[];
    },
  });
}

export function useSaveActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string | undefined;
      values: Omit<TablesInsert<"activities">, "created_by" | "assigned_to"> & {
        assigned_to?: string;
      };
    }) => {
      if (input.id) {
        const { error } = await supabase
          .from("activities")
          .update(input.values as TablesUpdate<"activities">)
          .eq("id", input.id);
        if (error) throw error;
        return;
      }
      const uid = await currentUserId();
      const { error } = await supabase.from("activities").insert({
        ...input.values,
        created_by: uid,
        assigned_to: input.values.assigned_to ?? uid,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Actividad guardada");
    },
    onError: fail("No pudimos guardar la actividad"),
  });
}

export function useToggleActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; done: boolean }) => {
      const { error } = await supabase
        .from("activities")
        .update({ completed_at: input.done ? new Date().toISOString() : null })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: fail("No pudimos actualizar la actividad"),
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("activities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Actividad eliminada");
    },
    onError: fail("No pudimos eliminar la actividad"),
  });
}
