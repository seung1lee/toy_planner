"use client";

import * as React from "react";
import type { Profile } from "@/types/game";
import { useGame } from "@/hooks/useGame";
import { todayQuests, toISODate, isTodayFullyComplete } from "@/lib/game/today-quests";
import { computeStreak } from "@/lib/game/streak";
import { QuestList } from "./quest-list";
import { StatsPanel } from "./stats-panel";
import { LevelUpDialog } from "./levelup-dialog";
import { AllClearMessage } from "./all-clear-message";

const REACTION_DURATION_MS = 600;

export function HomeScreen({ profile }: { profile: Profile }) {
  const { state, today, levelUpEvent, dismissLevelUp } = useGame();
  const progress = state.progress[profile.id];
  const plan = state.plans[profile.id] ?? [];
  const completions = state.completions[profile.id] ?? [];

  const streak = computeStreak(plan, completions, today);
  const quests = todayQuests(plan, today);
  const allClear = isTodayFullyComplete(quests, completions, toISODate(today));

  // 완료 순간 아바타가 짧게 반응한다 (S14-3). 완료 수가 늘어난 순간만 감지 —
  // 해제(감소)는 반응을 트리거하지 않는다.
  const [reacting, setReacting] = React.useState(false);
  const prevCompletionCountRef = React.useRef(completions.length);

  React.useEffect(() => {
    if (completions.length > prevCompletionCountRef.current) {
      setReacting(true);
      const timer = setTimeout(() => setReacting(false), REACTION_DURATION_MS);
      prevCompletionCountRef.current = completions.length;
      return () => clearTimeout(timer);
    }
    prevCompletionCountRef.current = completions.length;
  }, [completions.length]);

  return (
    <div className="flex flex-col gap-4">
      <StatsPanel
        name={profile.name}
        progress={progress}
        streak={streak}
        reacting={reacting}
      />

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
