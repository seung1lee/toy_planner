"use client";

import * as React from "react";
import type {
  GameState,
  PlanItem,
  Profile,
  ProfileId,
} from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { localStorageAdapter } from "@/services/localStorageAdapter";
import { seedState } from "@/services/seed";
import { toISODate } from "@/lib/game/today-quests";
import { applyComplete, applyUncomplete } from "@/lib/game/progress";

interface GameContextValue {
  state: GameState;
  /** "오늘" (날짜 seam). 테스트·E2E에서 주입 가능. */
  today: Date;
  activeProfileId: ProfileId;
  setActiveProfileId: (id: ProfileId) => void;
  addPlanItem: (profileId: ProfileId, item: PlanItem) => void;
  removePlanItem: (profileId: ProfileId, itemId: string) => void;
  isQuestCompleted: (
    profileId: ProfileId,
    planItemId: string,
    dateISO: string
  ) => boolean;
  completeQuest: (profileId: ProfileId, planItemId: string) => void;
  uncompleteQuest: (profileId: ProfileId, planItemId: string) => void;
}

const GameContext = React.createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: React.ReactNode;
  /** 테스트에서 주입 가능. 기본은 localStorage 어댑터. */
  adapter?: StorageAdapter;
  initialActiveProfileId?: ProfileId;
  /** "오늘" 주입 (테스트·E2E). 미지정 시 실제 현재 날짜. */
  today?: Date;
}

export function GameProvider({
  children,
  adapter = localStorageAdapter,
  initialActiveProfileId = "childA",
  today: todayProp,
}: GameProviderProps) {
  const [state, setState] = React.useState<GameState>(() => seedState());
  const [today] = React.useState<Date>(() => todayProp ?? new Date());
  const [activeProfileId, setActiveProfileId] =
    React.useState<ProfileId>(initialActiveProfileId);
  const [hydrated, setHydrated] = React.useState(false);

  // 마운트 후 저장소에서 로드. hydrated 전에는 children을 렌더하지 않아
  // (1) SSR 불일치와 (2) seed→loaded 깜빡임을 모두 피한다.
  React.useEffect(() => {
    const loaded = adapter.load();
    if (loaded) setState(loaded);
    setHydrated(true);
  }, [adapter]);

  // 로드 완료 후의 변경만 저장한다 (초기 seed로 덮어쓰지 않도록)
  React.useEffect(() => {
    if (hydrated) adapter.save(state);
  }, [state, hydrated, adapter]);

  const addPlanItem = React.useCallback(
    (profileId: ProfileId, item: PlanItem) => {
      setState((s) => ({
        ...s,
        plans: {
          ...s.plans,
          [profileId]: [...(s.plans[profileId] ?? []), item],
        },
      }));
    },
    []
  );

  const removePlanItem = React.useCallback(
    (profileId: ProfileId, itemId: string) => {
      setState((s) => ({
        ...s,
        plans: {
          ...s.plans,
          [profileId]: (s.plans[profileId] ?? []).filter(
            (i) => i.id !== itemId
          ),
        },
      }));
    },
    []
  );

  const isQuestCompleted = React.useCallback(
    (profileId: ProfileId, planItemId: string, dateISO: string) =>
      (state.completions[profileId] ?? []).some(
        (c) => c.planItemId === planItemId && c.dateISO === dateISO
      ),
    [state.completions]
  );

  const completeQuest = React.useCallback(
    (profileId: ProfileId, planItemId: string) => {
      const dateISO = toISODate(today);
      setState((s) => {
        const existing = s.completions[profileId] ?? [];
        // 이미 완료된 퀘스트는 무시 (중복 지급 방지)
        if (
          existing.some(
            (c) => c.planItemId === planItemId && c.dateISO === dateISO
          )
        ) {
          return s;
        }
        return {
          ...s,
          completions: {
            ...s.completions,
            [profileId]: [...existing, { profileId, planItemId, dateISO }],
          },
          progress: {
            ...s.progress,
            [profileId]: applyComplete(s.progress[profileId]),
          },
        };
      });
    },
    [today]
  );

  const uncompleteQuest = React.useCallback(
    (profileId: ProfileId, planItemId: string) => {
      const dateISO = toISODate(today);
      setState((s) => {
        const existing = s.completions[profileId] ?? [];
        const wasCompleted = existing.some(
          (c) => c.planItemId === planItemId && c.dateISO === dateISO
        );
        if (!wasCompleted) return s; // 완료 상태가 아니면 무시
        return {
          ...s,
          completions: {
            ...s.completions,
            [profileId]: existing.filter(
              (c) => !(c.planItemId === planItemId && c.dateISO === dateISO)
            ),
          },
          progress: {
            ...s.progress,
            [profileId]: applyUncomplete(s.progress[profileId]),
          },
        };
      });
    },
    [today]
  );

  const value = React.useMemo<GameContextValue>(
    () => ({
      state,
      today,
      activeProfileId,
      setActiveProfileId,
      addPlanItem,
      removePlanItem,
      isQuestCompleted,
      completeQuest,
      uncompleteQuest,
    }),
    [
      state,
      today,
      activeProfileId,
      addPlanItem,
      removePlanItem,
      isQuestCompleted,
      completeQuest,
      uncompleteQuest,
    ]
  );

  if (!hydrated) return null;

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
