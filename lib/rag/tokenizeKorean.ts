import { domainTerms } from "@/lib/domain/glossary";

const stopWords = new Set(["그리고", "하지만", "에서", "으로", "에게", "제가", "저는", "하면", "있는", "없는", "되나요"]);

export function tokenizeKorean(text: string) {
  const normalized = text.toLowerCase();
  const baseTokens = normalized
    .split(/[\s,.;:!?()[\]{}'"`~<>/@#$%^&*_+=|\\-]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !stopWords.has(token));

  const matchedDomainTerms = domainTerms.filter((term) => normalized.includes(term.toLowerCase()));
  return Array.from(new Set([...baseTokens, ...matchedDomainTerms]));
}

export function extractDomainTerms(text: string) {
  const normalized = text.toLowerCase();
  return domainTerms.filter((term) => normalized.includes(term.toLowerCase()));
}
