import { glossary } from "@/lib/domain/glossary";
import { classifyDispute, disputeLabels } from "@/lib/rag/classifyDispute";
import { retrieveCases } from "@/lib/rag/retrieveCases";
import type { ConsumerCase } from "@/lib/types";

export type GraphNode = {
  id: string;
  label: string;
  group: "question" | "dispute" | "item" | "term" | "case";
};

export type GraphEdge = {
  from: string;
  to: string;
  label: string;
};

export function buildLocalGraph(query: string, cases: ConsumerCase[]) {
  const dispute = classifyDispute(query);
  const retrieved = retrieveCases(query, cases, 3);
  const top = retrieved[0]?.case;
  const terms = glossary.filter((entry) => query.includes(entry.term) || top?.answer.includes(entry.term)).slice(0, 2);

  const nodes: GraphNode[] = [
    { id: "q", label: query, group: "question" },
    { id: "d", label: disputeLabels[dispute], group: "dispute" },
    { id: "i", label: top?.item ?? "품목 추가 확인", group: "item" },
    ...terms.map((term, index) => ({ id: `t${index}`, label: term.term, group: "term" as const })),
    ...retrieved.map((entry) => ({ id: entry.case.id, label: `${entry.case.id} ${entry.case.disputeType}`, group: "case" as const })),
  ];

  const edges: GraphEdge[] = [
    { from: "q", to: "d", label: "분류" },
    { from: "d", to: "i", label: "품목" },
    ...terms.map((_, index) => ({ from: "i", to: `t${index}`, label: "정책 용어" })),
    ...retrieved.map((entry, index) => ({ from: terms[0] ? "t0" : "i", to: entry.case.id, label: index === 0 ? "최상위 근거" : "유사 근거" })),
  ];

  return { nodes, edges, retrieved };
}
