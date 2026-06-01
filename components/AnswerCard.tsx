import type { AnswerPayload } from "@/lib/types";

const statusLabel: Record<AnswerPayload["groundingStatus"], string> = {
  well_grounded: "근거 충분",
  partially_grounded: "부분 근거",
  low_confidence: "낮은 신뢰도",
};

const generationModeLabel: Record<AnswerPayload["generationMode"], string> = {
  openrouter: "OpenRouter",
  local_fallback: "Local fallback",
};

export function AnswerCard({ answer }: { answer: AnswerPayload | null }) {
  if (!answer) {
    return (
      <section className="card p-6">
        <p className="text-sm font-semibold text-muted">답변 대기</p>
        <p className="mt-3 text-body">질문을 입력하면 근거 기반 답변이 표시됩니다.</p>
      </section>
    );
  }

  return (
    <section className="card soft-shadow p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill bg-[#292524] px-3 py-1 text-sm font-medium text-white">{answer.verdict}</span>
        <span className="pill bg-surface-strong px-3 py-1 text-sm font-medium text-ink">{answer.disputeLabel}</span>
        <span className="pill border border-hairline px-3 py-1 text-sm text-body">{statusLabel[answer.groundingStatus]}</span>
      </div>

      <div className="mt-5 rounded-2xl border border-hairline bg-canvas-soft p-5">
        <p className="text-sm font-semibold text-muted">고객 표시 답변</p>
        <p className="mt-3 whitespace-pre-wrap text-[17px] leading-8 text-ink">{answer.answer}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-hairline p-5">
        <h3 className="text-sm font-semibold text-ink">운영 메타</h3>
        <div className="mt-3 h-2 rounded-full bg-surface-strong">
          <div className="h-2 rounded-full bg-[#292524]" style={{ width: `${answer.confidence}%` }} />
        </div>
        <div className="mt-4 grid gap-2 text-sm text-body md:grid-cols-2">
          <p>신뢰도 {answer.confidence}/100</p>
          <p>근거 상태: {statusLabel[answer.groundingStatus]}</p>
          <p>생성 방식: {generationModeLabel[answer.generationMode]}</p>
          <p>인용 사례: {answer.citedSourceIds.join(", ") || "없음"}</p>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">검색 점수와 신뢰도는 공식 판정이 아니라 현재 데이터셋 기준의 로컬 RAG 판단 보조값입니다.</p>
      </div>

      <p className="mt-6 border-t border-hairline pt-4 text-sm text-muted">{answer.disclaimer}</p>
    </section>
  );
}
