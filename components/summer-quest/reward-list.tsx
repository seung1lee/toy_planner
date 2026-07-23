"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/hooks/useGame";

export function RewardList() {
  const { state, removeReward } = useGame();
  const rewards = state.rewards;

  if (rewards.length === 0) {
    return <p className="text-muted-foreground">등록된 보상이 없어요.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {rewards.map((r) => (
        <li
          key={r.id}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <span className="flex-1">
            {r.name} · {r.price}코인
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`${r.name} 삭제`}
            onClick={() => removeReward(r.id)}
          >
            <Trash2 />
          </Button>
        </li>
      ))}
    </ul>
  );
}
