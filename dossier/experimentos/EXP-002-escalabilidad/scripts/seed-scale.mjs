// Siembra de datos para el Escenario 6 (Escalabilidad, dossier/02-escenarios-de-calidad.md).
// Volumen definido en el escenario: 5.000 contacts y 1.000 deals.
//
// Uso: node seed-scale.mjs
// Requiere: stack local de Supabase corriendo (npx supabase start) y las variables
// SEED_SUPABASE_URL / SEED_SUPABASE_SERVICE_ROLE_KEY / SEED_SUPABASE_ANON_KEY
// apuntando a esa instancia LOCAL. Nunca correr esto contra el proyecto de Supabase real.

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

const SUPABASE_URL = process.env.SEED_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SEED_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltan SEED_SUPABASE_URL / SEED_SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!SUPABASE_URL.includes("127.0.0.1") && !SUPABASE_URL.includes("localhost")) {
  console.error(`SEED_SUPABASE_URL no parece local (${SUPABASE_URL}). Abortando por seguridad.`);
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const suffix = Date.now();

async function main() {
  console.log("1) Creando usuario semilla...");
  const { data: userData, error: userErr } = await admin.auth.admin.createUser({
    email: `seed-scale-${suffix}@nexo.invalid`,
    password: `SeedPass-${suffix}!`,
    email_confirm: true,
  });
  if (userErr || !userData.user) throw new Error(`No se pudo crear el usuario semilla: ${userErr?.message}`);
  const ownerId = userData.user.id;
  console.log(`   owner_id: ${ownerId}`);

  console.log("2) Buscando pipeline y etapas por defecto...");
  const { data: pipeline } = await admin.from("pipelines").select("id").eq("is_default", true).single();
  const { data: stages } = await admin.from("stages").select("id").eq("pipeline_id", pipeline.id);
  const stageIds = stages.map((s) => s.id);

  console.log("3) Sembrando 50 companies (base para distribuir contactos/deals)...");
  const companiesPayload = Array.from({ length: 50 }, (_, i) => ({
    name: `Empresa escalabilidad ${i + 1} (${suffix})`,
    owner_id: ownerId,
    status: "activo",
  }));
  const { data: companies, error: compErr } = await admin.from("companies").insert(companiesPayload).select("id");
  if (compErr) throw new Error(`Error sembrando companies: ${compErr.message}`);

  console.log("4) Sembrando 5.000 contacts...");
  const TOTAL_CONTACTS = 5000;
  for (let i = 0; i < TOTAL_CONTACTS; i += 500) {
    const size = Math.min(500, TOTAL_CONTACTS - i);
    const chunk = Array.from({ length: size }, (_, j) => ({
      first_name: `Contacto${i + j + 1}`,
      last_name: `Escala${suffix}`,
      company_id: companies[(i + j) % companies.length].id,
      owner_id: ownerId,
      lifecycle_stage: "cliente",
    }));
    const { error } = await admin.from("contacts").insert(chunk);
    if (error) throw new Error(`Error sembrando contacts (offset ${i}): ${error.message}`);
    console.log(`   ${i + size}/${TOTAL_CONTACTS} contacts`);
  }

  console.log("5) Sembrando 1.000 deals...");
  const TOTAL_DEALS = 1000;
  for (let i = 0; i < TOTAL_DEALS; i += 500) {
    const size = Math.min(500, TOTAL_DEALS - i);
    const chunk = Array.from({ length: size }, (_, j) => ({
      title: `Oportunidad escala ${i + j + 1} (${suffix})`,
      company_id: companies[(i + j) % companies.length].id,
      pipeline_id: pipeline.id,
      stage_id: stageIds[(i + j) % stageIds.length],
      amount: 500000 + (i + j) * 2500,
      owner_id: ownerId,
    }));
    const { error } = await admin.from("deals").insert(chunk);
    if (error) throw new Error(`Error sembrando deals (offset ${i}): ${error.message}`);
    console.log(`   ${i + size}/${TOTAL_DEALS} deals`);
  }

  console.log("6) Firmando in con el usuario semilla para obtener un JWT de prueba...");
  const anonClient = createClient(SUPABASE_URL, process.env.SEED_SUPABASE_ANON_KEY ?? "");
  const { data: signIn, error: signInErr } = await anonClient.auth.signInWithPassword({
    email: userData.user.email,
    password: `SeedPass-${suffix}!`,
  });
  if (signInErr) throw new Error(`No se pudo iniciar sesion con el usuario semilla: ${signInErr.message}`);

  const output = {
    seededAt: new Date().toISOString(),
    ownerId,
    ownerEmail: userData.user.email,
    companiesCount: companies.length,
    contactsCount: TOTAL_CONTACTS,
    dealsCount: TOTAL_DEALS,
    userJwt: signIn.session.access_token,
  };
  writeFileSync(new URL("../resultados/seed-output.json", import.meta.url), JSON.stringify(output, null, 2));
  console.log("Listo. Resumen escrito en resultados/seed-output.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
