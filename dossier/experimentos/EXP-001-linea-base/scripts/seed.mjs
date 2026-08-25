// Siembra de datos para la medicion de linea base (Escenario 3, dossier/02-escenarios-de-calidad.md).
// Semilla decidida por el equipo el 25/08/2026: 20 companies, 800 contacts, 1000 deals,
// con 200 deals "calientes" (etapas Negociacion / Propuesta enviada) para la distribucion 80/20.
//
// Uso: node seed.mjs
// Requiere: stack local de Supabase corriendo (npx supabase start) y las variables
// SEED_SUPABASE_URL / SEED_SUPABASE_SERVICE_ROLE_KEY apuntando a esa instancia LOCAL.
// Nunca correr esto contra el proyecto de Supabase real.

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
    email: `seed-owner-${suffix}@nexo.invalid`,
    password: `SeedPass-${suffix}!`,
    email_confirm: true,
  });
  if (userErr || !userData.user) throw new Error(`No se pudo crear el usuario semilla: ${userErr?.message}`);
  const ownerId = userData.user.id;
  console.log(`   owner_id: ${ownerId}`);

  console.log("2) Buscando pipeline y etapas por defecto...");
  const { data: pipeline } = await admin.from("pipelines").select("id").eq("is_default", true).single();
  if (!pipeline) throw new Error("No se encontro el pipeline por defecto (revisar migracion inicial).");
  const { data: stages } = await admin.from("stages").select("id, name").eq("pipeline_id", pipeline.id);
  const stageByName = Object.fromEntries(stages.map((s) => [s.name, s.id]));
  const hotStageIds = [stageByName["Negociación"], stageByName["Propuesta enviada"]].filter(Boolean);
  const coldStageIds = stages.map((s) => s.id).filter((id) => !hotStageIds.includes(id));
  if (hotStageIds.length !== 2) throw new Error("No se encontraron las 2 etapas calientes esperadas.");

  console.log("3) Sembrando 20 companies...");
  const companiesPayload = Array.from({ length: 20 }, (_, i) => ({
    name: `Empresa semilla ${i + 1} (${suffix})`,
    owner_id: ownerId,
    status: "activo",
  }));
  const { data: companies, error: compErr } = await admin.from("companies").insert(companiesPayload).select("id");
  if (compErr) throw new Error(`Error sembrando companies: ${compErr.message}`);

  console.log("4) Sembrando 800 contacts...");
  const contactsPayload = Array.from({ length: 800 }, (_, i) => ({
    first_name: `Contacto${i + 1}`,
    last_name: `Semilla${suffix}`,
    company_id: companies[i % companies.length].id,
    owner_id: ownerId,
    lifecycle_stage: "cliente",
  }));
  for (let i = 0; i < contactsPayload.length; i += 200) {
    const chunk = contactsPayload.slice(i, i + 200);
    const { error } = await admin.from("contacts").insert(chunk);
    if (error) throw new Error(`Error sembrando contacts (chunk ${i}): ${error.message}`);
  }

  console.log("5) Sembrando 1000 deals (200 calientes en Negociacion/Propuesta enviada, 800 en el resto)...");
  const dealsPayload = [];
  for (let i = 0; i < 200; i++) {
    const hotStage = hotStageIds[i % 2];
    dealsPayload.push({
      title: `Oportunidad caliente ${i + 1} (${suffix})`,
      company_id: companies[i % companies.length].id,
      pipeline_id: pipeline.id,
      stage_id: hotStage,
      amount: 1000000 + i * 5000,
      owner_id: ownerId,
    });
  }
  for (let i = 0; i < 800; i++) {
    const coldStage = coldStageIds[i % coldStageIds.length];
    dealsPayload.push({
      title: `Oportunidad ${i + 1} (${suffix})`,
      company_id: companies[i % companies.length].id,
      pipeline_id: pipeline.id,
      stage_id: coldStage,
      amount: 500000 + i * 3000,
      owner_id: ownerId,
    });
  }
  const hotDealIds = [];
  const coldDealIds = [];
  for (let i = 0; i < dealsPayload.length; i += 200) {
    const chunk = dealsPayload.slice(i, i + 200);
    const { data, error } = await admin.from("deals").insert(chunk).select("id, stage_id");
    if (error) throw new Error(`Error sembrando deals (chunk ${i}): ${error.message}`);
    for (const row of data) {
      if (hotStageIds.includes(row.stage_id)) hotDealIds.push(row.id);
      else coldDealIds.push(row.id);
    }
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
    pipelineId: pipeline.id,
    hotStageIds,
    coldStageIds,
    hotDealCount: hotDealIds.length,
    coldDealCount: coldDealIds.length,
    userJwt: signIn.session.access_token,
  };
  writeFileSync(new URL("../resultados/seed-output.json", import.meta.url), JSON.stringify(output, null, 2));
  console.log("Listo. Resumen escrito en resultados/seed-output.json");
  console.log(`  companies: ${companies.length}, contacts: 800, deals calientes: ${hotDealIds.length}, deals frios: ${coldDealIds.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
