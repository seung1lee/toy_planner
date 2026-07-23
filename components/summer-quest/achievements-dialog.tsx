"use client";

import { Award, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ACHIEVEMENTS } from "@/config/game";

export function AchievementsDialog({
  unlockedIds,
}: {
  unlockedIds: string[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Award className="size-4" />
          업적
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>업적</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedIds.includes(a.id);
            return (
              <div
                key={a.id}
                data-unlocked={unlocked}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                  {unlocked ? (
                    <Award className="size-6" />
                  ) : (
                    <Lock className="size-5 text-muted-foreground" />
                  )}
                </div>
                <span className="text-xs font-bold">{a.name}</span>
                <span className="text-xs text-muted-foreground">
                  {unlocked ? "획득" : "잠김"}
                </span>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
