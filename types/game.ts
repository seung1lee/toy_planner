// Summer Quest 도메인 타입. 이 레이어는 의존성이 없다.

export type ProfileId = "childA" | "childB" | "parent";
export type Role = "child" | "parent";

export interface Profile {
  id: ProfileId;
  name: string;
  role: Role;
}

/** 월(1) ~ 금(5). 주말은 배정 불가. */
export type Weekday = 1 | 2 | 3 | 4 | 5;

export interface PlanItem {
  id: string;
  name: string;
  dailyGoal: number;
  /** 수행 요일 (월~금 중 다중, 최소 1개) */
  weekdays: Weekday[];
}

export interface QuestCompletion {
  profileId: ProfileId;
  planItemId: string;
  /** YYYY-MM-DD (로컬 날짜) */
  dateISO: string;
}

export interface ChildProgress {
  profileId: ProfileId;
  exp: number;
  coins: number;
  streakCount: number;
  /** 마지막으로 "그 날 전체 완료"한 날 (streak 연속 판정용) */
  lastAllCompleteDateISO: string | null;
  unlockedAchievementIds: string[];
  /** 이미 보너스를 지급한 마일스톤 일수 (중복 방지) */
  awardedMilestones: number[];
}

export interface Reward {
  id: string;
  name: string;
  price: number;
}

export interface Redemption {
  id: string;
  profileId: ProfileId;
  rewardId: string;
  rewardName: string;
  price: number;
  dateISO: string;
}

export interface GameState {
  /** localStorage 스키마 버전 */
  version: number;
  profiles: Profile[];
  plans: Record<string, PlanItem[]>;
  completions: Record<string, QuestCompletion[]>;
  progress: Record<string, ChildProgress>;
  rewards: Reward[];
  redemptions: Redemption[];
}
