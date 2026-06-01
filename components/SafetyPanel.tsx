import type { SafetyResult } from "@/lib/types";

export function SafetyPanel({ safety }: { safety: SafetyResult | null }) {
  if (!safety) {
    return (
      <section className="card p-5">
        <h3 className="text-sm font-semibold text-ink">안전 검사</h3>
        <p className="mt-2 text-sm text-body">질문 제출 전에 개인정보와 프롬프트 인젝션 시도를 검사합니다.</p>
      </section>
    );
  }

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-ink">안전 검사</h3>
        <span className={`pill px-3 py-1 text-xs font-semibold ${safety.blocked ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {safety.blocked ? "차단" : "통과"}
        </span>
      </div>
      <dl className="mt-4 grid gap-3 text-sm text-body sm:grid-cols-2">
        <div>
          <dt className="text-muted">위험 수준</dt>
          <dd className="font-medium text-ink">{safety.riskLevel}</dd>
        </div>
        <div>
          <dt className="text-muted">개인정보</dt>
          <dd className="font-medium text-ink">{safety.piiDetected ? safety.piiTypes.join(", ") : "감지 안 됨"}</dd>
        </div>
      </dl>
      {safety.injectionDetected ? (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">
          <p className="font-semibold">시스템 지시 우회 시도가 감지되어 검색과 답변 생성을 중단했습니다.</p>
          {safety.injectionReasons.length > 0 ? <p className="mt-1">감지 사유: {safety.injectionReasons.join(", ")}</p> : null}
        </div>
      ) : null}
      {safety.piiDetected ? <p className="mt-4 text-sm leading-6 text-muted">마스킹 질문: {safety.maskedText}</p> : null}
    </section>
  );
}
