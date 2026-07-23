"use client";

import { Coins, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileId } from "@/types/game";
import { useGame } from "@/hooks/useGame";
import { canAfford } from "@/lib/game/redeem";

export function ShopScreen({ profileId }: { profileId: ProfileId }) {
  const { state, isRewardRedeemed, redeemReward } = useGame();
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
          {rewards.map((r) => {
            const redeemed = isRewardRedeemed(r.id);
            const affordable = canAfford(coins, r.price);
            return (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="size-4" />
                    {r.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Coins className="size-3.5" />
                    {r.price}코인
                  </span>
                  <Button
                    disabled={redeemed || !affordable}
                    onClick={() => redeemReward(profileId, r.id)}
                  >
                    {redeemed ? "교환됨" : "교환"}
                  </Button>
                  {!redeemed && !affordable && (
                    <span className="text-xs text-muted-foreground">
                      코인이 부족해요
                    </span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
