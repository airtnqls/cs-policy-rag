export type GlossaryTerm = {
  term: string;
  description: string;
  aliases: string[];
};

export const glossary: GlossaryTerm[] = [
  {
    term: "청약철회",
    description: "전자상거래나 방문판매 등에서 일정 기간 안에 구매 의사를 철회하는 제도입니다.",
    aliases: ["철회", "구매 취소", "반품 기간"],
  },
  {
    term: "소비자분쟁해결기준",
    description: "품목별 환급, 교환, 수리, 배상 기준을 정리한 공정거래위원회 고시 기준입니다.",
    aliases: ["분쟁해결기준", "보상 기준"],
  },
  {
    term: "품질보증기간",
    description: "정상 사용 중 발생한 하자에 대해 무상 수리나 교환을 검토하는 기준 기간입니다.",
    aliases: ["보증기간", "무상보증"],
  },
  {
    term: "하자",
    description: "계약 내용이나 통상 품질에 맞지 않는 결함, 고장, 누락을 의미합니다.",
    aliases: ["불량", "결함", "고장"],
  },
  {
    term: "위약금",
    description: "계약을 중도 해지하거나 약정을 지키지 않을 때 발생할 수 있는 손해배상 예정액입니다.",
    aliases: ["해지 수수료", "중도해지금"],
  },
  {
    term: "계약해제",
    description: "계약을 처음부터 없었던 것처럼 종료하고 원상회복을 요구하는 절차입니다.",
    aliases: ["계약 취소", "환급"],
  },
  {
    term: "계약해지",
    description: "계속거래나 서비스 계약을 장래에 대해 종료하는 절차입니다.",
    aliases: ["중도 해지", "정기구독 해지"],
  },
  {
    term: "사업자 귀책",
    description: "배송 지연, 설명과 다른 상품, 수리 지연처럼 사업자에게 책임 사유가 있는 경우입니다.",
    aliases: ["판매자 책임", "업체 책임"],
  },
  {
    term: "소비자 귀책",
    description: "단순 변심, 사용상 부주의 등 소비자 측 사유로 분쟁이 발생한 경우입니다.",
    aliases: ["구매자 책임", "고객 책임"],
  },
  {
    term: "계속거래",
    description: "학원, 헬스장, 구독 서비스처럼 일정 기간 계속 제공되는 서비스 계약입니다.",
    aliases: ["장기 계약", "정기 서비스"],
  },
  {
    term: "방문판매",
    description: "사업자가 소비자에게 직접 방문하거나 권유해 체결하는 판매 방식입니다.",
    aliases: ["방문 계약", "방문 영업"],
  },
  {
    term: "전자상거래",
    description: "온라인 쇼핑몰, 앱, 오픈마켓 등 통신판매 방식으로 체결되는 거래입니다.",
    aliases: ["온라인 구매", "인터넷 주문"],
  },
  {
    term: "내용증명",
    description: "계약 해지, 환급 요구 등 의사표시를 증거로 남기기 위해 우체국을 통해 발송하는 문서입니다.",
    aliases: ["서면 통보", "해지 통보"],
  },
];

export const domainTerms = Array.from(
  new Set(glossary.flatMap((entry) => [entry.term, ...entry.aliases]).concat([
    "환불",
    "교환",
    "AS",
    "수리",
    "배송지연",
    "배송 지연",
    "하자",
    "중고거래",
    "예약 취소",
    "항공권",
    "숙박",
  ])),
);

export function findMatchedGlossary(text: string) {
  return glossary.filter((entry) =>
    [entry.term, ...entry.aliases].some((term) => text.toLowerCase().includes(term.toLowerCase())),
  );
}
