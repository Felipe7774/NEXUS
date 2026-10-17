import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { Contact } from "@/modules/contracts";
import { currentUserId } from "@/modules/identity/api";
import { lookupBatches } from "@/modules/lookup";
export const dealSummaries = (ids: (string | null)[]) =>
  lookupBatches(ids, (batch) => supabase.from("deals").select("id, title").in("id", batch));
export const readPipelines = async () => {
  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .order("is_default", { ascending: false })
    .order("name");
  if (error) throw error;
  return data;
};

export const readStages = async (pipelineId?: string) => {
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .eq("pipeline_id", pipelineId!)
    .order("position");
  if (error) throw error;
  return data;
};

export const readDeals = async (pipelineId?: string) => {
  let query = supabase.from("deals").select("*").is("deleted_at", null).order("position");
  if (pipelineId) query = query.eq("pipeline_id", pipelineId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const saveDeal = async (input: {
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
};

export const moveDeal = async (input: { id: string; stage_id: string }) => {
  const { error } = await supabase
    .from("deals")
    .update({ stage_id: input.stage_id })
    .eq("id", input.id);
  if (error) throw error;
};

export const deleteDeal = async (id: string) => {
  const { data, error } = await supabase.rpc("soft_delete_deal", { _id: id });
  if (error) throw error;
  if (!data) throw new Error("Oportunidad no disponible para eliminar");
};
