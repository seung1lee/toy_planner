"use client";

import { ArrowRight } from "lucide-react";
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
import type { LevelTier } from "@/config/game";
import { AvatarDisplay } from "./avatar-display";

export function LevelUpDialog({
  from,
  to,
  onClose,
}: {
  from: LevelTier;
  to: LevelTier;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🎉 레벨업! 🎉</DialogTitle>
          <DialogDescription>
            {to.name} {to.title}이 되었어요! 새로운 모습을 얻었어요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="flex flex-col items-center gap-1 opacity-50">
            <AvatarDisplay avatarKey={from.avatar} size="lg" />
            <span className="text-xs">{from.name}</span>
          </div>
          <ArrowRight className="text-muted-foreground" />
          <div className="flex flex-col items-center gap-1">
            <AvatarDisplay avatarKey={to.avatar} size="lg" emphasized />
            <span className="text-xs font-bold">{to.name}</span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onClose}>계속하기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
