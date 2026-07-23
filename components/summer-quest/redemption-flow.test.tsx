import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GameState } from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { seedState } from "@/services/seed";
import { GameProvider } from "@/hooks/useGame";
import { ShopScreen } from "./shop-screen";
import { ParentScreen } from "./parent-screen";

function adapterWith(state: GameState): StorageAdapter {
  let value: GameState | null = state;
  return {
    load: () => value,
    save: (s) => {
      value = s;
    },
  };
}

function stateWithReward(coins: number): GameState {
  const s = seedState();
  s.rewards = [{ id: "r1", name: "치킨 먹기", price: 50 }];
  s.progress.childA.coins = coins;
  return s;
}

describe("길드 샵 — 보상 교환 (S10, S11, INV-4)", () => {
  it("[S10-1][S10-2][S10-3] 교환 시 코인 즉시 차감, 교환됨 표시, 부모 내역 반영", async () => {
    const user = userEvent.setup();
    render(
      <GameProvider adapter={adapterWith(stateWithReward(60))}>
        <ShopScreen profileId="childA" />
        <ParentScreen />
      </GameProvider>
    );
    await screen.findByText("보유 코인");
    expect(screen.getByText("60", { selector: "b" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "교환" }));

    expect(
      await screen.findByText("10", { selector: "b" })
    ).toBeInTheDocument(); // 60 - 50
    expect(screen.getByRole("button", { name: "교환됨" })).toBeDisabled();
    expect(
      await screen.findByText("자녀A · 치킨 먹기 · 50코인")
    ).toBeInTheDocument();
  });

  it("[S11-1][S11-2] 코인 부족 시 교환 버튼이 비활성이고 안내가 나타난다", async () => {
    render(
      <GameProvider adapter={adapterWith(stateWithReward(30))}>
        <ShopScreen profileId="childA" />
      </GameProvider>
    );

    expect(
      await screen.findByRole("button", { name: "교환" })
    ).toBeDisabled();
    expect(screen.getByText("코인이 부족해요")).toBeInTheDocument();
  });

  it("[INV-4] 잔액보다 비싼 보상은 비활성 버튼이라 차감이 일어나지 않는다", async () => {
    render(
      <GameProvider adapter={adapterWith(stateWithReward(30))}>
        <ShopScreen profileId="childA" />
      </GameProvider>
    );
    const button = await screen.findByRole("button", { name: "교환" });

    expect(button).toBeDisabled();
    expect(screen.getByText("30", { selector: "b" })).toBeInTheDocument();
  });
});
