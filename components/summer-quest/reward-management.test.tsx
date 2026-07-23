import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GameState } from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { seedState } from "@/services/seed";
import { GameProvider } from "@/hooks/useGame";
import { ParentScreen } from "./parent-screen";
import { ShopScreen } from "./shop-screen";

function adapterWith(state: GameState): StorageAdapter {
  let value: GameState | null = state;
  return {
    load: () => value,
    save: (s) => {
      value = s;
    },
  };
}

function emptyRewardsState(): GameState {
  const s = seedState();
  s.rewards = [];
  return s;
}

describe("길드 샵 — 부모 보상 등록 (S9)", () => {
  it("[S9-1] 이름·가격 입력 후 등록하면 목록에 나타난다", async () => {
    const user = userEvent.setup();
    render(
      <GameProvider adapter={adapterWith(emptyRewardsState())}>
        <ParentScreen />
      </GameProvider>
    );
    await screen.findByText("등록된 보상이 없어요.");

    await user.type(screen.getByPlaceholderText("예: 치킨 먹기"), "치킨 먹기");
    await user.type(screen.getByPlaceholderText("50"), "50");
    await user.click(screen.getByRole("button", { name: "등록" }));

    expect(await screen.findByText("치킨 먹기 · 50코인")).toBeInTheDocument();
  });

  it("[S9-2] 부모가 등록한 보상이 자녀 길드 샵 화면에도 나타난다", async () => {
    const user = userEvent.setup();
    render(
      <GameProvider adapter={adapterWith(emptyRewardsState())}>
        <ParentScreen />
        <ShopScreen profileId="childA" />
      </GameProvider>
    );
    // 부모·자녀 화면 양쪽에 같은 빈 상태 문구가 있으므로 개수로 확인한다
    expect(await screen.findAllByText("등록된 보상이 없어요.")).toHaveLength(2);

    await user.type(screen.getByPlaceholderText("예: 치킨 먹기"), "치킨 먹기");
    await user.type(screen.getByPlaceholderText("50"), "50");
    await user.click(screen.getByRole("button", { name: "등록" }));

    expect(await screen.findByText("치킨 먹기")).toBeInTheDocument(); // 샵 카드 제목
    expect(screen.getByText("50코인")).toBeInTheDocument(); // 샵 카드 가격
  });

  it("[S9-3] 보상을 삭제하면 목록에서 사라진다", async () => {
    const state = emptyRewardsState();
    state.rewards = [{ id: "r1", name: "테스트 보상", price: 10 }];
    const user = userEvent.setup();
    render(
      <GameProvider adapter={adapterWith(state)}>
        <ParentScreen />
      </GameProvider>
    );
    await screen.findByText("테스트 보상 · 10코인");

    await user.click(screen.getByRole("button", { name: "테스트 보상 삭제" }));

    expect(screen.queryByText("테스트 보상 · 10코인")).toBeNull();
  });

  it("[S13-2] 첫 진입 시 부모 길드 샵에 시드 보상이 프리필된다", async () => {
    render(
      <GameProvider adapter={adapterWith(seedState())}>
        <ParentScreen />
      </GameProvider>
    );

    expect(await screen.findByText("치킨 먹기 · 50코인")).toBeInTheDocument();
    expect(screen.getByText("게임 1시간 · 30코인")).toBeInTheDocument();
  });
});
