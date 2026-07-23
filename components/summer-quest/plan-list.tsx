"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXP_PER_QUEST, COINS_PER_QUEST } from "@/config/game";
import type { ProfileId } from "@/types/game";
import { useGame } from "@/hooks/useGame";
import { formatWeekdays } from "./weekdays";

export function PlanList({ profileId }: { profileId: ProfileId }) {
  const { state, removePlanItem } = useGame();
  const items = state.plans[profileId] ?? [];

  if (items.length === 0) {
    return <p className="text-muted-foreground">아직 계획 항목이 없어요.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <span className="flex-1">
            {item.name} {item.dailyGoal}개 · {formatWeekdays(item.weekdays)}
            {(item.expReward !== undefined || item.coinReward !== undefined) && (
              <span className="text-muted-foreground">
                {" "}
                · +{item.expReward ?? EXP_PER_QUEST} EXP · +
                {item.coinReward ?? COINS_PER_QUEST}코인
              </span>
            )}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`${item.name} 삭제`}
            onClick={() => removePlanItem(profileId, item.id)}
          >
            <Trash2 />
          </Button>
        </li>
      ))}
    </ul>
  );
}
