import type { QueryLog } from "@/lib/types";

const key = "cs-policy-rag-query-logs";

export function readQueryLogs(): QueryLog[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as QueryLog[];
  } catch {
    return [];
  }
}

export function appendQueryLog(log: QueryLog) {
  if (typeof window === "undefined") return;
  const logs = readQueryLogs();
  window.localStorage.setItem(key, JSON.stringify([log, ...logs].slice(0, 100)));
  window.dispatchEvent(new Event("cs-policy-rag-logs"));
}

export function clearQueryLogs() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
  window.dispatchEvent(new Event("cs-policy-rag-logs"));
}
