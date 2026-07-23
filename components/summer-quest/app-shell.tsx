"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEVELS } from "@/config/game";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useGame } from "@/hooks/useGame";
import { ProfileSwitch } from "./profile-switch";

/** 임시 레벨 표시명 (정식 파생은 Task 5 lib/game/level.ts로 대체) */
function levelNameForExp(exp: number): string {
  return LEVELS.reduce(
    (acc, tier) => (exp >= tier.minExp ? tier : acc),
    LEVELS[0]
  ).name;
}

export function AppShell() {
  const { activeProfile } = useActiveProfile();
  const { state } = useGame();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <ProfileSwitch />

      {activeProfile.role === "parent" ? (
        <Card>
          <CardHeader>
            <CardTitle>부모 · 길드 샵 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              보상 등록 · 교환 내역 (구현 예정)
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{activeProfile.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-6">
            {(() => {
              const progress = state.progress[activeProfile.id];
              return (
                <>
                  <span>EXP {progress.exp}</span>
                  <span>코인 {progress.coins}</span>
                  <span>{levelNameForExp(progress.exp)}</span>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
