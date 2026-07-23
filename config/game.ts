// 게임 정책·상수. types에만 의존한다.
import type { ChildProgress, ProfileId } from "@/types/game";

/** 퀘스트 완료당 지급 (제안 기본값) */
export const EXP_PER_QUEST = 10;
export const COINS_PER_QUEST = 5;
/** 오늘 배정분 전체 완료 보너스 코인 (제안 기본값) */
export const ALL_COMPLETE_BONUS = 10;
/**
 * 전체완료 보너스를 completions에 표시하는 합성 항목 ID.
 * 실제 계획 항목이 아니므로 계획·퀘스트 목록에는 나타나지 않는다 — 지급 여부만 completions에 기록해
 * 별도 progress 필드 없이 완료 해제 시 자동으로 대칭 회수되게 한다.
 */
export const ALL_CLEAR_BONUS_ITEM_ID = "__all_clear_bonus__";

export interface LevelTier {
  level: number;
  /** 표시명 (예: "Lv1") */
  name: string;
  title: string;
  minExp: number;
  /** 아바타 티어 키 (외형 매핑) */
  avatar: string;
}

/** 레벨 정책 (제안 기본값). minExp 오름차순. */
export const LEVELS: LevelTier[] = [
  { level: 1, name: "Lv1", title: "새싹 모험가", minExp: 0, avatar: "sprout" },
  { level: 2, name: "Lv2", title: "견습 모험가", minExp: 50, avatar: "apprentice" },
  { level: 3, name: "Lv3", title: "숙련 모험가", minExp: 150, avatar: "skilled" },
  { level: 4, name: "Lv4", title: "베테랑 모험가", minExp: 300, avatar: "veteran" },
  { level: 5, name: "Lv5", title: "전설의 모험가", minExp: 500, avatar: "legend" },
];

/** streak 마일스톤 일수 (제안 기본값) */
export const STREAK_MILESTONES = [3, 7, 14];
export const MILESTONE_BONUS = 15;

export interface Achievement {
  id: string;
  name: string;
}

/** 기본 업적 목록 (제안 기본값) */
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-clear", name: "첫 클리어" },
  { id: "level-5", name: "Lv5 도달" },
  { id: "streak-7", name: "7일 연속" },
  { id: "first-redeem", name: "첫 교환" },
];

export function initialProgress(profileId: ProfileId): ChildProgress {
  return {
    profileId,
    exp: 0,
    coins: 0,
    unlockedAchievementIds: [],
    awardedMilestones: [],
  };
}
