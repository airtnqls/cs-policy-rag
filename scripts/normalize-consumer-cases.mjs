import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  countBy,
  loadRawCsvRecords,
  normalizeRecords,
  normalizedJsonPath,
  rawCsvPath,
} from "./consumer-case-utils.mjs";

try {
  const { rows, encoding } = loadRawCsvRecords(rawCsvPath);
  const { cases, emptyFieldCount } = normalizeRecords(rows);

  mkdirSync(dirname(normalizedJsonPath), { recursive: true });
  writeFileSync(normalizedJsonPath, `${JSON.stringify(cases, null, 2)}\n`, "utf8");

  const categoryCount = countBy(cases, (item) => item.category).size;
  console.log(`normalized file: ${normalizedJsonPath}`);
  console.log(`source encoding: ${encoding}`);
  console.log(`raw row count: ${rows.length}`);
  console.log(`normalized record count: ${cases.length}`);
  console.log(`category count: ${categoryCount}`);
  console.log(`empty field count: ${JSON.stringify(emptyFieldCount)}`);

  if (cases.length === 0) {
    console.warn("정규화된 레코드가 없습니다. CSV 컬럼명과 파일 인코딩을 확인하세요.");
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`정규화에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
  console.error(
    "공공데이터포털에서 ‘한국소비자원_소비자상담 표준답변’ CSV를 직접 다운로드한 뒤 `data/raw/consumer_cases.csv`에 저장하고 `npm run data:normalize`를 실행하세요.",
  );
  process.exitCode = 1;
}
