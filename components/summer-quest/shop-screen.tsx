"use client";

import { Coins, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileId } from "@/types/game";
import { useGame } from "@/hooks/useGame";

export function ShopScreen({ profileId }: { profileId: ProfileId }) {
  const { state } = useGame();
  const rewards = state.rewards;
  const coins = state.progress[profileId]?.coins ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">길드 샵</h2>
        <div className="flex items-center gap-1 rounded border px-3 py-2 text-sm">
          <Coins className="size-4" /> 보유 코인 <b>{coins}</b>
        </div>
      </div>

      {rewards.length === 0 ? (
        <p className="text-muted-foreground">등록된 보상이 없어요.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 @md:grid-cols-2">
          {rewards.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="size-4" />
                  {r.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-1 text-sm text-muted-foreground">
                <Coins className="size-3.5" />
                {r.price}코인
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
