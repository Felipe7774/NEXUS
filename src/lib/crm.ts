export * from "@/modules/contracts";
import { enrichDeals, enrichActivities } from "./crm-composition";
import { readProfiles } from "@/modules/identity/api";
import {
  readCompanies,
  saveCompany,
  deleteCompany,
  readContacts,
  saveContact,
  deleteContact,
} from "@/modules/relationships/api";
import {
  readPipelines,
  readStages,
  readDeals,
  saveDeal,
  moveDeal,
  deleteDeal,
} from "@/modules/sales/api";
import {
  readActivities,
  saveActivity,
  toggleActivity,
  deleteActivity,
} from "@/modules/followup/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Keep these values aligned with the Postgres CHECK constraints in the Supabase migrations.

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
    queryFn: readProfiles,
  });
}

/* ---------------- companies ---------------- */

export function useCompanies(search = "") {
  return useQuery({
    queryKey: ["companies", search],
    queryFn: () => readCompanies(search),
  });
}

export function useSaveCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveCompany,
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
    mutationFn: deleteCompany,
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
    queryFn: () => readContacts(search),
  });
}

export function useSaveContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveContact,
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
    mutationFn: deleteContact,
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
    queryFn: readPipelines,
  });
}

export function useStages(pipelineId?: string) {
  return useQuery({
    queryKey: ["stages", pipelineId ?? "all"],
    enabled: Boolean(pipelineId),
    queryFn: () => readStages(pipelineId),
  });
}

/* ---------------- deals ---------------- */

export function useDeals(pipelineId?: string) {
  return useQuery({
    queryKey: ["deals", pipelineId ?? "all"],
    queryFn: async () => enrichDeals(await readDeals(pipelineId)),
  });
}

export function useSaveDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveDeal,
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
    mutationFn: moveDeal,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["deals"] });
    },
    onError: fail("No pudimos mover la oportunidad"),
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Oportunidad eliminada");
    },
    onError: fail("No pudimos eliminar la oportunidad"),
  });
}

/* ---------------- activities ---------------- */

export function useActivities(filter: "all" | "pending" | "done" = "all") {
  return useQuery({
    queryKey: ["activities", filter],
    queryFn: async () => enrichActivities(await readActivities(filter)),
  });
}

export function useSaveActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveActivity,
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
    mutationFn: toggleActivity,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: fail("No pudimos actualizar la actividad"),
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Actividad eliminada");
    },
    onError: fail("No pudimos eliminar la actividad"),
  });
}
