import { ChatWorkspace } from "@/components/ChatWorkspace";
import { loadConsumerCases } from "@/lib/data/loadConsumerCases";

export default function ChatPage() {
  const { cases, usingFallback, sourceLabel, recordCount } = loadConsumerCases();

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">RAG demo</p>
        <h1 className="mt-3 font-serif text-4xl font-normal text-ink md:text-5xl">상담 답변 생성</h1>
        <p className="mt-4 max-w-3xl text-body">환불, 교환, 배송, AS, 계약 관련 문의를 입력하면 유사 상담 사례를 바탕으로 답변을 작성합니다.</p>
        <p className="mt-3 text-sm text-muted">
          데이터 소스: {sourceLabel} · 레코드 {recordCount.toLocaleString("ko-KR")}건
          {usingFallback ? " · CSV가 없어 fallback sample data를 사용 중입니다." : ""}
        </p>
      </div>
      <ChatWorkspace cases={cases} />
    </main>
  );
}
