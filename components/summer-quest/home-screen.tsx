"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEVELS } from "@/config/game";
import type { Profile } from "@/types/game";
import { useGame } from "@/hooks/useGame";
import { QuestList } from "./quest-list";

/** 임시 레벨 표시명 (정식 파생은 Task 5 lib/game/level.ts로 대체) */
function levelNameForExp(exp: number): string {
  return LEVELS.reduce(
    (acc, tier) => (exp >= tier.minExp ? tier : acc),
    LEVELS[0]
  ).name;
}

export function HomeScreen({ profile }: { profile: Profile }) {
  const { state } = useGame();
  const progress = state.progress[profile.id];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{profile.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6">
          <span>EXP {progress.exp}</span>
          <span>코인 {progress.coins}</span>
          <span>{levelNameForExp(progress.exp)}</span>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-2 text-sm font-bold">오늘의 퀘스트</h3>
        <QuestList profileId={profile.id} />
      </div>
    </div>
  );
}
