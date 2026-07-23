"use client";

import * as React from "react";
import type { GameState, Profile, ProfileId } from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { localStorageAdapter } from "@/services/localStorageAdapter";
import { seedState } from "@/services/seed";

interface GameContextValue {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  activeProfileId: ProfileId;
  setActiveProfileId: (id: ProfileId) => void;
}

const GameContext = React.createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: React.ReactNode;
  /** 테스트에서 주입 가능. 기본은 localStorage 어댑터. */
  adapter?: StorageAdapter;
  initialActiveProfileId?: ProfileId;
}

export function GameProvider({
  children,
  adapter = localStorageAdapter,
  initialActiveProfileId = "childA",
}: GameProviderProps) {
  const [state, setState] = React.useState<GameState>(() => seedState());
  const [activeProfileId, setActiveProfileId] =
    React.useState<ProfileId>(initialActiveProfileId);
  const [hydrated, setHydrated] = React.useState(false);

  // 마운트 후 저장소에서 로드 (SSR 불일치 회피)
  React.useEffect(() => {
    const loaded = adapter.load();
    if (loaded) setState(loaded);
    setHydrated(true);
  }, [adapter]);

  // 로드 완료 후의 변경만 저장한다 (초기 seed로 덮어쓰지 않도록)
  React.useEffect(() => {
    if (hydrated) adapter.save(state);
  }, [state, hydrated, adapter]);

  const value = React.useMemo<GameContextValue>(
    () => ({ state, setState, activeProfileId, setActiveProfileId }),
    [state, activeProfileId]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = React.useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}

/** 현재 활성 프로필 객체 */
export function useActiveProfileObject(): Profile {
  const { state, activeProfileId } = useGame();
  const profile = state.profiles.find((p) => p.id === activeProfileId);
  if (!profile) throw new Error(`Unknown profile: ${activeProfileId}`);
  return profile;
}
