"use client";

export function QueryInput({
  value,
  onChange,
  onSubmit,
  loading,
}: {
  value: string;
  onChange: (query: string) => void;
  onSubmit: (query: string) => void;
  loading?: boolean;
}) {
  return (
    <form
      className="card p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <label htmlFor="query" className="text-sm font-semibold text-ink">
        고객 질문
      </label>
      <textarea
        id="query"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-3 w-full resize-none rounded-xl border border-[#d6d3d1] bg-white p-4 text-[15px] leading-6 text-ink outline-none focus:border-ink"
        placeholder="예: 온라인으로 산 제품이 하루 만에 고장났는데 환불이 가능한가요?"
      />
      <div className="mt-4 flex items-center justify-end">
        <button className="pill bg-[#292524] px-5 py-3 text-sm font-medium leading-none text-white disabled:opacity-50" disabled={loading}>
          {loading ? "분석 중" : "근거 기반 답변 생성"}
        </button>
      </div>
    </form>
  );
}
