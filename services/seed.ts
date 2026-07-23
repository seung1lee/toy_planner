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
    plans: {
      childA: [
        { id: "seed-a-math", name: "수학 문제", dailyGoal: 20, weekdays: [1, 3, 5] },
        { id: "seed-a-eng", name: "영어 단어", dailyGoal: 30, weekdays: [1, 2, 3, 4, 5] },
        { id: "seed-a-read", name: "독서", dailyGoal: 30, weekdays: [2, 4] },
      ],
      childB: [
        { id: "seed-b-piano", name: "피아노 연습", dailyGoal: 30, weekdays: [1, 3] },
        { id: "seed-b-jump", name: "줄넘기", dailyGoal: 100, weekdays: [1, 2, 3, 4, 5] },
      ],
    },
    completions: { childA: [], childB: [] },
    progress: {
      childA: initialProgress("childA"),
      childB: initialProgress("childB"),
    },
    rewards: [
      { id: "seed-reward-chicken", name: "치킨 먹기", price: 50 },
      { id: "seed-reward-game", name: "게임 1시간", price: 30 },
    ],
    redemptions: [],
  };
}
