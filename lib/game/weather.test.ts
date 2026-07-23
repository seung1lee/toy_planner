import { describe, it, expect } from "vitest";
import { classifyWeatherCode, recommendExercise } from "./weather";

describe("weather — 분류·추천", () => {
  it("코드를 범주로 분류한다", () => {
    expect(classifyWeatherCode(0)).toBe("clear");
    expect(classifyWeatherCode(3)).toBe("cloudy");
    expect(classifyWeatherCode(61)).toBe("rain");
    expect(classifyWeatherCode(73)).toBe("snow");
    expect(classifyWeatherCode(96)).toBe("storm");
  });

  it("비/눈/뇌우엔 실내 활동을 추천한다", () => {
    expect(recommendExercise(20, 61)).toContain("실내");
    expect(recommendExercise(-2, 73)).toContain("실내");
    expect(recommendExercise(20, 96)).toContain("실내");
  });

  it("너무 덥거나 추우면 그에 맞는 안전 문구를 추천한다", () => {
    expect(recommendExercise(32, 0)).toContain("더워요");
    expect(recommendExercise(-3, 0)).toContain("추워요");
  });

  it("쾌적한 맑은 날엔 야외 활동을 추천한다", () => {
    expect(recommendExercise(20, 0)).toContain("밖에서");
  });
});
