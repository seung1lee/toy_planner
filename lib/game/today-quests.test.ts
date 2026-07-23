import { describe, it, expect } from "vitest";
import type { PlanItem } from "@/types/game";
import { todayQuests } from "./today-quests";

// 2024-01-01은 월요일 (로컬 자정 기준으로 안정적).
const MON = new Date(2024, 0, 1);
const TUE = new Date(2024, 0, 2);
const SAT = new Date(2024, 0, 6);
const SUN = new Date(2024, 0, 7);
const MON_NEXT_WEEK = new Date(2024, 0, 8);

const math: PlanItem = {
  id: "math",
  name: "수학 문제",
  dailyGoal: 20,
  weekdays: [1, 3, 5], // 월·수·금
};

describe("todayQuests — 결정적 생성", () => {
  it("[S3-1] 월요일에는 월이 선택된 항목이 생성된다", () => {
    const quests = todayQuests([math], MON);
    expect(quests.map((q) => q.name)).toContain("수학 문제");
  });

  it("[S3-2] 화요일에는 화가 미선택된 항목이 생성되지 않는다", () => {
    const quests = todayQuests([math], TUE);
    expect(quests.map((q) => q.name)).not.toContain("수학 문제");
    expect(quests).toHaveLength(0);
  });

  it("[S3-3] 토·일요일에는 어떤 퀘스트도 생성되지 않는다", () => {
    expect(todayQuests([math], SAT)).toHaveLength(0);
    expect(todayQuests([math], SUN)).toHaveLength(0);
  });

  it("[S3-4] 같은 날짜로 여러 번 호출해도 동일한 집합이 나온다", () => {
    const a = todayQuests([math], MON);
    const b = todayQuests([math], MON);
    expect(a).toEqual(b);
  });

  it("[S12-1] 계획에 주(week) 개념이 없어 다음 주 같은 요일에도 동일하게 생성된다", () => {
    const thisWeek = todayQuests([math], MON);
    const nextWeek = todayQuests([math], MON_NEXT_WEEK);
    expect(nextWeek).toEqual(thisWeek);
  });
});
