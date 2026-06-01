import { extractDomainTerms } from "@/lib/rag/tokenizeKorean";
import type { DisputeCode, GroundingStatus, RetrievedCase } from "@/lib/types";

export function calculateConfidence(query: string, retrieved: RetrievedCase[], dispute: DisputeCode) {
  const top = retrieved[0]?.score ?? 0;
  const second = retrieved[1]?.score ?? 0;
  const gap = Math.max(top - second, 0);
  const domainCount = extractDomainTerms(query).length;
  const recognized = dispute !== "unknown";

  const score =
    Math.min(top * 5, 48) +
    Math.min(gap * 3, 18) +
    Math.min(domainCount * 6, 18) +
    (recognized ? 16 : 0);

  const confidence = Math.max(0, Math.min(100, Math.round(score)));
  const groundingStatus: GroundingStatus =
    confidence >= 72 ? "well_grounded" : confidence >= 42 ? "partially_grounded" : "low_confidence";

  return { confidence, groundingStatus };
}
