import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { pipeline } from "node:stream/promises";
import { rawCsvPath } from "./consumer-case-utils.mjs";

const detailUrl = "https://www.data.go.kr/data/15144809/fileData.do?recommendDataYn=Y";

function printManualGuide(reason) {
  console.warn(`자동 다운로드에 실패했습니다.${reason ? ` (${reason})` : ""}`);
  console.warn(
    "공공데이터포털에서 ‘한국소비자원_소비자상담 표준답변’ CSV를 직접 다운로드한 뒤 `data/raw/consumer_cases.csv`에 저장하고 `npm run data:normalize`를 실행하세요.",
  );
  console.warn(`데이터 상세 페이지: ${detailUrl}`);
}

function candidateUrlsFromHtml(html) {
  const urls = new Set();
  const patterns = [
    /"contentUrl"\s*:\s*"([^"]+)"/g,
    /https?:\/\/[^"'<>]+(?:csv|CSV|download|Download|file|File)[^"'<>]*/g,
    /href=["']([^"']*(?:download|file|File|csv|CSV)[^"']*)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const value = match[1] ?? match[0];
      try {
        urls.add(new URL(value.replaceAll("&amp;", "&"), detailUrl).toString());
      } catch {
        // Ignore non-URL snippets from the portal page.
      }
    }
  }

  return Array.from(urls);
}

async function tryDownload(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "CS-Policy-RAG data downloader",
      Accept: "text/csv,application/octet-stream,*/*",
    },
  });
  if (!response.ok || !response.body) return false;

  const contentType = response.headers.get("content-type") ?? "";
  const disposition = response.headers.get("content-disposition") ?? "";
  const isLikelyCsv =
    contentType.includes("csv") ||
    contentType.includes("octet-stream") ||
    disposition.toLowerCase().includes(".csv");

  if (!isLikelyCsv) return false;

  mkdirSync(dirname(rawCsvPath), { recursive: true });
  await pipeline(response.body, createWriteStream(rawCsvPath));
  return true;
}

try {
  const page = await fetch(detailUrl, {
    redirect: "follow",
    headers: {
      "User-Agent": "CS-Policy-RAG data downloader",
    },
  });

  if (!page.ok) {
    printManualGuide(`상세 페이지 응답 실패: HTTP ${page.status}`);
    process.exit(0);
  }

  const html = await page.text();
  const candidates = candidateUrlsFromHtml(html);

  for (const url of candidates) {
    try {
      if (await tryDownload(url)) {
        console.log(`CSV downloaded: ${rawCsvPath}`);
        console.log(`source: ${url}`);
        process.exit(0);
      }
    } catch {
      if (existsSync(rawCsvPath)) unlinkSync(rawCsvPath);
    }
  }

  printManualGuide("포털 다운로드 링크가 인증/세션/버튼 방식으로 제공됩니다");
} catch (error) {
  printManualGuide(error instanceof Error ? error.message : String(error));
}
