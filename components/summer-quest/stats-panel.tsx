"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChildProgress } from "@/types/game";
import { levelForExp } from "@/lib/game/level";
import { AvatarDisplay } from "./avatar-display";

export function StatsPanel({
  name,
  progress,
}: {
  name: string;
  progress: ChildProgress;
}) {
  const tier = levelForExp(progress.exp);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <AvatarDisplay avatarKey={tier.avatar} size="lg" />
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <span className="font-bold">{tier.name}</span>
            <span className="text-muted-foreground">{tier.title}</span>
          </div>
          <div className="flex gap-6">
            <span>EXP {progress.exp}</span>
            <span>코인 {progress.coins}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
