import { disputeLabels } from "@/lib/rag/classifyDispute";
import type { AnswerPayload, DisputeCode, GenerationMode, RetrievedCase, Verdict } from "@/lib/types";

const disclaimer = "본 답변은 법률 자문이 아닌 공공 상담 기준 기반 참고 답변입니다.";

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function chooseVerdict(dispute: DisputeCode, confidence: number): Verdict {
  if (confidence < 42 || dispute === "unknown") return "추가 확인 필요";
  if (["refund", "exchange", "repair", "withdrawal", "penalty", "cancellation", "delivery", "defective_product"].includes(dispute)) {
    return "조건부 가능";
  }
  return "가능";
}

function isOutOfDomain(dispute: DisputeCode, retrieved: RetrievedCase[], confidence: number) {
  const topScore = retrieved[0]?.score ?? 0;
  return dispute === "unknown" && (retrieved.length === 0 || topScore < 8 || confidence < 35);
}

function customerOutOfDomainAnswer() {
  return [
    "문의하신 내용만으로는 소비자상담 기준에 맞는 근거 사례를 찾기 어렵습니다.",
    "환불, 교환, 배송, AS, 계약해지처럼 거래와 관련된 상황을 조금 더 구체적으로 적어 주시면 다시 확인해 드릴 수 있습니다.",
    "예: 온라인으로 구매한 제품이 불량인데 환불이 가능한가요?",
  ].join("\n");
}

function customerGroundedAnswer({
  dispute,
  retrieved,
  verdict,
}: {
  dispute: DisputeCode;
  retrieved: RetrievedCase[];
  verdict: Verdict;
}) {
  const top = retrieved[0];
  const second = retrieved[1];

  if (!top) {
    return [
      "현재 질문과 직접 연결되는 상담 사례가 충분히 검색되지 않았습니다.",
      "거래 상황을 조금 더 구체적으로 적어 주시면 더 가까운 기준을 찾아볼 수 있습니다.",
    ].join("\n");
  }

  const supportSentence = second
    ? `비슷한 근거로 ${second.case.id} 사례도 함께 확인됩니다.`
    : "현재는 가장 가까운 사례 1건을 중심으로 확인됩니다.";

  return [
    `문의하신 내용은 ${disputeLabels[dispute]} 유형으로 보이며, 현재 확인된 기준상 ${verdict}으로 안내할 수 있습니다.`,
    `${top.case.id} 사례에서는 '${top.case.disputeType}' 상황에 대해 유사한 상담 기준을 제시하고 있습니다.`,
    supportSentence,
    "정확한 판단은 실제 계약 조건, 상품 상태, 사업자 답변 내용에 따라 달라질 수 있으므로 관련 증빙을 함께 보관해 주세요.",
  ].join("\n");
}

function buildEvidence(retrieved: RetrievedCase[]) {
  return retrieved
    .slice(0, 5)
    .map(
      (entry, index) =>
        `[${index + 1}] id=${entry.case.id}
분류=${entry.case.category}
품목=${entry.case.item}
분쟁유형=${entry.case.disputeType}
질문=${entry.case.question}
답변=${entry.case.answer}
검색점수=${entry.score}
매칭용어=${entry.matchedTerms.join(", ") || "없음"}`,
    )
    .join("\n\n");
}

async function generateWithOpenRouter({
  query,
  dispute,
  retrieved,
  verdict,
  confidence,
}: {
  query: string;
  dispute: DisputeCode;
  retrieved: RetrievedCase[];
  verdict: Verdict;
  confidence: number;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || retrieved.length === 0 || isOutOfDomain(dispute, retrieved, confidence)) return null;

  const model = process.env.OPENROUTER_MODEL ?? "openrouter/free";
  const siteUrl = process.env.OPENROUTER_SITE_URL ?? "https://cs-policy-rag.local";
  const appTitle = process.env.OPENROUTER_APP_TITLE ?? "CS Policy RAG";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": siteUrl,
        "X-Title": appTitle,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 450,
        messages: [
          {
            role: "system",
            content:
              "너는 한국 소비자 상담 고객지원 답변 작성자다. 사용자는 최종 고객이므로 내부 점수, confidence, retrieval, RAG, 데이터셋 같은 메타 용어를 말하지 않는다. 제공된 검색 근거만 사용하고 근거에 없는 내용은 단정하지 않는다. 답변은 자연스러운 한국어 상담원 말투로 3~5문장으로 작성한다. 고정 체크리스트를 만들지 말고, 질문과 근거에서 실제로 필요한 내용만 언급한다.",
          },
          {
            role: "user",
            content: `고객 질문:
${query}

내부 분류: ${disputeLabels[dispute]}
내부 판정: ${verdict}
내부 신뢰도: ${confidence}/100

검색 근거:
${buildEvidence(retrieved)}

작성 규칙:
- 고객에게 바로 보여줄 답변만 작성한다.
- '검색 점수', '신뢰도', '메타', 'RAG', '데이터셋' 같은 내부 용어를 쓰지 않는다.
- 첫 문장은 결론으로 시작한다.
- 근거 사례 ID는 필요할 때만 자연스럽게 언급한다.
- 고정된 확인사항 목록을 만들지 않는다.
- 질문과 근거에서 실제로 필요한 다음 행동만 짧게 쓴다.`,
          },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as OpenRouterResponse;
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateAnswer({
  query,
  dispute,
  retrieved,
  confidence,
  groundingStatus,
}: {
  query: string;
  dispute: DisputeCode;
  retrieved: RetrievedCase[];
  confidence: number;
  groundingStatus: AnswerPayload["groundingStatus"];
}): Promise<AnswerPayload> {
  const verdict = chooseVerdict(dispute, confidence);
  const outOfDomain = isOutOfDomain(dispute, retrieved, confidence);
  const openRouterAnswer = await generateWithOpenRouter({
    query,
    dispute,
    retrieved,
    verdict,
    confidence,
  });
  const generationMode: GenerationMode = openRouterAnswer ? "openrouter" : "local_fallback";

  return {
    verdict,
    disputeCategory: dispute,
    disputeLabel: disputeLabels[dispute],
    answer:
      openRouterAnswer ??
      (outOfDomain
        ? customerOutOfDomainAnswer()
        : customerGroundedAnswer({
            dispute,
            retrieved,
            verdict,
          })),
    citedSourceIds: retrieved.slice(0, 3).map((entry) => entry.case.id),
    confidence,
    groundingStatus: outOfDomain ? "low_confidence" : groundingStatus,
    generationMode,
    disclaimer,
  };
}
