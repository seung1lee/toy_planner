// 순수 마일스톤 평가. config에만 의존한다.
import { STREAK_MILESTONES } from "@/config/game";

export interface MilestoneCheckResult {
  /** 이번에 새로 도달한 마일스톤 (streak가 그 값 이상이고 아직 지급 안 됨) */
  newlyReached: number[];
  /** 다음 마일스톤 (모두 지났으면 null) */
  nextMilestone: number | null;
  /** 다음 마일스톤까지 남은 일수 (nextMilestone이 null이면 null) */
  daysUntilNext: number | null;
}

/** streak와 이미 지급된 마일스톤 목록으로 새로 도달한 마일스톤·다음 목표를 판정한다. */
export function checkMilestone(
  streak: number,
  awardedMilestones: number[]
): MilestoneCheckResult {
  const newlyReached = STREAK_MILESTONES.filter(
    (m) => streak >= m && !awardedMilestones.includes(m)
  );
  const nextMilestone = STREAK_MILESTONES.find((m) => m > streak) ?? null;
  const daysUntilNext = nextMilestone !== null ? nextMilestone - streak : null;
  return { newlyReached, nextMilestone, daysUntilNext };
}
