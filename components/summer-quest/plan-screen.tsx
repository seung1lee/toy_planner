"use client";

import type { ProfileId } from "@/types/game";
import { PlanForm } from "./plan-form";
import { PlanList } from "./plan-list";

export function PlanScreen({ profileId }: { profileId: ProfileId }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold">이번 주 계획</h2>
        <p className="text-sm text-muted-foreground">
          선택한 요일에만 오늘의 퀘스트로 생성됩니다.
        </p>
      </div>
      <PlanForm profileId={profileId} />
      <div>
        <h3 className="mb-2 text-sm font-bold">이번 주 항목</h3>
        <PlanList profileId={profileId} />
      </div>
    </div>
  );
}
