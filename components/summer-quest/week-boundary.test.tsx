import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GameState } from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { seedState } from "@/services/seed";
import { GameProvider } from "@/hooks/useGame";
import { HomeScreen } from "./home-screen";
import { PlanScreen } from "./plan-screen";

function sharedAdapter(initial: GameState): StorageAdapter {
  let value: GameState = initial;
  return {
    load: () => value,
    save: (s) => {
      value = s;
    },
  };
}

// 2024-01-05(금, 이번 주) → 2024-01-08(월, 다음 주)
const FRI_THIS_WEEK = new Date(2024, 0, 5);
const MON_NEXT_WEEK = new Date(2024, 0, 8);

function stateWithMathPlan(): GameState {
  const s = seedState();
  s.plans.childA = [
    { id: "math", name: "수학 문제", dailyGoal: 20, weekdays: [1, 3, 5] },
  ];
  s.progress.childA.exp = 0;
  s.progress.childA.coins = 0;
  return s;
}

describe("주 경계 — 계획·진행 지속성 (S12)", () => {
  it("[S12-1] 다음 주 월요일에도 같은 계획으로 오늘의 퀘스트가 생성된다", async () => {
    const state = stateWithMathPlan();
    const adapter = sharedAdapter(state);
    const profile = state.profiles.find((p) => p.id === "childA")!;

    render(
      <GameProvider adapter={adapter} today={MON_NEXT_WEEK}>
        <HomeScreen profile={profile} />
      </GameProvider>
    );

    expect(await screen.findByText("수학 문제")).toBeInTheDocument();
  });

  it("[S12-2] 이번 주 금요일에 쌓은 진행이 다음 주 월요일까지 이어진다 (리셋 없음)", async () => {
    const state = stateWithMathPlan();
    const adapter = sharedAdapter(state);
    const profile = state.profiles.find((p) => p.id === "childA")!;
    const user = userEvent.setup();

    const first = render(
      <GameProvider adapter={adapter} today={FRI_THIS_WEEK}>
        <HomeScreen profile={profile} />
      </GameProvider>
    );
    await user.click(
      await screen.findByRole("checkbox", { name: "수학 문제 완료" })
    );
    await screen.findByText("EXP 10");
    first.unmount();

    render(
      <GameProvider adapter={adapter} today={MON_NEXT_WEEK}>
        <HomeScreen profile={profile} />
      </GameProvider>
    );

    expect(await screen.findByText("EXP 10")).toBeInTheDocument(); // 리셋되지 않음
  });

  it("[S12-3] 다음 주에도 계획을 추가·수정할 수 있다", async () => {
    const state = stateWithMathPlan();
    const adapter = sharedAdapter(state);
    const user = userEvent.setup();

    render(
      <GameProvider adapter={adapter} today={MON_NEXT_WEEK}>
        <PlanScreen profileId="childA" />
      </GameProvider>
    );
    await screen.findByText("수학 문제 20개 · 월·수·금");

    await user.type(screen.getByPlaceholderText("예: 수학 문제"), "새 항목");
    await user.click(screen.getByRole("button", { name: "화" }));
    await user.click(screen.getByRole("button", { name: "추가" }));

    expect(await screen.findByText("새 항목 0개 · 화")).toBeInTheDocument();
    expect(
      screen.getByText("수학 문제 20개 · 월·수·금")
    ).toBeInTheDocument(); // 기존 계획 유지
  });
});
