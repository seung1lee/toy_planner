"use client";

import { RewardForm } from "./reward-form";
import { RewardList } from "./reward-list";
import { RedemptionHistory } from "./redemption-history";

export function ParentScreen() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold">부모 · 길드 샵 관리</h2>
      <RewardForm />
      <div>
        <h3 className="mb-2 text-sm font-bold">등록된 보상</h3>
        <RewardList />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold">교환 내역</h3>
        <RedemptionHistory />
      </div>
    </div>
  );
}
