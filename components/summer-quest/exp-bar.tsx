"use client";

import { Progress } from "@/components/ui/progress";
import { LEVELS } from "@/config/game";
import { levelForExp } from "@/lib/game/level";

export function ExpBar({ exp }: { exp: number }) {
  const tier = levelForExp(exp);
  const nextTier = LEVELS.find((t) => t.level === tier.level + 1);
  const pct = nextTier
    ? Math.round(
        ((exp - tier.minExp) / (nextTier.minExp - tier.minExp)) * 100
      )
    : 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>다음 레벨까지</span>
        <span>{nextTier ? `${exp} / ${nextTier.minExp}` : "최고 레벨"}</span>
      </div>
      <Progress value={pct} aria-label="EXP 진행도" />
    </div>
  );
}
