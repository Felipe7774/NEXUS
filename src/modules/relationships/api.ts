import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { Contact } from "@/modules/contracts";
import { currentUserId } from "@/modules/identity/api";
import { lookupBatches } from "@/modules/lookup";
export const companySummaries = (ids: (string | null)[]) =>
  lookupBatches(ids, (batch) => supabase.from("companies").select("id, name").in("id", batch));
export const contactSummaries = (ids: (string | null)[]) =>
  lookupBatches(ids, (batch) =>
    supabase.from("contacts").select("id, first_name, last_name").in("id", batch),
  );
export const readCompanies = async (search = "") => {
  let query = supabase
    .from("companies")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const saveCompany = async (input: {
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
};

export const deleteCompany = async (id: string) => {
  const { error } = await supabase
    .from("companies")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
};

export const readContacts = async (search = "") => {
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
};

export const saveContact = async (input: {
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
};

export const deleteContact = async (id: string) => {
  const { error } = await supabase
    .from("contacts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
};
