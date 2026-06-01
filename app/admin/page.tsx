import { AdminDashboard } from "@/components/AdminDashboard";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">admin dashboard</p>
        <h1 className="mt-3 font-serif text-4xl font-normal text-ink md:text-5xl">상담 운영 로그</h1>
        <p className="mt-4 max-w-3xl text-body">
          MVP에서는 브라우저 localStorage에 상담 로그를 저장합니다. 답변 상태, 차단된 인젝션, 개인정보 감지, 낮은 신뢰도 비율을 확인할 수 있습니다.
        </p>
      </div>
      <AdminDashboard />
    </main>
  );
}
