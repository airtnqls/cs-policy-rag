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
      <label htmlFor="query" className="sr-only">
        고객 질문
      </label>
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <textarea
          id="query"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="min-h-[96px] flex-1 resize-none rounded-xl border border-[#d6d3d1] bg-white p-4 text-[15px] leading-6 text-ink outline-none focus:border-ink md:min-h-[72px]"
          placeholder="고객 문의를 입력하세요. 예: 온라인으로 산 제품이 하루 만에 고장났는데 환불이 가능한가요?"
        />
        <button className="pill h-11 bg-[#292524] px-5 text-sm font-medium leading-none text-white disabled:opacity-50" disabled={loading}>
          {loading ? "분석 중" : "전송"}
        </button>
      </div>
    </form>
  );
}
