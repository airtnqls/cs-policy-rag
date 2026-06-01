import { readFileSync } from "node:fs";
import iconv from "iconv-lite";
import { parse } from "csv-parse/sync";

export const rawCsvPath = "data/raw/consumer_cases.csv";
export const normalizedJsonPath = "data/processed/consumer_cases.normalized.json";

export const domainKeywords = [
  "환불",
  "교환",
  "AS",
  "수리",
  "위약금",
  "청약철회",
  "계약해지",
  "계약해제",
  "배송지연",
  "하자",
  "품질보증",
  "소비자귀책",
  "사업자귀책",
  "방문판매",
  "전자상거래",
  "계속거래",
  "내용증명",
  "세탁",
  "숙박",
  "항공권",
  "헬스장",
  "학원",
  "렌탈",
  "중고거래",
  "정기구독",
];

const columnAliases = {
  item: ["품목", "품목명", "item", "category", "카테고리"],
  category: ["대분류", "중분류", "분류", "카테고리", "category", "품목군"],
  question: ["질문", "상담질문", "question", "제목", "q"],
  answer: ["답변", "표준답변", "상담답변", "answer", "내용", "a"],
  source: ["출처", "source", "제공기관", "기관"],
  disputeType: ["분쟁유형", "유형", "구분", "dispute_type", "상담유형"],
};

function normalizeHeader(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

function findValue(row, aliases) {
  const entries = Object.entries(row);
  const normalizedAliases = aliases.map(normalizeHeader);
  const exact = entries.find(([key]) => normalizedAliases.includes(normalizeHeader(key)));
  if (exact) return String(exact[1] ?? "").trim();

  const fuzzy = entries.find(([key]) => normalizedAliases.some((alias) => normalizeHeader(key).includes(alias)));
  return String(fuzzy?.[1] ?? "").trim();
}

function looksBroken(text) {
  const replacementCount = (text.match(/\uFFFD/g) ?? []).length;
  const hangulCount = (text.match(/[가-힣]/g) ?? []).length;
  const suspiciousCount = (text.match(/[癤占쒖꾩]/g) ?? []).length;
  return replacementCount > 0 || (suspiciousCount > hangulCount && suspiciousCount > 20);
}

export function decodeCsvBuffer(buffer) {
  const utf8 = buffer.toString("utf8");
  if (!looksBroken(utf8)) return { text: utf8, encoding: "utf8" };
  const cp949 = iconv.decode(buffer, "cp949");
  if (!looksBroken(cp949)) return { text: cp949, encoding: "cp949" };
  return { text: iconv.decode(buffer, "euc-kr"), encoding: "euc-kr" };
}

export function parseCsvText(text) {
  return parse(text, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
}

function extractKeywords(text) {
  const normalized = text.replace(/\s+/g, "");
  const domainMatches = domainKeywords.filter((keyword) => normalized.includes(keyword.replace(/\s+/g, "")));
  const tokens = text
    .split(/[\s,./!?()[\]{}'"`~<>/@#$%^&*_+=|\\-]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .slice(0, 12);
  return Array.from(new Set([...domainMatches, ...tokens])).slice(0, 20);
}

export function normalizeRecords(rows) {
  const emptyFieldCount = {
    item: 0,
    question: 0,
    answer: 0,
    source: 0,
    disputeType: 0,
  };

  const cases = rows.flatMap((row, index) => {
    const item = findValue(row, columnAliases.item);
    const category = findValue(row, columnAliases.category) || item || "미분류";
    const disputeType = findValue(row, columnAliases.disputeType) || "unknown";
    const question = findValue(row, columnAliases.question);
    const answer = findValue(row, columnAliases.answer);
    const source = findValue(row, columnAliases.source) || "한국소비자원_소비자상담 표준답변";

    if (!item) emptyFieldCount.item += 1;
    if (!question) emptyFieldCount.question += 1;
    if (!answer) emptyFieldCount.answer += 1;
    if (!findValue(row, columnAliases.source)) emptyFieldCount.source += 1;
    if (!findValue(row, columnAliases.disputeType)) emptyFieldCount.disputeType += 1;

    if (!question || !answer) return [];

    return [
      {
        id: `KCA-${String(index + 1).padStart(5, "0")}`,
        category,
        item: item || category || "미상",
        disputeType,
        question,
        answer,
        source,
        keywords: extractKeywords(`${question} ${answer} ${item} ${category} ${disputeType}`),
      },
    ];
  });

  return { cases, emptyFieldCount };
}

export function loadRawCsvRecords(path = rawCsvPath) {
  const { text, encoding } = decodeCsvBuffer(readFileSync(path));
  return { rows: parseCsvText(text), encoding };
}

export function countBy(items, selector) {
  return items.reduce((acc, item) => {
    const key = selector(item) || "unknown";
    acc.set(key, (acc.get(key) ?? 0) + 1);
    return acc;
  }, new Map());
}

export function topEntries(map, limit = 20) {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
}
