"use client";

import { useGame } from "@/hooks/useGame";

export function RedemptionHistory() {
  const { state } = useGame();
  const redemptions = state.redemptions;
  const profileName = (id: string) =>
    state.profiles.find((p) => p.id === id)?.name ?? id;

  if (redemptions.length === 0) {
    return <p className="text-muted-foreground">교환 내역이 없어요.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {redemptions.map((r) => (
        <li key={r.id} className="rounded-lg border p-3 text-sm">
          {profileName(r.profileId)} · {r.rewardName} · {r.price}코인
        </li>
      ))}
    </ul>
  );
}
