import type { Division } from "@/lib/divisions";
import { cn } from "@/lib/cn";

export function EliteBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white",
        className,
      )}
    >
      Elite
    </span>
  );
}

export function DivisionRankLabel({
  rank,
  division,
  participantCount,
  className,
}: {
  rank: number | string;
  division: Division;
  participantCount: number;
  className?: string;
}) {
  const groupLabel = division === "elite" ? "Elite" : "Striders";

  return (
    <p className={className}>
      Rank #{rank} of {participantCount} {groupLabel}
    </p>
  );
}
