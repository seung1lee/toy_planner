// 순수 퀘스트 생성 로직. types에만 의존한다 (DOM·저장소 무관).
import type { PlanItem, QuestCompletion, Weekday } from "@/types/game";

/** JS Date.getDay(): 0=일 … 6=토. 월(1)~금(5)만 Weekday, 주말이면 null. */
export function weekdayOf(date: Date): Weekday | null {
  const d = date.getDay();
  return d >= 1 && d <= 5 ? (d as Weekday) : null;
}

/** 로컬 날짜를 YYYY-MM-DD로. 완료 기록·streak 판정의 날짜 키. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

/**
 * 그 날 배정된 퀘스트가 하나 이상이고 전부 완료됐는지 판정한다.
 * 배정된 퀘스트가 없으면(주말 등) false — "완료할 것이 없음"은 "전체 완료"가 아니다.
 */
export function isTodayFullyComplete(
  quests: TodayQuest[],
  completions: QuestCompletion[],
  dateISO: string
): boolean {
  if (quests.length === 0) return false;
  return quests.every((q) =>
    completions.some((c) => c.planItemId === q.planItemId && c.dateISO === dateISO)
  );
}
