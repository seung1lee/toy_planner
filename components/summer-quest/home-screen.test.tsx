import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GameState } from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { seedState } from "@/services/seed";
import { GameProvider } from "@/hooks/useGame";
import { HomeScreen } from "./home-screen";

function adapterWith(state: GameState): StorageAdapter {
  let value: GameState | null = state;
  return { load: () => value, save: (s) => { value = s; } };
}

// 2024-01-01은 월요일.
const MON = new Date(2024, 0, 1);

function stateWithMathPlan(): GameState {
  const s = seedState();
  s.plans.childA = [
    { id: "math", name: "수학 문제", dailyGoal: 20, weekdays: [1, 3, 5] },
  ];
  s.progress.childA.exp = 0;
  s.progress.childA.coins = 0;
  return s;
}

function renderHome(today: Date, state: GameState) {
  const profile = state.profiles.find((p) => p.id === "childA")!;
  return render(
    <GameProvider adapter={adapterWith(state)} today={today}>
      <HomeScreen profile={profile} />
    </GameProvider>
  );
}

describe("HomeScreen — 완료 시 성장 반영", () => {
  it("[S4-2][S4-3] 완료 시 EXP 10 · 코인 5로 반영된다", async () => {
    const user = userEvent.setup();
    renderHome(MON, stateWithMathPlan());
    await screen.findByText("EXP 0");

    await user.click(screen.getByRole("checkbox", { name: "수학 문제 완료" }));

    expect(await screen.findByText("EXP 10")).toBeInTheDocument();
    expect(screen.getByText("코인 5")).toBeInTheDocument();
  });

  it("[S5-2][S5-3] 완료 해제 시 EXP·코인이 회수되어 0이 된다", async () => {
    const user = userEvent.setup();
    renderHome(MON, stateWithMathPlan());
    const checkbox = await screen.findByRole("checkbox", {
      name: "수학 문제 완료",
    });

    await user.click(checkbox);
    await screen.findByText("EXP 10");

    await user.click(checkbox);

    expect(await screen.findByText("EXP 0")).toBeInTheDocument();
    expect(screen.getByText("코인 0")).toBeInTheDocument();
  });
});
