"use client";

import * as React from "react";
import type {
  GameState,
  PlanItem,
  Profile,
  ProfileId,
  Reward,
} from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { localStorageAdapter } from "@/services/localStorageAdapter";
import { seedState } from "@/services/seed";
import { toISODate } from "@/lib/game/today-quests";
import { applyComplete, applyUncomplete } from "@/lib/game/progress";
import { canAfford, applyRedeem } from "@/lib/game/redeem";
import { levelForExp } from "@/lib/game/level";
import { LEVELS, type LevelTier } from "@/config/game";

export interface LevelUpEvent {
  profileId: ProfileId;
  from: LevelTier;
  to: LevelTier;
}

interface GameContextValue {
  state: GameState;
  /** "오늘" (날짜 seam). 테스트·E2E에서 주입 가능. */
  today: Date;
  activeProfileId: ProfileId;
  setActiveProfileId: (id: ProfileId) => void;
  addPlanItem: (profileId: ProfileId, item: PlanItem) => void;
  removePlanItem: (profileId: ProfileId, itemId: string) => void;
  addReward: (reward: Reward) => void;
  removeReward: (rewardId: string) => void;
  isRewardRedeemed: (rewardId: string) => boolean;
  redeemReward: (profileId: ProfileId, rewardId: string) => void;
  isQuestCompleted: (
    profileId: ProfileId,
    planItemId: string,
    dateISO: string
  ) => boolean;
  completeQuest: (profileId: ProfileId, planItemId: string) => void;
  uncompleteQuest: (profileId: ProfileId, planItemId: string) => void;
  /** 방금 발생한 레벨업 이벤트 (표시 후 dismissLevelUp으로 닫는다) */
  levelUpEvent: LevelUpEvent | null;
  dismissLevelUp: () => void;
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

  const addReward = React.useCallback((reward: Reward) => {
    setState((s) => ({ ...s, rewards: [...s.rewards, reward] }));
  }, []);

  const removeReward = React.useCallback((rewardId: string) => {
    setState((s) => ({
      ...s,
      rewards: s.rewards.filter((r) => r.id !== rewardId),
    }));
  }, []);

  const isRewardRedeemed = React.useCallback(
    (rewardId: string) =>
      state.redemptions.some((r) => r.rewardId === rewardId),
    [state.redemptions]
  );

  const redeemReward = React.useCallback(
    (profileId: ProfileId, rewardId: string) => {
      const dateISO = toISODate(today);
      setState((s) => {
        const reward = s.rewards.find((r) => r.id === rewardId);
        if (!reward) return s;
        const alreadyRedeemed = s.redemptions.some(
          (r) => r.rewardId === rewardId
        );
        const progress = s.progress[profileId];
        if (!progress || alreadyRedeemed || !canAfford(progress.coins, reward.price)) {
          return s; // 이미 교환됨 또는 코인 부족 — 무시
        }
        return {
          ...s,
          progress: {
            ...s.progress,
            [profileId]: {
              ...progress,
              coins: applyRedeem(progress.coins, reward.price),
            },
          },
          redemptions: [
            ...s.redemptions,
            {
              id: crypto.randomUUID(),
              profileId,
              rewardId,
              rewardName: reward.name,
              price: reward.price,
              dateISO,
            },
          ],
        };
      });
    },
    [today]
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

  // 레벨업 감지: 프로필별 이전 레벨을 추적해, 상승을 건널 때만 이벤트를 낸다.
  // 하락(회수)은 조용히 반영되고 다이얼로그를 띄우지 않는다 (S6-4).
  const [levelUpEvent, setLevelUpEvent] = React.useState<LevelUpEvent | null>(
    null
  );
  const prevLevelsRef = React.useRef<Record<string, number>>({});

  React.useEffect(() => {
    if (!hydrated) return;
    for (const profile of state.profiles) {
      if (profile.role !== "child") continue;
      const progress = state.progress[profile.id];
      if (!progress) continue;
      const tier = levelForExp(progress.exp);
      const prevLevel = prevLevelsRef.current[profile.id];
      if (prevLevel !== undefined && tier.level > prevLevel) {
        const fromTier =
          LEVELS.find((t) => t.level === prevLevel) ?? LEVELS[0];
        setLevelUpEvent({ profileId: profile.id, from: fromTier, to: tier });
      }
      prevLevelsRef.current[profile.id] = tier.level;
    }
  }, [state.profiles, state.progress, hydrated]);

  const dismissLevelUp = React.useCallback(() => setLevelUpEvent(null), []);

  const value = React.useMemo<GameContextValue>(
    () => ({
      state,
      today,
      activeProfileId,
      setActiveProfileId,
      addPlanItem,
      removePlanItem,
      addReward,
      removeReward,
      isRewardRedeemed,
      redeemReward,
      isQuestCompleted,
      completeQuest,
      uncompleteQuest,
      levelUpEvent,
      dismissLevelUp,
    }),
    [
      state,
      today,
      activeProfileId,
      addPlanItem,
      removePlanItem,
      addReward,
      removeReward,
      isRewardRedeemed,
      redeemReward,
      isQuestCompleted,
      completeQuest,
      uncompleteQuest,
      levelUpEvent,
      dismissLevelUp,
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
