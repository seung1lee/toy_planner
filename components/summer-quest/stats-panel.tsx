"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEVELS } from "@/config/game";
import type { ChildProgress } from "@/types/game";

/** 임시 레벨 표시명 (정식 파생은 Task 5 lib/game/level.ts로 대체) */
function levelNameForExp(exp: number): string {
  return LEVELS.reduce(
    (acc, tier) => (exp >= tier.minExp ? tier : acc),
    LEVELS[0]
  ).name;
}

export function StatsPanel({
  name,
  progress,
}: {
  name: string;
  progress: ChildProgress;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-6">
        <span>EXP {progress.exp}</span>
        <span>코인 {progress.coins}</span>
        <span>{levelNameForExp(progress.exp)}</span>
      </CardContent>
    </Card>
  );
}
