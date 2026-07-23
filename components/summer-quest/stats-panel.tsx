"use client";

import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChildProgress } from "@/types/game";
import { levelForExp } from "@/lib/game/level";
import { AvatarDisplay } from "./avatar-display";
import { ExpBar } from "./exp-bar";

export function StatsPanel({
  name,
  progress,
  streak,
  reacting = false,
}: {
  name: string;
  progress: ChildProgress;
  streak: number;
  /** 퀘스트 완료 순간의 짧은 반응 연출 (S14-3) */
  reacting?: boolean;
}) {
  const tier = levelForExp(progress.exp);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <AvatarDisplay avatarKey={tier.avatar} size="lg" reacting={reacting} />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex gap-2">
            <span className="font-bold">{tier.name}</span>
            <span className="text-muted-foreground">{tier.title}</span>
          </div>
          <div className="flex gap-6">
            <span>EXP {progress.exp}</span>
            <span>코인 {progress.coins}</span>
            <span className="flex items-center gap-1">
              <Flame className="size-4" />
              연속 {streak}일
            </span>
          </div>
          <ExpBar exp={progress.exp} />
        </div>
      </CardContent>
    </Card>
  );
}
