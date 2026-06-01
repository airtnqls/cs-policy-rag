import { retrieveCases } from "@/lib/rag/retrieveCases";
import type { ConsumerCase } from "@/lib/types";

export function localSearchAdapter(query: string, cases: ConsumerCase[]) {
  return retrieveCases(query, cases);
}
