import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "./types";

// Prueba de integracion real contra Postgres (via `npx supabase start` local).
// Verifica el Escenario 1 (Seguridad) de dossier/02-escenarios-de-calidad.md:
// un usuario autenticado no puede leer datos de negocio de otro usuario.
//
// Alcance acordado en el mini-comite 2 del 23/10/2026 (dossier/25-acta-mini-comite-2.md,
// respuesta 4): las cuatro tablas con datos de negocio por dueno. Antes cubria solo
// companies, y el riesgo R4 declaraba ese hueco.
//
// Requiere el stack local de Supabase corriendo. Se salta automaticamente
// si SUPABASE_URL_TEST no esta configurada (no bloquea `npm test` en CI
// sin Docker disponible).

const SUPABASE_URL = process.env["SUPABASE_URL_TEST"];
const ANON_KEY = process.env["SUPABASE_ANON_KEY_TEST"];
const SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY_TEST"];

const hasLocalStack = Boolean(SUPABASE_URL && ANON_KEY && SERVICE_ROLE_KEY);
const describeIfLocalStack = hasLocalStack ? describe : describe.skip;

describeIfLocalStack("RLS: aislamiento entre usuarios (Escenario 1)", () => {
  let admin: ReturnType<typeof createClient<Database>> | undefined;
  const createdUsers: string[] = [];
  let userAId: string;
  let userBId: string;
  let userAClient: ReturnType<typeof createClient<Database>>;
  let userBClient: ReturnType<typeof createClient<Database>>;
  let companyAId: string;
  let contactAId: string;
  let dealAId: string;
  let activityAId: string;

  beforeAll(async () => {
    const target = new URL(SUPABASE_URL!);
    if (
      target.protocol !== "http:" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(target.hostname) ||
      target.username ||
      target.password ||
      target.search ||
      target.hash
    )
      throw new Error("Las pruebas RLS solo admiten un Supabase local en loopback");
    admin = createClient<Database>(SUPABASE_URL!, SERVICE_ROLE_KEY!);
    const suffix = Date.now();
    const passwordA = `TestPass-A-${suffix}!`;
    const passwordB = `TestPass-B-${suffix}!`;

    const { data: userA, error: errA } = await admin.auth.admin.createUser({
      email: `rls-test-a-${suffix}@nexo.invalid`,
      password: passwordA,
      email_confirm: true,
    });
    if (errA || !userA.user) throw new Error(`No se pudo crear usuario A: ${errA?.message}`);
    userAId = userA.user.id;
    createdUsers.push(userAId);

    const { data: userB, error: errB } = await admin.auth.admin.createUser({
      email: `rls-test-b-${suffix}@nexo.invalid`,
      password: passwordB,
      email_confirm: true,
    });
    if (errB || !userB.user) throw new Error(`No se pudo crear usuario B: ${errB?.message}`);
    userBId = userB.user.id;
    createdUsers.push(userBId);

    userAClient = createClient<Database>(SUPABASE_URL!, ANON_KEY!);
    const { error: signInAErr } = await userAClient.auth.signInWithPassword({
      email: userA.user.email!,
      password: passwordA,
    });
    if (signInAErr) throw new Error(`No se pudo iniciar sesion como A: ${signInAErr.message}`);

    userBClient = createClient<Database>(SUPABASE_URL!, ANON_KEY!);
    const { error: signInBErr } = await userBClient.auth.signInWithPassword({
      email: userB.user.email!,
      password: passwordB,
    });
    if (signInBErr) throw new Error(`No se pudo iniciar sesion como B: ${signInBErr.message}`);

    const { data: company, error: companyErr } = await userAClient
      .from("companies")
      .insert({ name: `Empresa privada de A ${suffix}`, owner_id: userAId })
      .select("id")
      .single();
    if (companyErr || !company)
      throw new Error(`No se pudo crear la company de A: ${companyErr?.message}`);
    companyAId = company.id;

    const { data: contact, error: contactErr } = await userAClient
      .from("contacts")
      .insert({ first_name: "Contacto", last_name: `privado de A ${suffix}`, owner_id: userAId })
      .select("id")
      .single();
    if (contactErr || !contact)
      throw new Error(`No se pudo crear el contact de A: ${contactErr?.message}`);
    contactAId = contact.id;

    // El pipeline y las etapas vienen sembrados por migracion y son legibles por
    // cualquier autenticado (pipelines_select/stages_select con USING (true)).
    const { data: stage, error: stageErr } = await userAClient
      .from("stages")
      .select("id, pipeline_id")
      .order("position")
      .limit(1)
      .single();
    if (stageErr || !stage) throw new Error(`No se pudo leer la etapa semilla: ${stageErr?.message}`);

    const { data: deal, error: dealErr } = await userAClient
      .from("deals")
      .insert({
        title: `Oportunidad privada de A ${suffix}`,
        pipeline_id: stage.pipeline_id,
        stage_id: stage.id,
        owner_id: userAId,
      })
      .select("id")
      .single();
    if (dealErr || !deal) throw new Error(`No se pudo crear el deal de A: ${dealErr?.message}`);
    dealAId = deal.id;

    const { data: activity, error: activityErr } = await userAClient
      .from("activities")
      .insert({
        type: "tarea",
        subject: `Actividad privada de A ${suffix}`,
        assigned_to: userAId,
        created_by: userAId,
      })
      .select("id")
      .single();
    if (activityErr || !activity)
      throw new Error(`No se pudo crear la activity de A: ${activityErr?.message}`);
    activityAId = activity.id;
  }, 30000);

  afterAll(async () => {
    if (!admin) return;
    // Orden inverso a las dependencias: actividad, oportunidad, contacto, empresa.
    if (activityAId) {
      const { error } = await admin.from("activities").delete().eq("id", activityAId);
      if (error) throw new Error(`No se pudo limpiar la actividad sintética: ${error.message}`);
    }
    if (dealAId) {
      const { error } = await admin.from("deals").delete().eq("id", dealAId);
      if (error) throw new Error(`No se pudo limpiar la oportunidad sintética: ${error.message}`);
    }
    if (contactAId) {
      const { error } = await admin.from("contacts").delete().eq("id", contactAId);
      if (error) throw new Error(`No se pudo limpiar el contacto sintético: ${error.message}`);
    }
    if (companyAId) {
      const { error } = await admin.from("companies").delete().eq("id", companyAId);
      if (error) throw new Error(`No se pudo limpiar la empresa sintética: ${error.message}`);
    }
    for (const id of createdUsers) {
      const roles = await admin.from("user_roles").delete().eq("user_id", id);
      const profile = await admin.from("profiles").delete().eq("id", id);
      const auth = await admin.auth.admin.deleteUser(id);
      if (roles.error || profile.error || auth.error)
        throw new Error("Falló la limpieza del usuario sintético RLS");
    }
  }, 30000);

  it("el dueño puede ver su propia empresa", async () => {
    const { data, error } = await userAClient.from("companies").select("id").eq("id", companyAId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("otro usuario autenticado NO puede ver la empresa ajena (RLS)", async () => {
    const { data, error } = await userBClient.from("companies").select("id").eq("id", companyAId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("el dueño puede ver su propio contacto", async () => {
    const { data, error } = await userAClient.from("contacts").select("id").eq("id", contactAId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("otro usuario autenticado NO puede ver el contacto ajeno (RLS)", async () => {
    const { data, error } = await userBClient.from("contacts").select("id").eq("id", contactAId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("el dueño puede ver su propia oportunidad", async () => {
    const { data, error } = await userAClient.from("deals").select("id").eq("id", dealAId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("otro usuario autenticado NO puede ver la oportunidad ajena (RLS)", async () => {
    const { data, error } = await userBClient.from("deals").select("id").eq("id", dealAId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("el asignado puede ver su propia actividad", async () => {
    const { data, error } = await userAClient.from("activities").select("id").eq("id", activityAId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("otro usuario autenticado NO puede ver la actividad ajena (RLS)", async () => {
    const { data, error } = await userBClient.from("activities").select("id").eq("id", activityAId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});
