import { companySummaries, contactSummaries } from "@/modules/relationships/api";
import { dealSummaries } from "@/modules/sales/api";
import type { Deal, Activity, DealRow, ActivityRow } from "@/modules/contracts";

const byId = <T extends { id: string }>(rows: T[]) => new Map(rows.map((row) => [row.id, row]));

export async function enrichDeals(rows: Deal[]): Promise<DealRow[]> {
  const [companies, contacts] = await Promise.all([
    companySummaries(rows.map((row) => row.company_id)),
    contactSummaries(rows.map((row) => row.contact_id)),
  ]);
  const c = byId(companies),
    p = byId(contacts);
  return rows.map((row) => ({
    ...row,
    companies: row.company_id ? (c.get(row.company_id) ?? null) : null,
    contacts: row.contact_id ? (p.get(row.contact_id) ?? null) : null,
  }));
}

export async function enrichActivities(rows: Activity[]): Promise<ActivityRow[]> {
  const [companies, contacts, deals] = await Promise.all([
    companySummaries(rows.map((row) => row.company_id)),
    contactSummaries(rows.map((row) => row.contact_id)),
    dealSummaries(rows.map((row) => row.deal_id)),
  ]);
  const c = byId(companies),
    p = byId(contacts),
    d = byId(deals);
  return rows.map((row) => ({
    ...row,
    companies: row.company_id ? (c.get(row.company_id) ?? null) : null,
    contacts: row.contact_id ? (p.get(row.contact_id) ?? null) : null,
    deals: row.deal_id ? (d.get(row.deal_id) ?? null) : null,
  }));
}
