import type { AnswerPayload, SafetyResult } from "@/lib/types";

const statusLabel: Record<AnswerPayload["groundingStatus"], string> = {
  well_grounded: "근거 충분",
  partially_grounded: "부분 근거",
  low_confidence: "낮은 신뢰도",
};

const generationModeLabel: Record<AnswerPayload["generationMode"], string> = {
  openrouter: "OpenRouter",
  local_fallback: "Local fallback",
};

function AssistantAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-strong text-sm font-semibold text-ink">
      CS
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#292524] text-sm font-semibold text-white">
      나
    </div>
  );
}

function WaitingBubble() {
  return (
    <div className="flex items-end gap-3">
      <AssistantAvatar />
      <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-hairline bg-white px-5 py-4 text-[15px] leading-7 text-body">
        고객 문의를 입력하면 소비자상담 표준답변 데이터에서 근거를 찾아 답변합니다.
      </div>
    </div>
  );
}

function BlockedBubble({ safety }: { safety: SafetyResult }) {
  return (
    <div className="flex items-end gap-3">
      <AssistantAvatar />
      <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-hairline bg-white px-5 py-4 text-[15px] leading-7 text-body">
        <p className="text-ink">이 요청은 답변할 수 없습니다.</p>
        <p className="mt-2">
          소비자 거래와 관련된 상품, 계약, 결제, 배송, 하자, 환급 상황을 구체적으로 적어 주시면 다시 확인하겠습니다.
        </p>
        {safety.injectionReasons.length > 0 ? (
          <p className="mt-3 text-xs text-muted">차단 사유: {safety.injectionReasons.join(", ")}</p>
        ) : null}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex items-end gap-3">
      <AssistantAvatar />
      <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-hairline bg-white px-5 py-4">
        <span className="h-2 w-2 rounded-full bg-muted" />
        <span className="h-2 w-2 rounded-full bg-[#a8a29e]" />
        <span className="h-2 w-2 rounded-full bg-[#d6d3d1]" />
      </div>
    </div>
  );
}

export function AnswerCard({
  answer,
  query,
  safety,
  loading,
}: {
  answer: AnswerPayload | null;
  query: string;
  safety: SafetyResult | null;
  loading?: boolean;
}) {
  return (
    <section className="card soft-shadow overflow-hidden">
      <div className="border-b border-hairline bg-canvas-soft px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">소비자 상담</p>
            <p className="mt-1 text-xs text-muted">표준답변 데이터 연결됨</p>
          </div>
          {answer ? (
            <div className="hidden flex-wrap justify-end gap-2 md:flex">
              <span className="pill bg-[#292524] px-3 py-1 text-xs font-medium text-white">{answer.verdict}</span>
              <span className="pill bg-surface-strong px-3 py-1 text-xs font-medium text-ink">{answer.disputeLabel}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="min-h-[360px] space-y-5 bg-[#fafafa] px-4 py-6 sm:px-6">
        {!query ? <WaitingBubble /> : null}

        {query ? (
          <div className="flex items-end justify-end gap-3">
            <div className="max-w-[82%] rounded-2xl rounded-br-md bg-[#292524] px-5 py-4 text-[15px] leading-7 text-white">
              <p className="whitespace-pre-wrap">{query}</p>
            </div>
            <UserAvatar />
          </div>
        ) : null}

        {loading ? <LoadingBubble /> : null}

        {!loading && safety?.blocked ? <BlockedBubble safety={safety} /> : null}

        {!loading && answer ? (
          <div className="flex items-end gap-3">
            <AssistantAvatar />
            <div className="max-w-[86%] rounded-2xl rounded-bl-md border border-hairline bg-white px-5 py-4 text-[15px] leading-7 text-ink">
              <p className="whitespace-pre-wrap">{answer.answer}</p>
              <p className="mt-4 border-t border-hairline pt-3 text-xs leading-5 text-muted">{answer.disclaimer}</p>
            </div>
          </div>
        ) : null}
      </div>

      {answer ? (
        <div className="border-t border-hairline bg-white p-5">
          <div className="flex flex-wrap items-center gap-2 md:hidden">
            <span className="pill bg-[#292524] px-3 py-1 text-xs font-medium text-white">{answer.verdict}</span>
            <span className="pill bg-surface-strong px-3 py-1 text-xs font-medium text-ink">{answer.disputeLabel}</span>
          </div>

          <div className="mt-0 rounded-xl border border-hairline p-4 md:mt-0">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <h3 className="text-sm font-semibold text-ink">운영 메타</h3>
              <span className="pill border border-hairline px-3 py-1 text-xs text-body">{statusLabel[answer.groundingStatus]}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-surface-strong">
              <div className="h-2 rounded-full bg-[#292524]" style={{ width: `${answer.confidence}%` }} />
            </div>
            <div className="mt-4 grid gap-2 text-sm text-body md:grid-cols-2">
              <p>신뢰도 {answer.confidence}/100</p>
              <p>생성 방식: {generationModeLabel[answer.generationMode]}</p>
              <p className="md:col-span-2">인용 사례: {answer.citedSourceIds.join(", ") || "없음"}</p>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">
              검색 점수와 신뢰도는 공식 판정이 아니라 현재 데이터셋 기준의 로컬 RAG 판단 보조값입니다.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
