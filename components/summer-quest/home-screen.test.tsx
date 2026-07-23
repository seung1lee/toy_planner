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

function stateWithFiveMondayItems(): GameState {
  const s = seedState();
  s.plans.childA = Array.from({ length: 5 }, (_, i) => ({
    id: `item-${i}`,
    name: `할일${i}`,
    dailyGoal: 1,
    weekdays: [1] as const,
  }));
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

describe("HomeScreen — 레벨업 (S6, INV-1)", () => {
  it("[S6-1][S6-2][S6-3][S6-5] EXP 50 도달 시 레벨업 다이얼로그 · 아바타 강조가 나타난다", async () => {
    const user = userEvent.setup();
    renderHome(MON, stateWithFiveMondayItems());
    const checkboxes = await screen.findAllByRole("checkbox");
    expect(checkboxes).toHaveLength(5);

    for (const checkbox of checkboxes) {
      await user.click(checkbox); // 5 × +10 EXP = 50 → Lv2 임계 도달
    }

    expect(await screen.findByText("🎉 레벨업! 🎉")).toBeInTheDocument();
    expect(screen.getAllByText("Lv2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("견습 모험가").length).toBeGreaterThan(0);
    // Dialog는 Portal로 document.body에 렌더되므로 container가 아닌 document를 조회한다
    expect(
      document.querySelector('[data-emphasized="true"]')
    ).not.toBeNull();
  });

  it("[S6-4][INV-1] 완료 해제로 EXP가 49로 내려가면 Lv1로 되돌아간다", async () => {
    const user = userEvent.setup();
    renderHome(MON, stateWithFiveMondayItems());
    const checkboxes = await screen.findAllByRole("checkbox");

    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }
    await screen.findByText("🎉 레벨업! 🎉");
    await user.click(screen.getByRole("button", { name: "계속하기" }));

    // 하나 해제 → EXP 40 → 다시 Lv1
    await user.click(checkboxes[0]);

    expect(await screen.findByText("EXP 40")).toBeInTheDocument();
    expect(screen.getByText("Lv1")).toBeInTheDocument();
  });
});

describe("HomeScreen — 전체 완료 메시지 + streak (S7, S8)", () => {
  it("[S8-1] 오늘 배정분을 전부 완료하면 전체 완료 메시지가 나타난다", async () => {
    const user = userEvent.setup();
    renderHome(MON, stateWithFiveMondayItems());
    const checkboxes = await screen.findAllByRole("checkbox");

    expect(
      screen.queryByText("오늘의 모험을 전부 클리어했어요! 🎉")
    ).toBeNull(); // 아직 미완료 (S8-2 사전 상태)

    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }

    expect(
      await screen.findByText("오늘의 모험을 전부 클리어했어요! 🎉")
    ).toBeInTheDocument();
  });

  it("[S8-2] 하나라도 미완료면 전체 완료 메시지가 나타나지 않는다", async () => {
    const user = userEvent.setup();
    renderHome(MON, stateWithFiveMondayItems());
    const checkboxes = await screen.findAllByRole("checkbox");

    // 마지막 하나를 제외하고 완료
    for (const checkbox of checkboxes.slice(0, -1)) {
      await user.click(checkbox);
    }

    expect(
      screen.queryByText("오늘의 모험을 전부 클리어했어요! 🎉")
    ).toBeNull();
  });

  it("[S7-1] 전체완료 시 streak가 1일로 반영된다", async () => {
    const user = userEvent.setup();
    renderHome(MON, stateWithFiveMondayItems());
    const checkboxes = await screen.findAllByRole("checkbox");

    expect(screen.getByText("streak 0일")).toBeInTheDocument();

    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }

    expect(await screen.findByText("streak 1일")).toBeInTheDocument();
  });
});
