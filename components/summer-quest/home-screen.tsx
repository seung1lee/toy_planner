"use client";

import type { Profile } from "@/types/game";
import { useGame } from "@/hooks/useGame";
import { todayQuests, toISODate, isTodayFullyComplete } from "@/lib/game/today-quests";
import { computeStreak } from "@/lib/game/streak";
import { QuestList } from "./quest-list";
import { StatsPanel } from "./stats-panel";
import { LevelUpDialog } from "./levelup-dialog";
import { AllClearMessage } from "./all-clear-message";

export function HomeScreen({ profile }: { profile: Profile }) {
  const { state, today, levelUpEvent, dismissLevelUp } = useGame();
  const progress = state.progress[profile.id];
  const plan = state.plans[profile.id] ?? [];
  const completions = state.completions[profile.id] ?? [];

  const streak = computeStreak(plan, completions, today);
  const quests = todayQuests(plan, today);
  const allClear = isTodayFullyComplete(quests, completions, toISODate(today));

  return (
    <div className="flex flex-col gap-4">
      <StatsPanel name={profile.name} progress={progress} streak={streak} />

      <AllClearMessage show={allClear} />

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
