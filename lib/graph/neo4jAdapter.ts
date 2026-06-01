export class Neo4jAdapter {
  async queryGraph() {
    throw new Error("Neo4jAdapter is a production extension stub. Configure driver, auth, constraints, and query mapping.");
  }
}

/*
Example Cypher:

MATCH (q:Question)-[:CLASSIFIED_AS]->(d:DisputeType)
MATCH (d)-[:RELATED_TO]->(i:ItemCategory)
MATCH (i)-[:USES_TERM]->(t:PolicyTerm)
MATCH (t)-[:SUPPORTED_BY]->(c:ConsumerCase)
WHERE q.normalized CONTAINS $query OR c.keywords CONTAINS $keyword
RETURN q, d, i, t, c
LIMIT 10

The MVP keeps the same graph shape locally so Neo4j can replace the adapter without changing the UI.
*/
