export function phaseSummary(phase: unknown): Record<string, number>;
export function evaluate(result: unknown): {
  passed: true;
  healthyBudget: true;
  reducedAttempts: true;
  singleProbe: true;
  truthfulErrors: true;
  rls: true;
  summary: Record<string, Record<string, Record<string, number>>>;
};
