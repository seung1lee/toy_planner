// 순수 streak 파생. types에만 의존한다 (DOM·저장소 무관).
import type { PlanItem, QuestCompletion } from "@/types/game";
import { todayQuests, toISODate, isTodayFullyComplete } from "./today-quests";

/** 무한루프 방지 안전장치 (약 10년치 일수) */
const MAX_LOOKBACK_DAYS = 3650;

function prevDay(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d;
}

function isAssignedDay(plan: PlanItem[], date: Date): boolean {
  return todayQuests(plan, date).length > 0;
}

function isDayFullyComplete(
  plan: PlanItem[],
  completions: QuestCompletion[],
  date: Date
): boolean {
  return isTodayFullyComplete(todayQuests(plan, date), completions, toISODate(date));
}

/**
 * 배정일(계획에 항목이 있는 요일) 전체완료가 연속된 일수를 파생한다.
 * 배정 없는 날(주말)은 세지도 끊지도 않는다 (S7-3) — 건너뛴다.
 * 배정일에 전체완료가 아니면 그 지점에서 연쇄가 끊긴다 (S7-2).
 * plan·completions·today만으로 결정되는 순수 함수 — 완료 해제(S5)로도 항상 최신과 일치한다.
 */
export function computeStreak(
  plan: PlanItem[],
  completions: QuestCompletion[],
  today: Date
): number {
  if (plan.length === 0) return 0;

  let cursor = today;
  let guard = 0;
  while (!isAssignedDay(plan, cursor)) {
    cursor = prevDay(cursor);
    if (++guard > MAX_LOOKBACK_DAYS) return 0;
  }

  let streak = 0;
  guard = 0;
  while (isDayFullyComplete(plan, completions, cursor)) {
    streak += 1;
    cursor = prevDay(cursor);
    while (!isAssignedDay(plan, cursor)) {
      cursor = prevDay(cursor);
      if (++guard > MAX_LOOKBACK_DAYS) return streak;
    }
    if (++guard > MAX_LOOKBACK_DAYS) return streak;
  }
  return streak;
}
