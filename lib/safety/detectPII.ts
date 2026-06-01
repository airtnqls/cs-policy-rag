import type { RiskLevel } from "@/lib/types";

const patterns: Array<{ type: string; regex: RegExp; replacement: string; risk: RiskLevel }> = [
  { type: "phone", regex: /01[016789]-?\d{3,4}-?\d{4}/g, replacement: "[전화번호 마스킹]", risk: "medium" },
  { type: "email", regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, replacement: "[이메일 마스킹]", risk: "medium" },
  { type: "rrn", regex: /\d{6}-?[1-4]\d{6}/g, replacement: "[주민등록번호 마스킹]", risk: "high" },
  { type: "card", regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: "[카드번호 마스킹]", risk: "high" },
  { type: "account", regex: /\b\d{2,6}[-\s]\d{2,6}[-\s]\d{2,8}\b/g, replacement: "[계좌번호 마스킹]", risk: "high" },
  { type: "name", regex: /(이름|성명)\s*[:：]\s*[가-힣]{2,5}/g, replacement: "$1: [이름 마스킹]", risk: "low" },
];

const riskRank: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 };

export function detectPII(text: string) {
  const types = new Set<string>();
  let maskedText = text;
  let riskLevel: RiskLevel = "low";

  for (const pattern of patterns) {
    if (pattern.regex.test(maskedText)) {
      types.add(pattern.type);
      if (riskRank[pattern.risk] > riskRank[riskLevel]) riskLevel = pattern.risk;
      maskedText = maskedText.replace(pattern.regex, pattern.replacement);
    }
    pattern.regex.lastIndex = 0;
  }

  return {
    detected: types.size > 0,
    types: Array.from(types),
    maskedText,
    riskLevel,
  };
}
