import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GameState } from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { seedState } from "@/services/seed";
import { GameProvider } from "@/hooks/useGame";
import { Toaster } from "@/components/ui/sonner";
import { toISODate } from "@/lib/game/today-quests";
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

/**
 * 항목 2개(월요일) — 하나만 완료해도 "오늘 전체완료"가 되지 않도록 해 S15 전체완료
 * 보너스가 끼어들지 않게 한다. S4/S5(개별 완료·해제) 단위 검증을 S15와 분리하기 위함.
 */
function stateWithTwoMondayItems(): GameState {
  const s = seedState();
  s.plans.childA = [
    { id: "math", name: "수학 문제", dailyGoal: 20, weekdays: [1] },
    { id: "eng", name: "영어 단어", dailyGoal: 30, weekdays: [1] },
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
    renderHome(MON, stateWithTwoMondayItems());
    await screen.findByText("EXP 0");

    await user.click(screen.getByRole("checkbox", { name: "수학 문제 완료" }));

    expect(await screen.findByText("EXP 10")).toBeInTheDocument();
    expect(screen.getByText("코인 5")).toBeInTheDocument();
  });

  it("[S5-2][S5-3] 완료 해제 시 EXP·코인이 회수되어 0이 된다", async () => {
    const user = userEvent.setup();
    renderHome(MON, stateWithTwoMondayItems());
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

    expect(screen.getByText("연속 0일")).toBeInTheDocument();

    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }

    expect(await screen.findByText("연속 1일")).toBeInTheDocument();
  });
});

describe("HomeScreen — 완료 연출 juice (S14)", () => {
  it("[S14-1] 완료 시 획득량 팝업이 나타난다", async () => {
    const state = stateWithMathPlan();
    const profile = state.profiles.find((p) => p.id === "childA")!;
    const user = userEvent.setup();
    render(
      <GameProvider adapter={adapterWith(state)} today={MON}>
        <Toaster />
        <HomeScreen profile={profile} />
      </GameProvider>
    );

    // 완료 전: 퀘스트 항목의 보상 미리보기 배지 1개뿐
    expect(screen.getAllByText("+10 EXP · +5코인")).toHaveLength(1);

    await user.click(
      await screen.findByRole("checkbox", { name: "수학 문제 완료" })
    );

    // 완료 후: 팝업이 추가로 나타나 동일 문구가 2개가 된다
    expect(await screen.findAllByText("+10 EXP · +5코인")).toHaveLength(2);
  });

  it("[S14-3] 완료 순간 아바타에 반응 연출 상태가 부여된다", async () => {
    const state = stateWithMathPlan();
    const profile = state.profiles.find((p) => p.id === "childA")!;
    const user = userEvent.setup();
    render(
      <GameProvider adapter={adapterWith(state)} today={MON}>
        <HomeScreen profile={profile} />
      </GameProvider>
    );
    await screen.findByText("EXP 0");

    expect(document.querySelector('[data-reacting="true"]')).toBeNull();

    await user.click(
      await screen.findByRole("checkbox", { name: "수학 문제 완료" })
    );

    await waitFor(() =>
      expect(
        document.querySelector('[data-reacting="true"]')
      ).not.toBeNull()
    );
  });
});

describe("HomeScreen — 진행 게이지 + 전체완료 보너스·컨페티 (S15)", () => {
  it("[S15-1] 완료 개수에 따라 진행 게이지가 '완료 수 / 전체 수'로 표시된다", async () => {
    const user = userEvent.setup();
    renderHome(MON, stateWithFiveMondayItems());
    const checkboxes = await screen.findAllByRole("checkbox");
    expect(screen.getByText("0 / 5")).toBeInTheDocument();

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    expect(await screen.findByText("2 / 5")).toBeInTheDocument();
  });

  it("[S15-2][S15-3][S15-4] 마지막 완료 시 게이지 만석, 보너스 지급, 컨페티가 나타난다", async () => {
    const user = userEvent.setup();
    renderHome(MON, stateWithFiveMondayItems());
    const checkboxes = await screen.findAllByRole("checkbox");

    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }

    expect(await screen.findByText("5 / 5")).toBeInTheDocument(); // S15-2
    // 완료당 코인 5 × 5개 + 전체완료 보너스 10 = 35
    expect(await screen.findByText("코인 35")).toBeInTheDocument(); // S15-3
    expect(screen.getByTestId("confetti")).toBeInTheDocument(); // S15-4
  });
});

describe("HomeScreen — 업적 (S16)", () => {
  it("[S16-2][S16-3] 첫 완료 시 '첫 클리어' 업적이 해제되고 알림이 나타난다", async () => {
    const state = stateWithMathPlan();
    const profile = state.profiles.find((p) => p.id === "childA")!;
    const user = userEvent.setup();
    render(
      <GameProvider adapter={adapterWith(state)} today={MON}>
        <Toaster />
        <HomeScreen profile={profile} />
      </GameProvider>
    );

    await user.click(
      await screen.findByRole("checkbox", { name: "수학 문제 완료" })
    );

    expect(
      await screen.findByText('새 업적 획득: "첫 클리어"!')
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "업적" }));
    expect(await screen.findByText("첫 클리어")).toBeInTheDocument();
    expect(screen.getAllByText("획득").length).toBeGreaterThan(0);
  });
});

describe("HomeScreen — streak 마일스톤 보상 (S17)", () => {
  it("[S17-1][S17-2][S17-3] streak가 3일에 도달하면 보너스·알림·다음 마일스톤이 표시된다", async () => {
    // 월·화 이미 완료된 상태에서, 수요일에 마지막 완료를 해 streak 3일을 완성한다.
    const MONDAY = new Date(2024, 0, 1);
    const TUESDAY = new Date(2024, 0, 2);
    const WEDNESDAY = new Date(2024, 0, 3);

    const state = seedState();
    state.plans.childA = [
      { id: "math", name: "수학 문제", dailyGoal: 20, weekdays: [1, 2, 3, 4, 5] },
    ];
    state.completions.childA = [
      { profileId: "childA", planItemId: "math", dateISO: toISODate(MONDAY) },
      { profileId: "childA", planItemId: "math", dateISO: toISODate(TUESDAY) },
    ];
    state.progress.childA.exp = 0;
    state.progress.childA.coins = 0;

    const profile = state.profiles.find((p) => p.id === "childA")!;
    const user = userEvent.setup();
    render(
      <GameProvider adapter={adapterWith(state)} today={WEDNESDAY}>
        <HomeScreen profile={profile} />
      </GameProvider>
    );

    await user.click(
      await screen.findByRole("checkbox", { name: "수학 문제 완료" })
    );

    expect(await screen.findByText("3일 연속 달성! 🔥")).toBeInTheDocument(); // S17-2
    expect(
      screen.getByText("다음 마일스톤(7일)까지 4일 남았어요")
    ).toBeInTheDocument(); // S17-3
    // 완료 코인(5) + 오늘 전체완료 보너스(10, 유일한 항목이라 동시 발생) + 마일스톤 보너스(15) = 30
    expect(await screen.findByText("코인 30")).toBeInTheDocument(); // S17-1
  });
});
