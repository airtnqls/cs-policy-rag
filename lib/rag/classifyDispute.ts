import type { DisputeCode } from "@/lib/types";

const rules: Array<{ code: DisputeCode; terms: string[] }> = [
  { code: "refund", terms: ["환불", "환급", "반품", "결제취소", "대금 반환"] },
  { code: "exchange", terms: ["교환", "바꿔", "교체", "오배송", "다른 상품"] },
  { code: "repair", terms: ["수리", "as", "서비스센터", "고장", "부품", "수선"] },
  { code: "cancellation", terms: ["취소", "예약취소", "계약취소", "계약해제"] },
  { code: "penalty", terms: ["위약금", "수수료", "해지금", "계약금", "중도해지"] },
  { code: "delivery", terms: ["배송", "택배", "파손", "배송지연", "도착", "분실"] },
  { code: "defective_product", terms: ["하자", "불량", "결함", "가품", "표시", "광고와 다름"] },
  { code: "warranty", terms: ["보증", "품질보증", "무상", "보증기간"] },
  { code: "withdrawal", terms: ["청약철회", "철회", "방문판매", "전자상거래"] },
  { code: "used_goods", terms: ["중고", "개인거래", "중고거래"] },
];

export const disputeLabels: Record<DisputeCode, string> = {
  refund: "환불/환급",
  exchange: "교환",
  repair: "AS/수리",
  cancellation: "계약 취소",
  penalty: "위약금/수수료",
  delivery: "배송",
  defective_product: "상품 하자",
  warranty: "품질보증",
  withdrawal: "청약철회",
  used_goods: "중고거래",
  unknown: "추가 분류 필요",
};

export function classifyDispute(text: string): DisputeCode {
  const normalized = text.toLowerCase();
  const scored = rules
    .map((rule) => ({
      code: rule.code,
      score: rule.terms.filter((term) => normalized.includes(term.toLowerCase())).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.code ?? "unknown";
}
