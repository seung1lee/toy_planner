// 순수 EXP·코인 산술. types, config에만 의존한다.
import type { ChildProgress } from "@/types/game";
import {
  EXP_PER_QUEST,
  COINS_PER_QUEST,
  ALL_COMPLETE_BONUS,
  MILESTONE_BONUS,
} from "@/config/game";

/** 완료 지급: EXP·코인 +값 (미지정 시 기본값). 계획 항목별 보상 오버라이드 지원. */
export function applyComplete(
  progress: ChildProgress,
  exp: number = EXP_PER_QUEST,
  coins: number = COINS_PER_QUEST
): ChildProgress {
  return {
    ...progress,
    exp: progress.exp + exp,
    coins: progress.coins + coins,
  };
}

/** 완료 해제 회수: EXP·코인 -값, 0에서 clamp (음수 불가 — INV-4). */
export function applyUncomplete(
  progress: ChildProgress,
  exp: number = EXP_PER_QUEST,
  coins: number = COINS_PER_QUEST
): ChildProgress {
  return {
    ...progress,
    exp: Math.max(0, progress.exp - exp),
    coins: Math.max(0, progress.coins - coins),
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

/** streak 마일스톤 도달 보너스 지급 (S17-1). */
export function applyMilestoneBonus(progress: ChildProgress): ChildProgress {
  return { ...progress, coins: progress.coins + MILESTONE_BONUS };
}
