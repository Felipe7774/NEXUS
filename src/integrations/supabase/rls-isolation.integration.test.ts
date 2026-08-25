import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";
import type { Database } from "./types";

// Prueba de integracion real contra Postgres (via `npx supabase start` local).
// Verifica el Escenario 1 (Seguridad) de dossier/02-escenarios-de-calidad.md:
// un usuario autenticado no puede leer companies/contacts de otro usuario.
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
  let userAId: string;
  let userBId: string;
  let userAClient: ReturnType<typeof createClient<Database>>;
  let userBClient: ReturnType<typeof createClient<Database>>;
  let companyAId: string;

  beforeAll(async () => {
    const admin = createClient<Database>(SUPABASE_URL!, SERVICE_ROLE_KEY!);
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

    const { data: userB, error: errB } = await admin.auth.admin.createUser({
      email: `rls-test-b-${suffix}@nexo.invalid`,
      password: passwordB,
      email_confirm: true,
    });
    if (errB || !userB.user) throw new Error(`No se pudo crear usuario B: ${errB?.message}`);
    userBId = userB.user.id;

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
    if (companyErr || !company) throw new Error(`No se pudo crear la company de A: ${companyErr?.message}`);
    companyAId = company.id;
  });

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
});
