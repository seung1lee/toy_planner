import { describe, it, expect } from "vitest";
import { canAfford, applyRedeem } from "./redeem";

describe("redeem — 교환 산술 (INV-4)", () => {
  it("[S10-1] 잔액이 충분하면 가격만큼 차감된다", () => {
    expect(applyRedeem(60, 50)).toBe(10);
  });

  it("[S11-1][INV-4] 잔액보다 비싸면 차감 없이 그대로 유지된다", () => {
    expect(canAfford(30, 50)).toBe(false);
    expect(applyRedeem(30, 50)).toBe(30);
  });

  it("[INV-4] 잔액이 정확히 가격과 같으면 교환 가능하고 0이 된다", () => {
    expect(canAfford(50, 50)).toBe(true);
    expect(applyRedeem(50, 50)).toBe(0);
  });
});
