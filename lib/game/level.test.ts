import { describe, it, expect } from "vitest";
import { levelForExp, avatarForLevel } from "./level";

describe("levelForExp — 레벨 파생 + INV-1(레벨업/레벨다운 일관성)", () => {
  it("[S6-1] EXP 50 도달 시 Lv2 레벨명·칭호로 파생된다", () => {
    const tier = levelForExp(50);
    expect(tier.name).toBe("Lv2");
    expect(tier.title).toBe("견습 모험가");
  });

  it("[S6-2] Lv2 티어의 아바타 키가 Lv1과 다르다", () => {
    expect(avatarForLevel(2)).not.toBe(avatarForLevel(1));
  });

  it("[S6-4][INV-1] EXP가 49로 내려가면 다시 Lv1로 되돌아간다", () => {
    expect(levelForExp(50).name).toBe("Lv2");
    expect(levelForExp(49).name).toBe("Lv1");
  });

  it("[INV-1] EXP 경계값 각각에서 결정적으로 동일한 티어를 반환한다", () => {
    expect(levelForExp(0).level).toBe(1);
    expect(levelForExp(150).level).toBe(3);
    expect(levelForExp(300).level).toBe(4);
    expect(levelForExp(500).level).toBe(5);
    expect(levelForExp(999).level).toBe(5); // 최고 레벨 상한
  });
});
