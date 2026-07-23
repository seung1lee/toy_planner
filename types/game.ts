// Summer Quest 도메인 타입. 이 레이어는 의존성이 없다.

/**
 * 프로필 식별자. 시드 프로필은 "childA"/"childB"/"parent" 리터럴이지만,
 * 자녀 추가 기능으로 런타임에 생성되는 ID도 담아야 해서 string으로 둔다.
 * GameState의 Record 필드들도 이미 Record<string, ...>이라 이 타입만 넓히면 충분하다.
 */
export type ProfileId = string;
export type Role = "child" | "parent";

export interface Profile {
  id: ProfileId;
  name: string;
  role: Role;
  /** 프로필 아바타 (이모지) */
  avatarEmoji?: string;
}

/** 월(1) ~ 금(5). 주말은 배정 불가. */
export type Weekday = 1 | 2 | 3 | 4 | 5;

export interface PlanItem {
  id: string;
  name: string;
  dailyGoal: number;
  /** 수행 요일 (월~금 중 다중, 최소 1개) */
  weekdays: Weekday[];
  /** 완료당 지급 EXP (미지정 시 config의 기본값 사용) */
  expReward?: number;
  /** 완료당 지급 코인 (미지정 시 config의 기본값 사용) */
  coinReward?: number;
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
  /**
   * streak는 별도 필드로 저장하지 않는다 — plan·completions·today로부터
   * lib/game/streak.ts의 computeStreak()가 매번 순수하게 파생한다.
   * 완료 해제(S5)로 과거 완료가 취소돼도 항상 최신 상태와 일치하므로 더 안전하다.
   */
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
