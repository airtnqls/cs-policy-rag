import { GraphView } from "@/components/GraphView";
import { loadConsumerCases } from "@/lib/data/loadConsumerCases";
import { buildLocalGraph } from "@/lib/graph/localGraphAdapter";

const query = "헬스장 1년권 중도해지 시 위약금이 적정한가요?";

export default function GraphPage() {
  const { cases } = loadConsumerCases();
  const graph = buildLocalGraph(query, cases);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">GraphRAG adapter</p>
        <h1 className="mt-3 font-serif text-4xl font-normal text-ink md:text-5xl">상담 근거 관계 그래프</h1>
        <p className="mt-4 max-w-3xl text-body">
          현재 MVP는 local graph adapter를 사용하며, 운영 서비스에서는 같은 노드 구조를 Neo4j로 교체할 수 있습니다.
        </p>
      </div>
      <GraphView nodes={graph.nodes} edges={graph.edges} />
      <section className="mt-6 card p-6">
        <h2 className="text-lg font-semibold text-ink">확장 설명</h2>
        <p className="mt-3 text-body">
          질문 → 분쟁 유형 → 품목 카테고리 → 정책 용어 → 검색 사례의 관계를 고정 인터페이스로 표현했습니다. 향후 Neo4j에서는 상담 사례와 정책 용어를 노드로 적재하고 Cypher 쿼리로 근거 경로를 반환하면 됩니다.
        </p>
      </section>
    </main>
  );
}
