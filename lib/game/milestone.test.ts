import { describe, it, expect } from "vitest";
import { checkMilestone } from "./milestone";

describe("checkMilestone", () => {
  it("[S17-1] streak가 3에 도달하고 아직 지급 안 됐으면 새로 도달한 마일스톤에 포함된다", () => {
    const result = checkMilestone(3, []);
    expect(result.newlyReached).toEqual([3]);
  });

  it("이미 지급된 마일스톤은 다시 newlyReached에 포함되지 않는다 (중복 방지)", () => {
    const result = checkMilestone(3, [3]);
    expect(result.newlyReached).toEqual([]);
  });

  it("[S17-3] 다음 마일스톤과 남은 일수를 계산한다", () => {
    const result = checkMilestone(3, [3]);
    expect(result.nextMilestone).toBe(7);
    expect(result.daysUntilNext).toBe(4);
  });

  it("모든 마일스톤을 지나면 다음 마일스톤이 없다", () => {
    const result = checkMilestone(20, [3, 7, 14]);
    expect(result.nextMilestone).toBeNull();
    expect(result.daysUntilNext).toBeNull();
  });

  it("streak가 두 마일스톤을 한 번에 건너뛰면 둘 다 newlyReached에 포함된다", () => {
    const result = checkMilestone(10, []);
    expect(result.newlyReached).toEqual([3, 7]);
  });
});
