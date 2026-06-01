import type { ConsumerCase, RetrievedCase } from "@/lib/types";

export type SearchAdapter = {
  search(query: string, cases?: ConsumerCase[]): Promise<RetrievedCase[]>;
};

export class OpenSearchAdapter implements SearchAdapter {
  async search(): Promise<RetrievedCase[]> {
    throw new Error("OpenSearchAdapter is a production extension stub. Configure endpoint, index, auth, and BM25/vector query mapping.");
  }
}

/*
Production replacement idea:
- Index ConsumerCase documents into OpenSearch with fields: question, answer, category, item, disputeType, keywords.
- Use BM25 multi_match with field boosts matching retrieveCases.ts.
- Optionally add kNN vectors for semantic recall, then rerank by policy terms.
- Keep the RetrievedCase interface so app/api/chat/route.ts does not change.
*/
