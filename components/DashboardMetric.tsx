export function DashboardMetric({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 font-serif text-4xl font-normal text-ink">{value}</p>
      {helper ? <p className="mt-2 text-sm text-body">{helper}</p> : null}
    </div>
  );
}
