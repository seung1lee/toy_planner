// 순수 레벨 파생. types, config에만 의존한다.
import { LEVELS, type LevelTier } from "@/config/game";

/** EXP에 해당하는 레벨 티어를 결정적으로 반환한다. */
export function levelForExp(exp: number): LevelTier {
  return LEVELS.reduce(
    (acc, tier) => (exp >= tier.minExp ? tier : acc),
    LEVELS[0]
  );
}

export function avatarForLevel(level: number): string {
  const tier = LEVELS.find((t) => t.level === level) ?? LEVELS[0];
  return tier.avatar;
}
