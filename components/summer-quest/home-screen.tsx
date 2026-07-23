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
import { ProgressGauge } from "./progress-gauge";
import { AchievementsDialog } from "./achievements-dialog";
import { MilestoneDialog } from "./milestone-dialog";
import { EncouragementMessage } from "./encouragement-message";

const REACTION_DURATION_MS = 600;

export function HomeScreen({ profile }: { profile: Profile }) {
  const {
    state,
    today,
    levelUpEvent,
    dismissLevelUp,
    milestoneEvent,
    dismissMilestone,
  } = useGame();
  const progress = state.progress[profile.id];
  const plan = state.plans[profile.id] ?? [];
  const completions = state.completions[profile.id] ?? [];

  const streak = computeStreak(plan, completions, today);
  const quests = todayQuests(plan, today);
  const dateISO = toISODate(today);
  const allClear = isTodayFullyComplete(quests, completions, dateISO);
  const completedCount = quests.filter((q) =>
    completions.some((c) => c.planItemId === q.planItemId && c.dateISO === dateISO)
  ).length;

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
      <EncouragementMessage />

      <StatsPanel
        name={profile.name}
        progress={progress}
        streak={streak}
        reacting={reacting}
      />

      <div>
        <AchievementsDialog unlockedIds={progress.unlockedAchievementIds} />
      </div>

      <AllClearMessage show={allClear} />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold">오늘의 퀘스트</h3>
        </div>
        {quests.length > 0 && (
          <ProgressGauge completed={completedCount} total={quests.length} />
        )}
        <div className="mt-2">
          <QuestList profileId={profile.id} />
        </div>
      </div>

      {levelUpEvent && levelUpEvent.profileId === profile.id && (
        <LevelUpDialog
          from={levelUpEvent.from}
          to={levelUpEvent.to}
          onClose={dismissLevelUp}
        />
      )}

      {milestoneEvent && milestoneEvent.profileId === profile.id && (
        <MilestoneDialog
          milestone={milestoneEvent.milestone}
          nextMilestone={milestoneEvent.nextMilestone}
          daysUntilNext={milestoneEvent.daysUntilNext}
          onClose={dismissMilestone}
        />
      )}
    </div>
  );
}
