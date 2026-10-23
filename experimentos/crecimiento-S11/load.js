import http from "k6/http";
import { sleep } from "k6";
import exec from "k6/execution";
import { Trend, Rate, Counter } from "k6/metrics";

const levels = [5, 50, 100, 150, 200];
const seconds = Number(__ENV.GROWTH_SECONDS || 30);
const latency = new Trend("crm_latency", true);
const errors = new Rate("crm_errors");
const useful = new Counter("crm_useful");
const samples = new Counter("crm_samples");
const scenarios = {};
const thresholds = {};
levels.forEach((vus, i) => {
  scenarios["level" + vus] = {
    executor: "constant-vus",
    vus,
    duration: seconds + "s",
    startTime: i * (seconds + 5) + "s",
    gracefulStop: "3s",
    tags: { level: String(vus) },
  };
  // Create tagged summaries without turning observed degradation into a failed instrument.
  thresholds["crm_latency{level:" + vus + "}"] = ["p(95)>=0"];
  thresholds["crm_samples{level:" + vus + "}"] = ["count>0"];
  thresholds["crm_errors{level:" + vus + "}"] = ["rate>=0"];
  thresholds["crm_useful{level:" + vus + "}"] = ["count>=0"];
});
export const options = {
  scenarios,
  thresholds,
  summaryTrendStats: ["avg", "min", "max", "p(95)", "p(99)"],
};
export default function () {
  const all = exec.vu.iterationInScenario % 5 === 0;
  const filter = all
    ? "pipeline_id=eq." + __ENV.GROWTH_PIPELINE
    : "stage_id=in.(" + __ENV.GROWTH_HOT_STAGES + ")";
  const start = Date.now();
  const r = http.get(
    "http://127.0.0.1:8000/rest/v1/deals?" + filter + "&select=id,title,amount,stage_id",
    {
      headers: {
        apikey: __ENV.SUPABASE_ANON_KEY_TEST,
        Authorization: "Bearer " + __ENV.GROWTH_TOKEN,
      },
      timeout: "3s",
      tags: { name: all ? "pipeline" : "hot" },
    },
  );
  let valid = false;
  try {
    const body = r.json();
    valid =
      r.status === 200 &&
      Array.isArray(body) &&
      body.length === (all ? 1000 : 200) &&
      body.every(
        (row) =>
          typeof row.id === "string" &&
          typeof row.title === "string" &&
          typeof row.amount === "number" &&
          typeof row.stage_id === "string",
      );
  } catch {
    /* Invalid JSON is an error, even with HTTP 200. */
  }
  latency.add(Date.now() - start);
  samples.add(1);
  errors.add(!valid);
  useful.add(valid ? 1 : 0);
  sleep(0.1);
}
export function handleSummary(data) {
  return { ["/out/" + __ENV.GROWTH_RUN + ".json"]: JSON.stringify(data, null, 2) };
}
