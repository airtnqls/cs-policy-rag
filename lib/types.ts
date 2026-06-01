export type ConsumerCase = {
  id: string;
  category: string;
  item: string;
  disputeType: string;
  question: string;
  answer: string;
  source: string;
  keywords: string[];
};

export type RetrievedCase = {
  case: ConsumerCase;
  score: number;
  matchedTerms: string[];
  matchedFields: string[];
};

export type DisputeCode =
  | "refund"
  | "exchange"
  | "repair"
  | "cancellation"
  | "penalty"
  | "delivery"
  | "defective_product"
  | "warranty"
  | "withdrawal"
  | "used_goods"
  | "unknown";

export type GroundingStatus = "well_grounded" | "partially_grounded" | "low_confidence";
export type Verdict = "가능" | "조건부 가능" | "어려움" | "추가 확인 필요";
export type RiskLevel = "low" | "medium" | "high";
export type GenerationMode = "openrouter" | "local_fallback";

export type SafetyResult = {
  piiDetected: boolean;
  piiTypes: string[];
  maskedText: string;
  riskLevel: RiskLevel;
  injectionDetected: boolean;
  injectionReasons: string[];
  blocked: boolean;
};

export type AnswerPayload = {
  verdict: Verdict;
  disputeCategory: DisputeCode;
  disputeLabel: string;
  answer: string;
  citedSourceIds: string[];
  confidence: number;
  groundingStatus: GroundingStatus;
  generationMode: GenerationMode;
  disclaimer: string;
};

export type ChatResponse = {
  originalQuery: string;
  maskedQuery: string;
  safety: SafetyResult;
  answer: AnswerPayload | null;
  retrieved: RetrievedCase[];
};

export type QueryLog = {
  id: string;
  timestamp: string;
  originalQuery: string;
  maskedQuery: string;
  disputeCategory: DisputeCode;
  riskLevel: RiskLevel;
  confidence: number;
  topSourceIds: string[];
  status: "answered" | "blocked" | "low_confidence";
};
