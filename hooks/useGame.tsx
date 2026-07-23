"use client";

import * as React from "react";
import { toast } from "sonner";
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
import { toISODate, todayQuests, isTodayFullyComplete } from "@/lib/game/today-quests";
import {
  applyComplete,
  applyUncomplete,
  applyAllClearBonus,
  revokeAllClearBonus,
  applyMilestoneBonus,
} from "@/lib/game/progress";
import { canAfford, applyRedeem } from "@/lib/game/redeem";
import { levelForExp } from "@/lib/game/level";
import { checkAchievements } from "@/lib/game/achievements";
import { computeStreak } from "@/lib/game/streak";
import { checkMilestone } from "@/lib/game/milestone";
import {
  LEVELS,
  type LevelTier,
  ALL_CLEAR_BONUS_ITEM_ID,
  ACHIEVEMENTS,
} from "@/config/game";

export interface LevelUpEvent {
  profileId: ProfileId;
  from: LevelTier;
  to: LevelTier;
}

export interface MilestoneEvent {
  profileId: ProfileId;
  milestone: number;
  nextMilestone: number | null;
  daysUntilNext: number | null;
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
  /** 방금 발생한 streak 마일스톤 이벤트 (표시 후 dismissMilestone으로 닫는다) */
  milestoneEvent: MilestoneEvent | null;
  dismissMilestone: () => void;
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
        const updated = [...existing, { profileId, planItemId, dateISO }];
        let progress = applyComplete(s.progress[profileId]);
        let completions = updated;

        // 오늘 배정분 전체완료로 방금 전환됐다면 보너스를 1회 지급한다 (S15-3)
        const quests = todayQuests(s.plans[profileId] ?? [], today);
        const alreadyAwarded = updated.some(
          (c) =>
            c.planItemId === ALL_CLEAR_BONUS_ITEM_ID && c.dateISO === dateISO
        );
        if (!alreadyAwarded && isTodayFullyComplete(quests, updated, dateISO)) {
          progress = applyAllClearBonus(progress);
          completions = [
            ...updated,
            { profileId, planItemId: ALL_CLEAR_BONUS_ITEM_ID, dateISO },
          ];
        }

        return {
          ...s,
          completions: { ...s.completions, [profileId]: completions },
          progress: { ...s.progress, [profileId]: progress },
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

        const updated = existing.filter(
          (c) => !(c.planItemId === planItemId && c.dateISO === dateISO)
        );
        let progress = applyUncomplete(s.progress[profileId]);
        let completions = updated;

        // 전체완료가 깨지면 보너스도 대칭적으로 회수한다 (INV-1 정신)
        const quests = todayQuests(s.plans[profileId] ?? [], today);
        const bonusWasAwarded = updated.some(
          (c) =>
            c.planItemId === ALL_CLEAR_BONUS_ITEM_ID && c.dateISO === dateISO
        );
        if (bonusWasAwarded && !isTodayFullyComplete(quests, updated, dateISO)) {
          progress = revokeAllClearBonus(progress);
          completions = updated.filter(
            (c) =>
              !(c.planItemId === ALL_CLEAR_BONUS_ITEM_ID && c.dateISO === dateISO)
          );
        }

        return {
          ...s,
          completions: { ...s.completions, [profileId]: completions },
          progress: { ...s.progress, [profileId]: progress },
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

  // 업적 잠금 해제 ratchet: 조건을 만족하는 순간 영구히 기록하고 알림을 낸다 (S16-2, S16-3).
  // 조건이 나중에 거짓이 돼도(예: 완료 해제) 이미 해제된 업적은 잠기지 않는다.
  // setState 업데이터 함수는 순수해야 하므로, 계산은 클로저의 state로 미리 끝내고
  // toast 같은 부수효과는 setState 호출 바깥(effect 본문)에서 실행한다.
  React.useEffect(() => {
    if (!hydrated) return;
    const nextProgress = { ...state.progress };
    const unlockedNames: string[] = [];
    let changed = false;

    for (const profile of state.profiles) {
      if (profile.role !== "child") continue;
      const progress = state.progress[profile.id];
      if (!progress) continue;
      const satisfied = checkAchievements({
        exp: progress.exp,
        plan: state.plans[profile.id] ?? [],
        completions: state.completions[profile.id] ?? [],
        redemptions: state.redemptions.filter((r) => r.profileId === profile.id),
        today,
      });
      const newlyUnlocked = [...satisfied].filter(
        (id) => !progress.unlockedAchievementIds.includes(id)
      );
      if (newlyUnlocked.length === 0) continue;
      changed = true;
      nextProgress[profile.id] = {
        ...progress,
        unlockedAchievementIds: [
          ...progress.unlockedAchievementIds,
          ...newlyUnlocked,
        ],
      };
      for (const id of newlyUnlocked) {
        const achievement = ACHIEVEMENTS.find((a) => a.id === id);
        if (achievement) unlockedNames.push(achievement.name);
      }
    }

    if (changed) setState({ ...state, progress: nextProgress });
    for (const name of unlockedNames) toast(`새 업적 획득: "${name}"!`);
  }, [state, hydrated, today]);

  // streak 마일스톤 ratchet: 도달 시 보너스를 1회 지급하고 dialog 이벤트를 낸다 (S17-1, S17-2).
  const [milestoneEvent, setMilestoneEvent] =
    React.useState<MilestoneEvent | null>(null);

  React.useEffect(() => {
    if (!hydrated) return;
    const nextProgress = { ...state.progress };
    let changed = false;
    let latestEvent: MilestoneEvent | null = null;

    for (const profile of state.profiles) {
      if (profile.role !== "child") continue;
      const progress = state.progress[profile.id];
      if (!progress) continue;
      const plan = state.plans[profile.id] ?? [];
      const completions = state.completions[profile.id] ?? [];
      const streak = computeStreak(plan, completions, today);
      const { newlyReached, nextMilestone, daysUntilNext } = checkMilestone(
        streak,
        progress.awardedMilestones
      );
      if (newlyReached.length === 0) continue;

      changed = true;
      let updatedProgress = progress;
      for (const m of newlyReached) {
        updatedProgress = applyMilestoneBonus(updatedProgress);
      }
      updatedProgress = {
        ...updatedProgress,
        awardedMilestones: [...progress.awardedMilestones, ...newlyReached],
      };
      nextProgress[profile.id] = updatedProgress;
      latestEvent = {
        profileId: profile.id,
        milestone: newlyReached[newlyReached.length - 1],
        nextMilestone,
        daysUntilNext,
      };
    }

    if (changed) setState({ ...state, progress: nextProgress });
    if (latestEvent) setMilestoneEvent(latestEvent);
  }, [state, hydrated, today]);

  const dismissMilestone = React.useCallback(() => setMilestoneEvent(null), []);

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
      milestoneEvent,
      dismissMilestone,
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
      milestoneEvent,
      dismissMilestone,
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
