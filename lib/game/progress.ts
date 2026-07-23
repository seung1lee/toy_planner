// 순수 EXP·코인 산술. types, config에만 의존한다.
import type { ChildProgress } from "@/types/game";
import { EXP_PER_QUEST, COINS_PER_QUEST, ALL_COMPLETE_BONUS } from "@/config/game";

/** 완료 지급: EXP·코인 +고정값. */
export function applyComplete(progress: ChildProgress): ChildProgress {
  return {
    ...progress,
    exp: progress.exp + EXP_PER_QUEST,
    coins: progress.coins + COINS_PER_QUEST,
  };
}

/** 완료 해제 회수: EXP·코인 -고정값, 0에서 clamp (음수 불가 — INV-4). */
export function applyUncomplete(progress: ChildProgress): ChildProgress {
  return {
    ...progress,
    exp: Math.max(0, progress.exp - EXP_PER_QUEST),
    coins: Math.max(0, progress.coins - COINS_PER_QUEST),
  };
}

/** 오늘 배정분 전체완료 보너스 지급 (S15-3). */
export function applyAllClearBonus(progress: ChildProgress): ChildProgress {
  return { ...progress, coins: progress.coins + ALL_COMPLETE_BONUS };
}

/** 전체완료가 깨졌을 때 보너스 대칭 회수, 0에서 clamp. */
export function revokeAllClearBonus(progress: ChildProgress): ChildProgress {
  return { ...progress, coins: Math.max(0, progress.coins - ALL_COMPLETE_BONUS) };
}
