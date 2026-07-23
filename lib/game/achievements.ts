// 순수 업적 조건 평가. types, config에만 의존한다 (streak 파생 로직 재사용).
import type { PlanItem, QuestCompletion, Redemption } from "@/types/game";
import { ALL_CLEAR_BONUS_ITEM_ID } from "@/config/game";
import { levelForExp } from "./level";
import { computeStreak } from "./streak";

export interface AchievementCheckInput {
  exp: number;
  plan: PlanItem[];
  completions: QuestCompletion[];
  redemptions: Redemption[];
  today: Date;
}

/**
 * 현재 상태가 각 업적 조건을 만족하는지 평가한다. 만족하는 업적 id 집합을 반환한다.
 * 조건은 현 상태의 순간 판정이다 — "한 번 만족했으면 영구히 유지"하는 잠금 해제는
 * 호출자(useGame)가 이 결과를 이전에 해제된 목록에 합쳐(ratchet) 처리한다.
 */
export function checkAchievements(input: AchievementCheckInput): Set<string> {
  const unlocked = new Set<string>();

  const hasRealCompletion = input.completions.some(
    (c) => c.planItemId !== ALL_CLEAR_BONUS_ITEM_ID
  );
  if (hasRealCompletion) unlocked.add("first-clear");

  if (levelForExp(input.exp).level >= 5) unlocked.add("level-5");

  if (computeStreak(input.plan, input.completions, input.today) >= 7) {
    unlocked.add("streak-7");
  }

  if (input.redemptions.length > 0) unlocked.add("first-redeem");

  return unlocked;
}
