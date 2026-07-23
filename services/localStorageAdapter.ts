// localStorage 기반 StorageAdapter 구현. types에 의존한다.
import type { GameState } from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { STATE_VERSION } from "./seed";

/** 버전을 키에 박아 스키마 변경 시 과거 데이터와 충돌하지 않게 한다. */
const STORAGE_KEY = `summer-quest:v${STATE_VERSION}`;

export const localStorageAdapter: StorageAdapter = {
  load(): GameState | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as GameState) : null;
    } catch {
      return null;
    }
  },
  save(state: GameState): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 저장 실패(용량 초과 등)는 조용히 무시 — 데모 범위
    }
  },
};
