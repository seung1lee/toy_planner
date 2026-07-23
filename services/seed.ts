// 첫 진입 시드 데이터. types, config에 의존한다.
import type { GameState } from "@/types/game";
import { initialProgress } from "@/config/game";

export const STATE_VERSION = 1;

/** 기존 데이터가 없을 때의 초기 GameState. */
export function seedState(): GameState {
  return {
    version: STATE_VERSION,
    profiles: [
      { id: "childA", name: "자녀A", role: "child" },
      { id: "childB", name: "자녀B", role: "child" },
      { id: "parent", name: "부모", role: "parent" },
    ],
    plans: { childA: [], childB: [] },
    completions: { childA: [], childB: [] },
    progress: {
      childA: initialProgress("childA"),
      childB: initialProgress("childB"),
    },
    rewards: [],
    redemptions: [],
  };
}
