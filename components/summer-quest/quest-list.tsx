"use client";

import { TentTree } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { EXP_PER_QUEST, COINS_PER_QUEST } from "@/config/game";
import type { ProfileId } from "@/types/game";
import { useGame } from "@/hooks/useGame";
import { todayQuests } from "@/lib/game/today-quests";

export function QuestList({ profileId }: { profileId: ProfileId }) {
  const { state, today } = useGame();
  const plan = state.plans[profileId] ?? [];
  const quests = todayQuests(plan, today);

  if (quests.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TentTree />
          </EmptyMedia>
          <EmptyTitle>오늘은 배정된 퀘스트가 없어요</EmptyTitle>
          <EmptyDescription>
            퀘스트는 월~금에 배정됩니다. 푹 쉬어요!
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {quests.map((q) => (
        <li
          key={q.planItemId}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <Checkbox aria-label={`${q.name} 완료`} disabled />
          <span className="flex-1">{q.name}</span>
          <span className="text-xs text-muted-foreground">
            +{EXP_PER_QUEST} EXP · +{COINS_PER_QUEST}코인
          </span>
        </li>
      ))}
    </ul>
  );
}
