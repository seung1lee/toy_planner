import { describe, it, expect } from "vitest";
import type { ChildProgress } from "@/types/game";
import { applyComplete, applyUncomplete } from "./progress";

function progress(exp: number, coins: number): ChildProgress {
  return {
    profileId: "childA",
    exp,
    coins,
    unlockedAchievementIds: [],
    awardedMilestones: [],
  };
}

describe("progress — EXP·코인 지급/회수", () => {
  it("[S4-2][S4-3] 완료 시 EXP +10, 코인 +5가 지급된다", () => {
    const result = applyComplete(progress(0, 0));
    expect(result.exp).toBe(10);
    expect(result.coins).toBe(5);
  });

  it("[S5-2][S5-3] 해제 시 지급분이 회수되어 EXP·코인이 0이 된다", () => {
    const result = applyUncomplete(progress(10, 5));
    expect(result.exp).toBe(0);
    expect(result.coins).toBe(0);
  });

  it("[INV-4] 회수해도 0 미만으로 내려가지 않는다 (clamp)", () => {
    const result = applyUncomplete(progress(0, 0));
    expect(result.exp).toBe(0);
    expect(result.coins).toBe(0);
  });
});
