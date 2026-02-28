export interface RouteStats {
  method: string;
  path: string;
  totalCalls: number;
  statusCodes: Record<number, number>;
  avgResponseTimeMs: number;
  minResponseTimeMs: number;
  maxResponseTimeMs: number;
  lastCalledAt: string | null;
}

const store = new Map<string, RouteStats>();

export function recordRequest(
  method: string,
  path: string,
  statusCode: number,
  responseTimeMs: number
): void {
  const key = `${method} ${path}`;
  const existing = store.get(key);

  if (existing) {
    existing.totalCalls++;
    existing.statusCodes[statusCode] =
      (existing.statusCodes[statusCode] || 0) + 1;
    existing.avgResponseTimeMs +=
      (responseTimeMs - existing.avgResponseTimeMs) / existing.totalCalls;
    existing.minResponseTimeMs = Math.min(
      existing.minResponseTimeMs,
      responseTimeMs
    );
    existing.maxResponseTimeMs = Math.max(
      existing.maxResponseTimeMs,
      responseTimeMs
    );
    existing.lastCalledAt = new Date().toISOString();
  } else {
    store.set(key, {
      method,
      path,
      totalCalls: 1,
      statusCodes: { [statusCode]: 1 },
      avgResponseTimeMs: responseTimeMs,
      minResponseTimeMs: responseTimeMs,
      maxResponseTimeMs: responseTimeMs,
      lastCalledAt: new Date().toISOString(),
    });
  }
}

export function getStats(): Map<string, RouteStats> {
  return store;
}

export function getStatsArray(): RouteStats[] {
  return Array.from(store.values()).sort(
    (a, b) => b.totalCalls - a.totalCalls
  );
}

export function resetStats(): void {
  store.clear();
}
