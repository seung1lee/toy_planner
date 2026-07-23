import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GameState } from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { seedState } from "@/services/seed";
import { GameProvider } from "@/hooks/useGame";
import { QuestList } from "./quest-list";

function adapterWith(state: GameState): StorageAdapter {
  let value: GameState | null = state;
  return { load: () => value, save: (s) => { value = s; } };
}

// 2024-01-01은 월요일, 2024-01-02는 화요일, 2024-01-06은 토요일.
const MON = new Date(2024, 0, 1);
const TUE = new Date(2024, 0, 2);
const SAT = new Date(2024, 0, 6);

function stateWithMathPlan(): GameState {
  const s = seedState();
  s.plans.childA = [
    { id: "math", name: "수학 문제", dailyGoal: 20, weekdays: [1, 3, 5] },
  ];
  return s;
}

function renderQuestList(today: Date, state: GameState) {
  return render(
    <GameProvider adapter={adapterWith(state)} today={today}>
      <QuestList profileId="childA" />
    </GameProvider>
  );
}

describe("QuestList — 오늘의 퀘스트 표시", () => {
  it("[S3-1] 월요일에는 월 선택 항목이 나타난다", async () => {
    renderQuestList(MON, stateWithMathPlan());
    expect(await screen.findByText("수학 문제")).toBeInTheDocument();
  });

  it("[S3-2] 화요일에는 화 미선택 항목이 나타나지 않는다", async () => {
    renderQuestList(TUE, stateWithMathPlan());
    // Empty 상태 문구가 대신 나타난다
    expect(
      await screen.findByText("오늘은 배정된 퀘스트가 없어요")
    ).toBeInTheDocument();
    expect(screen.queryByText("수학 문제")).toBeNull();
  });

  it("[S3-3] 토요일에는 오늘의 퀘스트가 없다 (빈 상태)", async () => {
    renderQuestList(SAT, stateWithMathPlan());
    expect(
      await screen.findByText("오늘은 배정된 퀘스트가 없어요")
    ).toBeInTheDocument();
  });

  it("[S3-4] 같은 요일에 다시 렌더해도 동일한 퀘스트 집합이 나타난다", async () => {
    const state = stateWithMathPlan();
    const first = renderQuestList(MON, state);
    expect(await screen.findByText("수학 문제")).toBeInTheDocument();
    first.unmount();

    renderQuestList(MON, state);
    expect(await screen.findByText("수학 문제")).toBeInTheDocument();
  });
});

describe("QuestList — 완료 체크/해제", () => {
  it("[S4-1] 완료 체크 시 체크와 취소선이 나타난다", async () => {
    const user = userEvent.setup();
    renderQuestList(MON, stateWithMathPlan());
    const checkbox = await screen.findByRole("checkbox", {
      name: "수학 문제 완료",
    });

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByText("수학 문제")).toHaveClass("line-through");
  });

  it("[S4-4] 진입 후 완료까지 클릭 1회 (3회 이하)로 끝난다", async () => {
    const user = userEvent.setup();
    renderQuestList(MON, stateWithMathPlan());
    const checkbox = await screen.findByRole("checkbox", {
      name: "수학 문제 완료",
    });

    await user.click(checkbox); // 클릭 1회

    expect(checkbox).toBeChecked();
  });

  it("[S5-1] 완료 해제 시 미완료 표시로 돌아간다", async () => {
    const user = userEvent.setup();
    renderQuestList(MON, stateWithMathPlan());
    const checkbox = await screen.findByRole("checkbox", {
      name: "수학 문제 완료",
    });

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("수학 문제")).not.toHaveClass("line-through");
  });
});
