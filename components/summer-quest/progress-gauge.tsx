"use client";

import { Progress } from "@/components/ui/progress";

export function ProgressGauge({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span className="text-sm font-bold">오늘 진행</span>
      <Progress value={pct} aria-label="오늘 진행" className="flex-1" />
      <span className="text-sm">
        {completed} / {total}
      </span>
    </div>
  );
}
