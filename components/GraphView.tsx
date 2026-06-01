import type { GraphEdge, GraphNode } from "@/lib/graph/localGraphAdapter";

const groupLabel: Record<GraphNode["group"], string> = {
  question: "질문",
  dispute: "분류",
  item: "품목",
  term: "용어",
  case: "근거",
};

const groupStyle: Record<GraphNode["group"], string> = {
  question: "border-[#292524] bg-[#292524] text-white",
  dispute: "border-[#d6d3d1] bg-white text-ink",
  item: "border-[#d6d3d1] bg-white text-ink",
  term: "border-[#d6d3d1] bg-[#f5f5f4] text-ink",
  case: "border-[#d6d3d1] bg-white text-ink",
};

const columns: Array<{ group: GraphNode["group"]; title: string; note: string }> = [
  { group: "question", title: "입력", note: "사용자 질문" },
  { group: "dispute", title: "분류", note: "규칙 기반 분쟁 유형" },
  { group: "item", title: "품목", note: "상위 근거에서 추출" },
  { group: "term", title: "용어", note: "질문/답변의 소비자 키워드" },
  { group: "case", title: "근거", note: "검색 점수 상위 사례" },
];

function NodeCard({ node }: { node: GraphNode }) {
  return (
    <div className={`min-h-24 rounded-lg border p-4 ${groupStyle[node.group]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-70">{groupLabel[node.group]}</p>
      <p className="mt-2 line-clamp-4 text-sm leading-6">{node.label}</p>
    </div>
  );
}

function shortNode(id: string, nodes: GraphNode[]) {
  const node = nodes.find((item) => item.id === id);
  return node ? groupLabel[node.group] : id;
}

function edgeTone(label: string) {
  if (label.includes("최상위")) return "border-[#292524] bg-[#292524] text-white";
  if (label.includes("유사")) return "border-[#d6d3d1] bg-white text-body";
  return "border-[#d6d3d1] bg-[#f5f5f4] text-ink";
}

export function GraphView({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  return (
    <section className="rounded-lg border border-hairline bg-white p-5">
      <div className="flex flex-col justify-between gap-3 border-b border-hairline pb-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">Local Graph Adapter</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">런타임 관계 그래프</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-body">
          별도 그래프 DB에 저장된 결과가 아니라, 현재 질문과 실제 검색 결과를 바탕으로 서버에서 즉시 구성하는 인메모리 관계 그래프입니다.
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        {columns.map((column) => {
          const columnNodes = nodes.filter((node) => node.group === column.group);
          return (
            <div key={column.group} className="rounded-lg bg-canvas-soft p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{column.title}</p>
              <p className="mt-1 min-h-8 text-xs leading-5 text-body">{column.note}</p>
              <div className="mt-3 space-y-3">
                {columnNodes.length > 0 ? (
                  columnNodes.map((node) => <NodeCard key={node.id} node={node} />)
                ) : (
                  <p className="rounded-lg border border-dashed border-hairline bg-white p-4 text-sm text-muted">없음</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-lg border border-hairline bg-canvas-soft p-4">
        <p className="text-sm font-semibold text-ink">관계 경로</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {edges.map((edge) => (
            <div key={`${edge.from}-${edge.to}-${edge.label}`} className={`rounded-lg border px-3 py-2 text-sm ${edgeTone(edge.label)}`}>
              <span className="font-medium">{shortNode(edge.from, nodes)}</span>
              <span className="mx-2 opacity-60">→</span>
              <span className="font-medium">{shortNode(edge.to, nodes)}</span>
              <span className="ml-2 text-xs opacity-70">{edge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
