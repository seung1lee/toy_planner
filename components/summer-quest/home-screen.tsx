"use client";

import type { Profile } from "@/types/game";
import { useGame } from "@/hooks/useGame";
import { QuestList } from "./quest-list";
import { StatsPanel } from "./stats-panel";

export function HomeScreen({ profile }: { profile: Profile }) {
  const { state } = useGame();
  const progress = state.progress[profile.id];

  return (
    <div className="flex flex-col gap-4">
      <StatsPanel name={profile.name} progress={progress} />

      <div>
        <h3 className="mb-2 text-sm font-bold">오늘의 퀘스트</h3>
        <QuestList profileId={profile.id} />
      </div>
    </div>
  );
}
