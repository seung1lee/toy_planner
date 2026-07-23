"use client";

import type { Profile } from "@/types/game";
import { useGame } from "@/hooks/useGame";
import { QuestList } from "./quest-list";
import { StatsPanel } from "./stats-panel";
import { LevelUpDialog } from "./levelup-dialog";

export function HomeScreen({ profile }: { profile: Profile }) {
  const { state, levelUpEvent, dismissLevelUp } = useGame();
  const progress = state.progress[profile.id];

  return (
    <div className="flex flex-col gap-4">
      <StatsPanel name={profile.name} progress={progress} />

      <div>
        <h3 className="mb-2 text-sm font-bold">오늘의 퀘스트</h3>
        <QuestList profileId={profile.id} />
      </div>

      {levelUpEvent && levelUpEvent.profileId === profile.id && (
        <LevelUpDialog
          from={levelUpEvent.from}
          to={levelUpEvent.to}
          onClose={dismissLevelUp}
        />
      )}
    </div>
  );
}
