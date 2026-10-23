import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { Contact } from "@/modules/contracts";
import { currentUserId } from "@/modules/identity/api";
export const readActivities = async (filter: "all" | "pending" | "done" = "all") => {
  let query = supabase
    .from("activities")
    .select("*")
    .order("due_at", { ascending: true, nullsFirst: false });
  if (filter === "pending") query = query.is("completed_at", null);
  if (filter === "done") query = query.not("completed_at", "is", null);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const saveActivity = async (input: {
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
};

export const toggleActivity = async (input: { id: string; done: boolean }) => {
  const { error } = await supabase
    .from("activities")
    .update({ completed_at: input.done ? new Date().toISOString() : null })
    .eq("id", input.id);
  if (error) throw error;
};

export const deleteActivity = async (id: string) => {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw error;
};
