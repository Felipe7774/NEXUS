import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import {
  saveCompany,
  readCompanies,
  saveContact,
  readContacts,
  deleteCompany,
  deleteContact,
} from "@/modules/relationships/api";
import { saveDeal, readDeals, moveDeal, deleteDeal } from "@/modules/sales/api";
import {
  saveActivity,
  readActivities,
  toggleActivity,
  deleteActivity,
} from "@/modules/followup/api";
import { enrichDeals, enrichActivities } from "@/lib/crm-composition";

const url = process.env["SUPABASE_URL_TEST"];
const key = process.env["SUPABASE_SERVICE_ROLE_KEY_TEST"];
describe.skipIf(!url || !key)("APIs modulares con RLS real", () => {
  let admin: ReturnType<typeof createClient<Database>>;
  const users: { id: string; email: string; password: string }[] = [];
  let pipeline = "",
    stage = "",
    secondStage = "";
  const company = randomUUID(),
    contact = randomUUID(),
    deal = randomUUID(),
    activity = randomUUID();
  beforeAll(async () => {
    expect(new URL(url!).hostname).toBe("127.0.0.1");
    admin = createClient<Database>(url!, key!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    for (let i = 0; i < 2; i++) {
      const email = randomUUID() + "@nexo.invalid",
        password = randomUUID() + "!";
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error || !data.user) throw error ?? new Error("No se creó usuario");
      users.push({ id: data.user.id, email, password });
    }
    const p = await admin
      .from("pipelines")
      .insert({ name: "Module APIs " + randomUUID() })
      .select()
      .single();
    if (p.error) throw p.error;
    pipeline = p.data.id;
    const s = await admin
      .from("stages")
      .insert([0, 1].map((position) => ({ pipeline_id: pipeline, position, name: "S" + position })))
      .select();
    if (s.error) throw s.error;
    stage = s.data[0]!.id;
    secondStage = s.data[1]!.id;
    const auth = await supabase.auth.signInWithPassword(users[0]!);
    if (auth.error) throw auth.error;
  }, 30000);
  afterAll(async () => {
    await supabase.auth.signOut();
    if (!admin) return;
    for (const [table, id] of [
      ["activities", activity],
      ["deals", deal],
      ["contacts", contact],
      ["companies", company],
      ["pipelines", pipeline],
    ] as const) {
      if (id) {
        const r = await admin.from(table).delete().eq("id", id);
        if (r.error) throw r.error;
      }
    }
    for (const u of users) {
      const roles = await admin.from("user_roles").delete().eq("user_id", u.id);
      const profile = await admin.from("profiles").delete().eq("id", u.id);
      if (roles.error || profile.error) throw roles.error ?? profile.error;
      const r = await admin.auth.admin.deleteUser(u.id);
      if (r.error) throw r.error;
    }
  }, 30000);
  it("conserva CRUD, composición de nombres, filtros y aislamiento entre usuarios", async () => {
    await saveCompany({ values: { id: company, name: "Empresa modular" } });
    await saveContact({
      values: { id: contact, first_name: "Ana", last_name: "Test", company_id: company },
    });
    await saveDeal({
      values: {
        id: deal,
        title: "Venta modular",
        pipeline_id: pipeline,
        stage_id: stage,
        company_id: company,
        contact_id: contact,
      },
    });
    await saveActivity({
      values: {
        id: activity,
        type: "tarea",
        subject: "Llamar",
        company_id: company,
        contact_id: contact,
        deal_id: deal,
      },
    });
    const deals = await enrichDeals(await readDeals(pipeline));
    expect(deals[0]?.companies?.name).toBe("Empresa modular");
    expect(deals[0]?.contacts?.first_name).toBe("Ana");
    expect((await readContacts())[0]?.companies?.name).toBe("Empresa modular");
    expect((await enrichActivities(await readActivities("pending")))[0]?.deals?.title).toBe(
      "Venta modular",
    );
    await saveCompany({ id: company, values: { name: "Empresa actualizada" } });
    await moveDeal({ id: deal, stage_id: secondStage });
    expect((await enrichDeals(await readDeals(pipeline)))[0]).toMatchObject({
      stage_id: secondStage,
      companies: { name: "Empresa actualizada" },
    });
    await toggleActivity({ id: activity, done: true });
    expect(await readActivities("pending")).toHaveLength(0);
    expect(await readActivities("done")).toHaveLength(1);
    await supabase.auth.signOut();
    const auth = await supabase.auth.signInWithPassword(users[1]!);
    if (auth.error) throw auth.error;
    expect(await readDeals(pipeline)).toHaveLength(0);
    expect(await readCompanies()).toHaveLength(0);
    expect(await readActivities()).toHaveLength(0);
    await supabase.auth.signOut();
    const again = await supabase.auth.signInWithPassword(users[0]!);
    if (again.error) throw again.error;
    await deleteActivity(activity);
    await deleteDeal(deal);
    await deleteContact(contact);
    await deleteCompany(company);
    expect(await readActivities()).toHaveLength(0);
    expect(await readDeals(pipeline)).toHaveLength(0);
    expect(await readContacts()).toHaveLength(0);
    expect(await readCompanies()).toHaveLength(0);
  }, 30000);
});
