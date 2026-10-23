import type { Tables } from "@/integrations/supabase/types";
export type Company = Tables<"companies">;
export type Contact = Tables<"contacts">;
export type Deal = Tables<"deals">;
export type Stage = Tables<"stages">;
export type Pipeline = Tables<"pipelines">;
export type Activity = Tables<"activities">;
export type Profile = Tables<"profiles">;
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
export type DealRow = Deal & {
  companies: { id: string; name: string } | null;
  contacts: { id: string; first_name: string; last_name: string } | null;
};
export type ActivityRow = Activity & {
  deals: { id: string; title: string } | null;
  contacts: { id: string; first_name: string; last_name: string } | null;
  companies: { id: string; name: string } | null;
};
