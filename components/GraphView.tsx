import type { GraphEdge, GraphNode } from "@/lib/graph/localGraphAdapter";

const groupStyle: Record<GraphNode["group"], string> = {
  question: "bg-[#292524] text-white",
  dispute: "bg-white text-ink",
  item: "bg-white text-ink",
  term: "bg-surface-strong text-ink",
  case: "bg-canvas-soft text-ink",
};

export function GraphView({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  return (
    <section className="card p-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {nodes.map((node) => (
            <div key={node.id} className={`rounded-2xl border border-hairline p-4 ${groupStyle[node.group]}`}>
              <p className="text-xs font-semibold uppercase opacity-70">{node.group}</p>
              <p className="mt-2 text-sm leading-6">{node.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-canvas-soft p-4">
          <h3 className="text-sm font-semibold text-ink">관계</h3>
          <div className="mt-4 space-y-3">
            {edges.map((edge) => (
              <div key={`${edge.from}-${edge.to}-${edge.label}`} className="rounded-xl bg-white p-3 text-sm text-body">
                <span className="font-mono text-xs text-muted">{edge.from}</span>
                <span className="mx-2">→</span>
                <span className="font-mono text-xs text-muted">{edge.to}</span>
                <span className="ml-2 text-ink">{edge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
