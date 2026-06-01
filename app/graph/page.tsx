import Image from "next/image";
import { loadConsumerCases } from "@/lib/data/loadConsumerCases";

const userPath = [
  {
    step: "01",
    title: "질문 입력",
    body: "사용자가 /chat에서 환불, 교환, 배송, AS, 계약 관련 질문을 입력합니다.",
  },
  {
    step: "02",
    title: "API 처리",
    body: "POST /api/chat에서 개인정보 마스킹과 프롬프트 인젝션 차단을 먼저 수행합니다.",
  },
  {
    step: "03",
    title: "RAG 검색",
    body: "현재 로딩된 전체 데이터셋을 대상으로 로컬 텍스트 매칭 검색, 분류, 신뢰도 계산을 실행합니다.",
  },
  {
    step: "04",
    title: "답변 생성",
    body: "OpenRouter 키가 있으면 근거 기반 LLM 답변을 생성하고, 없거나 실패하면 로컬 fallback 답변을 사용합니다.",
  },
  {
    step: "05",
    title: "화면 기록",
    body: "답변, 근거, 안전 상태를 화면에 표시하고 운영 로그는 브라우저 localStorage에 저장합니다.",
  },
];

const implementationBlocks = [
  {
    title: "데이터 계층",
    body: "processed JSON을 우선 사용하고, 없으면 raw CSV를 서버에서 파싱합니다. 둘 다 없을 때만 30개 sampleCases로 fallback합니다.",
    code: "lib/data/loadConsumerCases.ts",
  },
  {
    title: "검색 계층",
    body: "벡터 DB나 OpenSearch가 아니라 현재는 question, answer, item, disputeType, keywords 가중치 기반 로컬 검색입니다.",
    code: "lib/rag/retrieveCases.ts",
  },
  {
    title: "안전 계층",
    body: "PII는 마스킹하고, 내부 규칙 요청이나 지시 우회 문장은 답변 생성 전에 차단합니다.",
    code: "lib/safety/*",
  },
  {
    title: "생성 계층",
    body: "검색 근거를 바탕으로 OpenRouter를 호출합니다. 환경변수가 없거나 품질이 낮으면 결정적 fallback 문장을 반환합니다.",
    code: "lib/rag/generateAnswer.ts",
  },
];

export default function GraphPage() {
  const { sourceLabel, recordCount, usingFallback } = loadConsumerCases();

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">Implementation Map</p>
        <h1 className="mt-3 font-serif text-4xl font-normal text-ink md:text-5xl">구현 구조</h1>
        <p className="mt-4 max-w-3xl text-body">
          이 화면은 실제 구현 흐름을 설명합니다. 현재 프로젝트는 GraphRAG 엔진이 아니라, 공공데이터 기반 로컬 RAG와
          OpenRouter 답변 생성을 조합한 구조입니다.
        </p>
      </section>

      <section className="overflow-hidden rounded-lg border border-hairline bg-white">
        <Image
          src="/cs-policy-rag-flow.png"
          alt="CSPolicyRAG 질문 처리와 운영 계층 구조 다이어그램"
          width={1920}
          height={1080}
          priority
          className="h-auto w-full"
        />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Dataset</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{recordCount.toLocaleString("ko-KR")}</p>
          <p className="mt-2 text-sm leading-6 text-body">{sourceLabel}</p>
        </div>
        <div className="rounded-lg border border-hairline bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Runtime</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{usingFallback ? "Fallback" : "Real"}</p>
          <p className="mt-2 text-sm leading-6 text-body">
            실제 CSV/JSON이 있으면 전체 데이터셋을 사용하고, 없을 때만 sampleCases로 전환합니다.
          </p>
        </div>
        <div className="rounded-lg border border-hairline bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">GraphRAG</p>
          <p className="mt-3 text-3xl font-semibold text-ink">확장 지점</p>
          <p className="mt-2 text-sm leading-6 text-body">
            현재는 구조 설명과 local graph adapter 수준입니다. Neo4j나 graph traversal은 아직 운영 경로가 아닙니다.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">User Path</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">질문이 답변으로 바뀌는 경로</h2>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-5">
          {userPath.map((item) => (
            <article key={item.step} className="rounded-lg border border-hairline bg-white p-5">
              <p className="font-mono text-xs font-semibold text-muted">{item.step}</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-body">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {implementationBlocks.map((block) => (
          <article key={block.title} className="rounded-lg border border-hairline bg-white p-6">
            <h3 className="text-lg font-semibold text-ink">{block.title}</h3>
            <p className="mt-3 text-sm leading-6 text-body">{block.body}</p>
            <p className="mt-4 rounded-md bg-canvas-soft px-3 py-2 font-mono text-xs text-muted">{block.code}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-lg border border-hairline bg-[#292524] p-6 text-white">
        <h2 className="text-xl font-semibold">정리</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-[#e7e5e4]">
          이 프로젝트의 현재 핵심은 전체 소비자상담 표준답변 데이터셋을 로딩하고, 안전 검사 후 관련 근거를 찾아 상담 답변을
          생성하는 것입니다. GraphRAG는 현재 화면 이름이나 핵심 엔진이 아니라, 향후 Neo4j 같은 그래프 저장소로 확장할 수
          있는 설계 지점으로만 표시했습니다.
        </p>
      </section>
    </main>
  );
}
