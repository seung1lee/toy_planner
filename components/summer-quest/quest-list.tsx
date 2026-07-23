"use client";

import { TentTree } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { ProfileId } from "@/types/game";
import { useGame } from "@/hooks/useGame";
import { todayQuests, toISODate } from "@/lib/game/today-quests";

export function QuestList({ profileId }: { profileId: ProfileId }) {
  const { state, today, isQuestCompleted, completeQuest, uncompleteQuest } =
    useGame();
  const plan = state.plans[profileId] ?? [];
  const quests = todayQuests(plan, today);
  const dateISO = toISODate(today);

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
      {quests.map((q) => {
        const completed = isQuestCompleted(profileId, q.planItemId, dateISO);
        return (
          <li
            key={q.planItemId}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <Checkbox
              aria-label={`${q.name} 완료`}
              checked={completed}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  completeQuest(profileId, q.planItemId);
                  toast(`+${q.expReward} EXP · +${q.coinReward}코인`);
                } else {
                  uncompleteQuest(profileId, q.planItemId);
                }
              }}
            />
            <span
              className={cn(
                "flex-1",
                completed && "text-muted-foreground line-through"
              )}
            >
              {q.name}
            </span>
            <span className="text-xs text-muted-foreground">
              +{q.expReward} EXP · +{q.coinReward}코인
            </span>
          </li>
        );
      })}
    </ul>
  );
}
