import { describe, it, expect } from "vitest";
import type { PlanItem, QuestCompletion, Redemption } from "@/types/game";
import { checkAchievements } from "./achievements";
import { toISODate } from "./today-quests";

const MON = new Date(2024, 0, 1);

const plan: PlanItem[] = [
  { id: "math", name: "수학 문제", dailyGoal: 20, weekdays: [1, 2, 3, 4, 5] },
];

function baseInput(overrides: Partial<Parameters<typeof checkAchievements>[0]> = {}) {
  return {
    exp: 0,
    plan,
    completions: [] as QuestCompletion[],
    redemptions: [] as Redemption[],
    today: MON,
    ...overrides,
  };
}

describe("checkAchievements", () => {
  it("[S16-4] 아무 조건도 만족하지 않으면 빈 집합이다", () => {
    expect(checkAchievements(baseInput())).toEqual(new Set());
  });

  it('[S16-2] 실제 완료가 하나라도 있으면 "첫 클리어"가 만족된다', () => {
    const result = checkAchievements(
      baseInput({
        completions: [{ profileId: "childA", planItemId: "math", dateISO: "2024-01-01" }],
      })
    );
    expect(result.has("first-clear")).toBe(true);
  });

  it('전체완료 보너스 합성 항목만으로는 "첫 클리어"가 만족되지 않는다', () => {
    const result = checkAchievements(
      baseInput({
        completions: [
          { profileId: "childA", planItemId: "__all_clear_bonus__", dateISO: "2024-01-01" },
        ],
      })
    );
    expect(result.has("first-clear")).toBe(false);
  });

  it('[S16-4] EXP가 Lv5 임계 이상이면 "Lv5 도달"이 만족된다', () => {
    expect(checkAchievements(baseInput({ exp: 500 })).has("level-5")).toBe(true);
    expect(checkAchievements(baseInput({ exp: 499 })).has("level-5")).toBe(false);
  });

  it('[S16-4] streak가 7일 이상이면 "7일 연속"이 만족된다', () => {
    // 배정일(월~금)만 세므로 주말을 건너 7개 배정일: 1/1(월)~1/5(금), 1/8(월)~1/9(화)
    const weekdayDates = [1, 2, 3, 4, 5, 8, 9].map((d) => new Date(2024, 0, d));
    const completions: QuestCompletion[] = weekdayDates.map((d) => ({
      profileId: "childA",
      planItemId: "math",
      dateISO: toISODate(d),
    }));
    const result = checkAchievements(
      baseInput({ completions, today: weekdayDates[6] })
    );
    expect(result.has("streak-7")).toBe(true);
  });

  it('[S16-4] 교환 내역이 하나라도 있으면 "첫 교환"이 만족된다', () => {
    const result = checkAchievements(
      baseInput({
        redemptions: [
          { id: "r1", profileId: "childA", rewardId: "x", rewardName: "보상", price: 10, dateISO: "2024-01-01" },
        ],
      })
    );
    expect(result.has("first-redeem")).toBe(true);
  });
});
