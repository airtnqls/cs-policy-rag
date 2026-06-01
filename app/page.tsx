import Link from "next/link";

const features = [
  "근거 기반 답변",
  "환불/AS/계약해지 분쟁 분류",
  "상담 사례 검색",
  "개인정보 마스킹",
  "프롬프트 인젝션 차단",
  "관리자 상담 로그",
  "OpenSearch 확장 구조",
  "Neo4j 확장 가능 구조",
];

const ctas = [
  { href: "/chat", label: "데모 시작하기" },
  { href: "/admin", label: "관리자 대시보드" },
  { href: "/dataset", label: "데이터셋 보기" },
  { href: "/graph", label: "구현 구조 보기" },
];

export default function Home() {
  return (
    <main>
      <section className="border-b border-hairline bg-canvas">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">Korean customer support RAG</p>
            <h1 className="mt-6 font-serif text-5xl font-normal leading-tight text-ink md:text-7xl">CS Policy RAG</h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-body">
              한국 소비자 상담 사례와 분쟁 해결 기준을 검색해 근거와 함께 답변하는 B2B SaaS 스타일 RAG MVP입니다.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-body">
              환불, 교환, AS, 계약해지, 위약금 질문을 상담 기준으로 분류하고, 검색된 사례와 신뢰도, 안전 검사 결과를 한 화면에서 확인할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {ctas.map((cta, index) => (
                <Link
                  key={cta.href}
                  href={cta.href}
                  className={`pill px-5 py-3 text-sm font-medium leading-none ${index === 0 ? "bg-[#292524] text-white" : "border border-[#d6d3d1] text-ink"}`}
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="card soft-shadow p-4">
            <div className="rounded-2xl bg-canvas-soft p-4">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <span className="text-sm font-semibold text-ink">상담 자동화 콘솔</span>
                <span className="pill bg-white px-3 py-1 text-xs text-muted">local RAG</span>
              </div>
              <div className="mt-4 space-y-3">
                {["질문 안전 검사", "분쟁 유형 분류", "상위 근거 5건 검색", "신뢰도 및 답변 생성"].map((step, index) => (
                  <div key={step} className="rounded-xl border border-hairline bg-white p-4">
                    <p className="font-mono text-xs text-muted">0{index + 1}</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-serif text-4xl font-normal text-ink">포트폴리오에서 보여주는 역량</h2>
          <p className="mt-3 text-body">커뮤니티 웹서비스 경험을 보완해 AI/RAG SaaS 설계와 안전한 답변 흐름을 보여주는 프로젝트입니다.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article key={feature} className="card p-6">
              <p className="text-lg font-medium text-ink">{feature}</p>
              <p className="mt-3 text-sm leading-6 text-body">로컬 MVP로 동작하지만 운영 환경의 검색, 그래프, 로그 구조로 확장 가능하게 분리했습니다.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
