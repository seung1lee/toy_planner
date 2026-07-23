import type { GameState } from "./game";

/**
 * 저장소 seam. 화면·훅은 이 인터페이스에만 의존하고 구현(localStorage 등)을 모른다.
 * 후속 단계에서 Supabase 어댑터로 교체해도 상위 레이어는 바뀌지 않는다.
 */
export interface StorageAdapter {
  load(): GameState | null;
  save(state: GameState): void;
}
