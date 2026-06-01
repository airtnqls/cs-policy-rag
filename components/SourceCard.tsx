import type { RetrievedCase } from "@/lib/types";

export function SourceCard({ source }: { source: RetrievedCase }) {
  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill bg-surface-strong px-3 py-1 text-xs font-semibold text-ink">{source.case.id}</span>
        <span
          className="text-xs text-muted"
          title="질문, 답변, 품목, 분쟁유형, 키워드 매칭을 가중 합산한 로컬 검색 점수입니다."
        >
          검색 점수 {source.score}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{source.case.disputeType}</h3>
      <p className="mt-1 text-xs text-muted">
        {source.case.category} · {source.case.item}
      </p>
      <p className="mt-3 text-sm leading-6 text-body">{source.case.question}</p>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{source.case.answer}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {source.matchedTerms.slice(0, 8).map((term) => (
          <span key={term} className="pill border border-hairline px-2.5 py-1 text-xs text-body">
            {term}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">매칭 필드: {source.matchedFields.join(", ") || "없음"}</p>
      <p className="mt-1 text-xs text-muted">점수 설명: 공식 판정 점수가 아니라 질문과 이 사례가 얼마나 강하게 맞물리는지 나타내는 검색 점수입니다.</p>
    </article>
  );
}
