import { describe, it, expect } from "vitest";
import type { PlanItem, QuestCompletion } from "@/types/game";
import { toISODate } from "./today-quests";
import { computeStreak } from "./streak";

// 2024-01-01(월) ~ 2024-01-07(일)
const MON = new Date(2024, 0, 1);
const TUE = new Date(2024, 0, 2);
const WED = new Date(2024, 0, 3);
const THU = new Date(2024, 0, 4);
const FRI = new Date(2024, 0, 5);
const SAT = new Date(2024, 0, 6);
const SUN = new Date(2024, 0, 7);

const mathPlan: PlanItem = {
  id: "math",
  name: "수학 문제",
  dailyGoal: 20,
  weekdays: [1, 2, 3, 4, 5], // 매 배정일
};

function completionsOn(dates: Date[]): QuestCompletion[] {
  return dates.map((d) => ({
    profileId: "childA",
    planItemId: "math",
    dateISO: toISODate(d),
  }));
}

describe("computeStreak", () => {
  it("[S7-1] 연속 전체완료 배정일마다 streak가 1씩 증가해 반영된다", () => {
    const completions = completionsOn([MON, TUE]);
    expect(computeStreak([mathPlan], completions, MON)).toBe(1);
    expect(computeStreak([mathPlan], completions, TUE)).toBe(2);
  });

  it("[S7-2] 배정일에 전체완료가 아니면 다음 배정일에 streak가 0으로 끊긴다", () => {
    // MON만 완료, TUE는 아직 완료 기록 없음
    const completions = completionsOn([MON]);
    expect(computeStreak([mathPlan], completions, TUE)).toBe(0);
  });

  it("[S7-3] 주말은 streak를 끊지도 늘리지도 않는다", () => {
    const completions = completionsOn([MON, TUE, WED, THU, FRI]);
    expect(computeStreak([mathPlan], completions, FRI)).toBe(5);
    expect(computeStreak([mathPlan], completions, SAT)).toBe(5);
    expect(computeStreak([mathPlan], completions, SUN)).toBe(5);
  });

  it("끊긴 뒤 다시 완료하면 1부터 새로 시작한다", () => {
    // MON 완료, TUE 미완료, WED 완료 → WED 기준 streak는 1
    const completions = completionsOn([MON, WED]);
    expect(computeStreak([mathPlan], completions, WED)).toBe(1);
  });
});
