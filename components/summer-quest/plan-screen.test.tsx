import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GameState } from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { seedState } from "@/services/seed";
import { GameProvider } from "@/hooks/useGame";
import { PlanScreen } from "./plan-screen";

function adapterWith(state: GameState | null): StorageAdapter {
  let value = state;
  return { load: () => value, save: (s) => { value = s; } };
}

function renderPlan(state: GameState | null) {
  return render(
    <GameProvider adapter={adapterWith(state)}>
      <PlanScreen profileId="childA" />
    </GameProvider>
  );
}

function emptyPlanState(): GameState {
  const s = seedState();
  s.plans.childA = [];
  return s;
}

describe("PlanScreen — 이번 주 계획", () => {
  it("[S2-1] 이름·목표량·요일 입력 후 추가하면 목록에 나타난다", async () => {
    const user = userEvent.setup();
    renderPlan(emptyPlanState());
    await screen.findByText("아직 계획 항목이 없어요.");

    await user.type(screen.getByPlaceholderText("예: 수학 문제"), "한자 쓰기");
    await user.type(screen.getByPlaceholderText("20"), "15");
    await user.click(screen.getByRole("button", { name: "화" }));
    await user.click(screen.getByRole("button", { name: "목" }));
    await user.click(screen.getByRole("button", { name: "추가" }));

    expect(
      await screen.findByText("한자 쓰기 15개 · 화·목")
    ).toBeInTheDocument();
  });

  it("[S2-5] 요일 0개면 추가 불가, 최소 1개 선택해야 활성화된다", async () => {
    const user = userEvent.setup();
    renderPlan(emptyPlanState());
    await screen.findByText("아직 계획 항목이 없어요.");

    const addBtn = screen.getByRole("button", { name: "추가" });
    expect(addBtn).toBeDisabled(); // 이름·요일 모두 비어 있음

    await user.type(screen.getByPlaceholderText("예: 수학 문제"), "수학");
    expect(addBtn).toBeDisabled(); // 이름만 있고 요일 0개

    await user.click(screen.getByRole("button", { name: "월" }));
    expect(addBtn).toBeEnabled(); // 요일 1개 → 활성

    await user.click(screen.getByRole("button", { name: "월" })); // 해제 → 0개
    expect(addBtn).toBeDisabled();
  });

  it("[S2-3] 항목을 삭제하면 목록에서 사라진다", async () => {
    const state = emptyPlanState();
    state.plans.childA = [
      { id: "x", name: "테스트", dailyGoal: 5, weekdays: [1] },
    ];
    const user = userEvent.setup();
    renderPlan(state);
    await screen.findByText("테스트 5개 · 월");

    await user.click(screen.getByRole("button", { name: "테스트 삭제" }));

    await waitFor(() =>
      expect(screen.queryByText("테스트 5개 · 월")).toBeNull()
    );
  });

  it("[S2-4] 이미 계획이 있어도 항목을 추가할 수 있다", async () => {
    const state = emptyPlanState();
    state.plans.childA = [
      { id: "x", name: "기존", dailyGoal: 5, weekdays: [1] },
    ];
    const user = userEvent.setup();
    renderPlan(state);
    await screen.findByText("기존 5개 · 월");

    await user.type(screen.getByPlaceholderText("예: 수학 문제"), "새항목");
    await user.click(screen.getByRole("button", { name: "화" }));
    await user.click(screen.getByRole("button", { name: "추가" }));

    expect(await screen.findByText("새항목 0개 · 화")).toBeInTheDocument();
    expect(screen.getByText("기존 5개 · 월")).toBeInTheDocument(); // 기존 유지
  });

  it("[S13-1] 첫 진입 시 자녀A 시드 계획이 프리필된다", async () => {
    renderPlan(null); // 저장소 비어 있음 → seed

    expect(
      await screen.findByText("수학 문제 20개 · 월·수·금")
    ).toBeInTheDocument();
    expect(screen.getByText("영어 단어 30개 · 월·화·수·목·금")).toBeInTheDocument();
    expect(screen.getByText("독서 30개 · 화·목")).toBeInTheDocument();
  });
});
