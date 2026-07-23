// 순수 퀘스트 생성 로직. types에만 의존한다 (DOM·저장소 무관).
import type { PlanItem, Weekday } from "@/types/game";

/** JS Date.getDay(): 0=일 … 6=토. 월(1)~금(5)만 Weekday, 주말이면 null. */
export function weekdayOf(date: Date): Weekday | null {
  const d = date.getDay();
  return d >= 1 && d <= 5 ? (d as Weekday) : null;
}

export interface TodayQuest {
  planItemId: string;
  name: string;
  dailyGoal: number;
}

/**
 * 계획에서 주어진 날짜에 배정된 퀘스트를 결정적으로 생성한다.
 * 선택한 요일에만 생성되며, 랜덤·자동 매핑은 없다. 계획 순서를 보존한다.
 */
export function todayQuests(plan: PlanItem[], date: Date): TodayQuest[] {
  const wd = weekdayOf(date);
  if (wd === null) return [];
  return plan
    .filter((item) => item.weekdays.includes(wd))
    .map((item) => ({
      planItemId: item.id,
      name: item.name,
      dailyGoal: item.dailyGoal,
    }));
}
