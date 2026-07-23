"use client";

import { Coins, Flame } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MILESTONE_BONUS } from "@/config/game";

export function MilestoneDialog({
  milestone,
  nextMilestone,
  daysUntilNext,
  onClose,
}: {
  milestone: number;
  nextMilestone: number | null;
  daysUntilNext: number | null;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="size-5" />
            {milestone}일 연속 달성! 🔥
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            마일스톤 보너스 +{MILESTONE_BONUS}
            <Coins className="size-4" />
          </DialogDescription>
        </DialogHeader>

        {nextMilestone !== null && (
          <p className="text-sm text-muted-foreground">
            다음 마일스톤({nextMilestone}일)까지 {daysUntilNext}일 남았어요
          </p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onClose}>계속하기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
