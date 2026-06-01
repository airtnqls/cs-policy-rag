import { extractDomainTerms, tokenizeKorean } from "@/lib/rag/tokenizeKorean";
import type { ConsumerCase, RetrievedCase } from "@/lib/types";

const weights = {
  question: 3,
  answer: 2,
  disputeType: 1.8,
  category: 1.5,
  item: 1.3,
  keywords: 2.5,
};

function scoreField(fieldText: string, queryTokens: string[], weight: number) {
  const field = fieldText.toLowerCase();
  const matched = queryTokens.filter((token) => field.includes(token.toLowerCase()));
  return {
    matched,
    score: matched.reduce((sum, token) => sum + weight + Math.min(token.length / 8, 1), 0),
  };
}

export function retrieveCases(query: string, cases: ConsumerCase[], limit = 5): RetrievedCase[] {
  const tokens = tokenizeKorean(query);
  const domainMatches = extractDomainTerms(query).map((term) => term.toLowerCase());

  return cases
    .map((consumerCase) => {
      const fieldScores = {
        question: scoreField(consumerCase.question, tokens, weights.question),
        answer: scoreField(consumerCase.answer, tokens, weights.answer),
        disputeType: scoreField(consumerCase.disputeType, tokens, weights.disputeType),
        category: scoreField(consumerCase.category, tokens, weights.category),
        item: scoreField(consumerCase.item, tokens, weights.item),
        keywords: scoreField(consumerCase.keywords.join(" "), tokens, weights.keywords),
      };
      const matchedTerms = Array.from(new Set(Object.values(fieldScores).flatMap((entry) => entry.matched)));
      const matchedFields = Object.entries(fieldScores)
        .filter(([, entry]) => entry.matched.length > 0)
        .map(([field]) => field);
      const domainBoost = matchedTerms.filter((term) => domainMatches.includes(term.toLowerCase())).length * 4;
      const score = Object.values(fieldScores).reduce((sum, entry) => sum + entry.score, 0) + domainBoost;

      return {
        case: consumerCase,
        score: Math.round(score * 10) / 10,
        matchedTerms,
        matchedFields,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
