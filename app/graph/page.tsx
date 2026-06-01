import Image from "next/image";
import { GraphView } from "@/components/GraphView";
import { loadConsumerCases } from "@/lib/data/loadConsumerCases";
import { buildLocalGraph } from "@/lib/graph/localGraphAdapter";

const demoQuery = "헬스장 1년권을 중도해지하면 위약금을 내야 하나요?";

const codeLinks = [
  {
    title: "그래프 구성",
    body: "질문, 분류, 품목, 용어, 검색 근거를 노드로 만들고 관계를 연결합니다.",
    code: "lib/graph/localGraphAdapter.ts",
  },
  {
    title: "근거 검색",
    body: "전체 소비자상담 데이터셋을 대상으로 질문, 답변, 품목, 키워드 매칭 점수를 계산합니다.",
    code: "lib/rag/retrieveCases.ts",
  },
  {
    title: "확장 지점",
    body: "현재 화면은 로컬 어댑터입니다. Neo4j 같은 그래프 DB를 붙일 때 교체할 경계가 이 계층입니다.",
    code: "lib/graph/*",
  },
];

export default function GraphPage() {
  const { cases, sourceLabel, recordCount, usingFallback } = loadConsumerCases();
  const graph = buildLocalGraph(demoQuery, cases);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">Implementation Structure</p>
        <h1 className="mt-3 font-serif text-4xl font-normal text-ink md:text-5xl">구현 구조</h1>
        <p className="mt-4 max-w-3xl text-body">
          이 탭은 고정 다이어그램을 설명하는 화면이 아니라, 현재 프로젝트가 실제로 만드는 로컬 관계 그래프를 보여줍니다. 아래 그래프는 로딩된 데이터셋에서
          검색된 상위 근거를 기준으로 서버에서 즉시 구성됩니다.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Dataset</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{recordCount.toLocaleString("ko-KR")}</p>
          <p className="mt-2 text-sm leading-6 text-body">{sourceLabel}</p>
        </div>
        <div className="rounded-lg border border-hairline bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Runtime</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{usingFallback ? "Fallback" : "Real"}</p>
          <p className="mt-2 text-sm leading-6 text-body">CSV/JSON이 있으면 전체 데이터셋을 사용하고, 없을 때만 30개 샘플로 전환합니다.</p>
        </div>
        <div className="rounded-lg border border-hairline bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Graph</p>
          <p className="mt-3 text-3xl font-semibold text-ink">Local</p>
          <p className="mt-2 text-sm leading-6 text-body">현재는 그래프 DB가 아니라 런타임 로컬 어댑터입니다. 실제 근거 검색 결과로 노드와 엣지를 만듭니다.</p>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-hairline bg-white p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Demo Query</p>
            <h2 className="mt-2 text-xl font-semibold text-ink">{demoQuery}</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-body">
            채팅에서 질문을 넣으면 같은 검색 계층을 사용합니다. 이 화면은 그 결과가 어떤 관계 구조로 묶이는지 확인하기 위한 운영용 뷰입니다.
          </p>
        </div>
      </section>

      <div className="mt-5">
        <GraphView nodes={graph.nodes} edges={graph.edges} />
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">Retrieved Evidence</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">그래프에 들어간 실제 근거</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {graph.retrieved.map((entry) => (
            <article key={entry.case.id} className="rounded-lg border border-hairline bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs font-semibold text-muted">{entry.case.id}</p>
                <p className="rounded-full bg-canvas-soft px-3 py-1 text-xs font-semibold text-ink">score {entry.score}</p>
              </div>
              <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-7 text-ink">{entry.case.question}</h3>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-body">{entry.case.answer}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from(new Set([entry.case.disputeType, entry.case.item || entry.case.category, ...entry.matchedTerms.slice(0, 4)]))
                  .filter((label): label is string => Boolean(label))
                  .map((label) => (
                    <span key={label} className="rounded-full border border-hairline px-2.5 py-1 text-xs text-muted">
                      {label}
                    </span>
                  ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {codeLinks.map((block) => (
          <article key={block.title} className="rounded-lg border border-hairline bg-white p-5">
            <h3 className="text-lg font-semibold text-ink">{block.title}</h3>
            <p className="mt-3 text-sm leading-6 text-body">{block.body}</p>
            <p className="mt-4 rounded-md bg-canvas-soft px-3 py-2 font-mono text-xs text-muted">{block.code}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 overflow-hidden rounded-lg border border-hairline bg-white">
        <div className="border-b border-hairline px-5 py-4">
          <p className="text-sm font-semibold text-ink">전체 흐름 다이어그램</p>
        </div>
        <Image
          src="/cs-policy-rag-flow.png"
          alt="CSPolicyRAG 질문 처리와 운영 계층 구조 다이어그램"
          width={1920}
          height={1080}
          priority
          className="h-auto w-full"
        />
      </section>
    </main>
  );
}
