import { DatasetTable } from "@/components/DatasetTable";
import { loadConsumerCases } from "@/lib/data/loadConsumerCases";

export default function DatasetPage() {
  const { cases, usingFallback, sourceLabel, recordCount } = loadConsumerCases();

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">dataset explorer</p>
          <h1 className="mt-3 font-serif text-4xl font-normal text-ink md:text-5xl">상담 데이터셋</h1>
          <p className="mt-4 max-w-3xl text-body">
            공공데이터 CSV를 ConsumerCase 타입으로 정규화해 검색과 답변 근거로 사용합니다. CSV가 없을 때만 30개 fallback sample data를 사용합니다.
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">총 record count</p>
          <p className="mt-2 font-serif text-4xl font-normal text-ink">{recordCount.toLocaleString("ko-KR")}</p>
        </div>
      </div>

      <div
        className={`mb-5 rounded-2xl border p-4 text-sm ${
          usingFallback ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"
        }`}
      >
        <p className="font-semibold">{usingFallback ? "현재 fallback sample data 사용 중" : "현재 real dataset 사용 중"}</p>
        <p className="mt-2">데이터 소스: {sourceLabel}</p>
        <p className="mt-2 font-mono text-xs">raw CSV: data/raw/consumer_cases.csv</p>
        <p className="mt-1 font-mono text-xs">processed JSON: data/processed/consumer_cases.normalized.json</p>
        {usingFallback ? (
          <p className="mt-3 text-xs">
            실제 데이터셋을 사용하려면 공공데이터포털 CSV를 내려받아 <span className="font-mono">data/raw/consumer_cases.csv</span>에 저장하고{" "}
            <span className="font-mono">npm run data:normalize</span>를 실행하세요.
          </p>
        ) : null}
      </div>

      <DatasetTable cases={cases} />
    </main>
  );
}
