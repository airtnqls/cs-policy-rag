import { findMatchedGlossary, glossary } from "@/lib/domain/glossary";

export function GlossaryBadges({ text, compact = false }: { text?: string; compact?: boolean }) {
  const terms = text ? findMatchedGlossary(text) : glossary.slice(0, 8);

  return (
    <div className="flex flex-wrap gap-2">
      {terms.map((entry) => (
        <span key={entry.term} title={entry.description} className="pill bg-surface-strong px-3 py-1.5 text-xs font-semibold text-ink">
          {compact ? entry.term : `${entry.term}`}
        </span>
      ))}
    </div>
  );
}
