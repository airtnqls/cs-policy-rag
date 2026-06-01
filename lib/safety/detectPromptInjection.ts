type InjectionRule = {
  label: string;
  test: (raw: string, compact: string) => boolean;
};

function compactText(text: string) {
  return text.toLowerCase().replace(/\s+/g, "");
}

const rules: InjectionRule[] = [
  {
    label: "이전 지시 무시",
    test: (raw, compact) => /ignore previous instructions/i.test(raw) || compact.includes("이전지시무시"),
  },
  {
    label: "시스템 프롬프트 요청",
    test: (raw, compact) =>
      /reveal system prompt|system prompt|system message|developer message/i.test(raw) ||
      compact.includes("시스템프롬프트") ||
      compact.includes("개발자메시지") ||
      compact.includes("시스템메시지"),
  },
  {
    label: "내부 규칙 요청",
    test: (_raw, compact) =>
      (compact.includes("내부규칙") || compact.includes("숨겨진규칙") || compact.includes("비공개규칙")) &&
      (compact.includes("보여") || compact.includes("출력") || compact.includes("공개") || compact.includes("알려")),
  },
  {
    label: "관리자 권한 우회",
    test: (_raw, compact) =>
      (compact.includes("관리자권한") || compact.includes("admin권한") || compact.includes("관리자")) &&
      (compact.includes("우회") || compact.includes("획득") || compact.includes("상승") || compact.includes("override")),
  },
  {
    label: "정책 무시",
    test: (_raw, compact) => compact.includes("정책무시") || compact.includes("규칙무시") || compact.includes("안전장치무시"),
  },
  {
    label: "프롬프트 인젝션",
    test: (raw, compact) => /prompt injection/i.test(raw) || compact.includes("프롬프트인젝션"),
  },
];

export function detectPromptInjection(text: string) {
  const compact = compactText(text);
  const reasons = rules.filter((rule) => rule.test(text, compact)).map((rule) => rule.label);

  return {
    detected: reasons.length > 0,
    reasons,
  };
}
