import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import iconv from "iconv-lite";
import { sampleCases } from "@/lib/data/sampleCases";
import type { ConsumerCase } from "@/lib/types";

type DatasetSource = "processed-json" | "raw-csv" | "fallback-sample";

type LoadResult = {
  cases: ConsumerCase[];
  usingFallback: boolean;
  source: DatasetSource;
  sourceLabel: string;
  rawCsvPath: string;
  normalizedJsonPath: string;
  recordCount: number;
};

const domainKeywords = [
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

function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

function findValue(row: Record<string, unknown>, aliases: string[]) {
  const entries = Object.entries(row);
  const normalizedAliases = aliases.map(normalizeHeader);
  const exact = entries.find(([key]) => normalizedAliases.includes(normalizeHeader(key)));
  if (exact) return String(exact[1] ?? "").trim();

  const fuzzy = entries.find(([key]) => normalizedAliases.some((alias) => normalizeHeader(key).includes(alias)));
  return String(fuzzy?.[1] ?? "").trim();
}

function looksBroken(text: string) {
  const replacementCount = (text.match(/\uFFFD/g) ?? []).length;
  const hangulCount = (text.match(/[가-힣]/g) ?? []).length;
  const suspiciousCount = (text.match(/[癤占쒖꾩]/g) ?? []).length;
  return replacementCount > 0 || (suspiciousCount > hangulCount && suspiciousCount > 20);
}

function decodeCsvBuffer(buffer: Buffer) {
  const utf8 = buffer.toString("utf8");
  if (!looksBroken(utf8)) return utf8;
  const cp949 = iconv.decode(buffer, "cp949");
  if (!looksBroken(cp949)) return cp949;
  return iconv.decode(buffer, "euc-kr");
}

function extractKeywords(text: string) {
  const compact = text.replace(/\s+/g, "");
  const domainMatches = domainKeywords.filter((keyword) => compact.includes(keyword.replace(/\s+/g, "")));
  const tokens = text
    .split(/[\s,./!?()[\]{}'"`~<>/@#$%^&*_+=|\\-]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .slice(0, 12);
  return Array.from(new Set([...domainMatches, ...tokens])).slice(0, 20);
}

function normalizeRows(rows: Array<Record<string, unknown>>): ConsumerCase[] {
  return rows.flatMap((row, index) => {
    const item = findValue(row, columnAliases.item);
    const category = findValue(row, columnAliases.category) || item || "미분류";
    const disputeType = findValue(row, columnAliases.disputeType) || "unknown";
    const question = findValue(row, columnAliases.question);
    const answer = findValue(row, columnAliases.answer);
    const source = findValue(row, columnAliases.source) || "한국소비자원_소비자상담 표준답변";

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
}

function parseRawCsv(csvPath: string) {
  const text = decodeCsvBuffer(readFileSync(csvPath));
  const rows = parse(text, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as Array<Record<string, unknown>>;
  return normalizeRows(rows);
}

function safeReadNormalized(jsonPath: string) {
  const parsed = JSON.parse(readFileSync(jsonPath, "utf8")) as ConsumerCase[];
  return parsed.filter((item) => item.question && item.answer);
}

export function loadConsumerCases(): LoadResult {
  const rawCsvPath = path.join(process.cwd(), "data", "raw", "consumer_cases.csv");
  const normalizedJsonPath = path.join(process.cwd(), "data", "processed", "consumer_cases.normalized.json");

  if (existsSync(normalizedJsonPath)) {
    try {
      const cases = safeReadNormalized(normalizedJsonPath);
      if (cases.length > 0) {
        return {
          cases,
          usingFallback: false,
          source: "processed-json",
          sourceLabel: "real dataset: processed normalized JSON",
          rawCsvPath,
          normalizedJsonPath,
          recordCount: cases.length,
        };
      }
    } catch {
      // Fall through to raw CSV and then fallback sample data.
    }
  }

  if (existsSync(rawCsvPath)) {
    try {
      const cases = parseRawCsv(rawCsvPath);
      if (cases.length > 0) {
        return {
          cases,
          usingFallback: false,
          source: "raw-csv",
          sourceLabel: "real dataset: raw CSV parsed at runtime",
          rawCsvPath,
          normalizedJsonPath,
          recordCount: cases.length,
        };
      }
    } catch {
      // Fall through to fallback sample data.
    }
  }

  return {
    cases: sampleCases,
    usingFallback: true,
    source: "fallback-sample",
    sourceLabel: "fallback sample data",
    rawCsvPath,
    normalizedJsonPath,
    recordCount: sampleCases.length,
  };
}
