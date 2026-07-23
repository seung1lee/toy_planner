// 순수 EXP·코인 산술. types, config에만 의존한다.
import type { ChildProgress } from "@/types/game";
import { EXP_PER_QUEST, COINS_PER_QUEST } from "@/config/game";

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
