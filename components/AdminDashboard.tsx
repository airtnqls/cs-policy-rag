"use client";

import { useMemo, useSyncExternalStore } from "react";
import { DashboardMetric } from "@/components/DashboardMetric";
import { clearQueryLogs, readQueryLogs } from "@/lib/logs/queryLogs";
import type { QueryLog } from "@/lib/types";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cs-policy-rag-logs", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cs-policy-rag-logs", callback);
  };
}

function getLogSnapshot() {
  return JSON.stringify(readQueryLogs());
}

export function AdminDashboard() {
  const snapshot = useSyncExternalStore(subscribe, getLogSnapshot, () => "[]");
  const logs = useMemo(() => JSON.parse(snapshot) as QueryLog[], [snapshot]);
  const stats = useMemo(() => {
    const answered = logs.filter((log) => log.status === "answered").length;
    const blocked = logs.filter((log) => log.status === "blocked").length;
    const pii = logs.filter((log) => log.riskLevel !== "low").length;
    const low = logs.filter((log) => log.status === "low_confidence").length;
    const average = logs.length ? Math.round(logs.reduce((sum, log) => sum + log.confidence, 0) / logs.length) : 0;
    const byCategory = logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.disputeCategory] = (acc[log.disputeCategory] ?? 0) + 1;
      return acc;
    }, {});
    return { answered, blocked, pii, low, average, byCategory };
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <DashboardMetric label="전체 질문" value={logs.length} />
        <DashboardMetric label="답변 완료" value={stats.answered} />
        <DashboardMetric label="인젝션 차단" value={stats.blocked} />
        <DashboardMetric label="PII 감지" value={stats.pii} />
        <DashboardMetric label="낮은 신뢰도" value={stats.low} />
        <DashboardMetric label="평균 신뢰도" value={`${stats.average}%`} />
      </div>
      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">최근 상담 로그</h2>
          <button
            onClick={() => {
              clearQueryLogs();
              window.dispatchEvent(new Event("cs-policy-rag-logs"));
            }}
            className="pill border border-hairline px-4 py-2 text-sm font-medium"
          >
            로그 초기화
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <span key={category} className="pill bg-surface-strong px-3 py-1 text-xs font-semibold">
              {category} {count}
            </span>
          ))}
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-canvas-soft text-xs text-muted">
              <tr>
                <th className="px-4 py-3">시간</th>
                <th className="px-4 py-3">질문</th>
                <th className="px-4 py-3">마스킹</th>
                <th className="px-4 py-3">분류</th>
                <th className="px-4 py-3">위험</th>
                <th className="px-4 py-3">신뢰도</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">근거</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-hairline align-top">
                  <td className="px-4 py-4 font-mono text-xs text-muted">{new Date(log.timestamp).toLocaleString("ko-KR")}</td>
                  <td className="px-4 py-4 text-body">{log.originalQuery}</td>
                  <td className="px-4 py-4 text-body">{log.maskedQuery}</td>
                  <td className="px-4 py-4">{log.disputeCategory}</td>
                  <td className="px-4 py-4">{log.riskLevel}</td>
                  <td className="px-4 py-4">{log.confidence}</td>
                  <td className="px-4 py-4">{log.status}</td>
                  <td className="px-4 py-4 font-mono text-xs text-muted">{log.topSourceIds.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 ? <p className="py-10 text-center text-body">아직 브라우저에 저장된 상담 로그가 없습니다.</p> : null}
        </div>
      </section>
    </div>
  );
}
