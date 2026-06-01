import { existsSync, readFileSync } from "node:fs";
import {
  countBy,
  loadRawCsvRecords,
  normalizeRecords,
  normalizedJsonPath,
  rawCsvPath,
  topEntries,
} from "./consumer-case-utils.mjs";

function loadCasesForInspect() {
  if (existsSync(normalizedJsonPath)) {
    return {
      source: normalizedJsonPath,
      cases: JSON.parse(readFileSync(normalizedJsonPath, "utf8")),
    };
  }

  if (existsSync(rawCsvPath)) {
    const { rows } = loadRawCsvRecords(rawCsvPath);
    return {
      source: rawCsvPath,
      cases: normalizeRecords(rows).cases,
    };
  }

  return {
    source: "fallback sampleCases",
    cases: Array.from({ length: 30 }, (_, index) => ({
      id: `SAMPLE-${String(index + 1).padStart(3, "0")}`,
      category: "fallback sample",
      item: "fallback sample",
      disputeType: "fallback sample",
      question: "CSV가 없어 내장 sampleCases가 앱에서 사용됩니다.",
      answer: "실제 데이터셋 점검은 data/raw/consumer_cases.csv를 저장한 뒤 다시 실행하세요.",
      source: "lib/data/sampleCases.ts",
      keywords: ["fallback"],
    })),
  };
}

const { source, cases } = loadCasesForInspect();
const missingQuestion = cases.filter((item) => !item.question).length;
const missingAnswer = cases.filter((item) => !item.answer).length;
const randomSamples = [...cases].sort(() => Math.random() - 0.5).slice(0, 5);

console.log(`source: ${source}`);
console.log(`total rows: ${cases.length}`);
console.log(`missing question count: ${missingQuestion}`);
console.log(`missing answer count: ${missingAnswer}`);

console.log("\ntop categories:");
for (const [name, count] of topEntries(countBy(cases, (item) => item.category), 20)) {
  console.log(`- ${name}: ${count}`);
}

console.log("\ntop dispute types:");
for (const [name, count] of topEntries(countBy(cases, (item) => item.disputeType), 20)) {
  console.log(`- ${name}: ${count}`);
}

console.log("\nrandom samples:");
for (const item of randomSamples) {
  console.log(`- ${item.id} | ${item.category} | ${item.item} | ${item.question.slice(0, 80)}`);
}
