"use client";

import { ALL_COMPLETE_BONUS } from "@/config/game";
import { Confetti } from "./confetti";

export function AllClearMessage({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-1 rounded-lg border bg-muted p-4 text-center"
    >
      <Confetti />
      <span className="font-bold">오늘의 모험을 전부 클리어했어요! 🎉</span>
      <span className="text-sm text-muted-foreground">
        전체 완료 보너스 +{ALL_COMPLETE_BONUS}코인
      </span>
    </div>
  );
}
