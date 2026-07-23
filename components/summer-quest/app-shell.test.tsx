import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GameState } from "@/types/game";
import type { StorageAdapter } from "@/types/storage";
import { seedState } from "@/services/seed";
import { GameProvider } from "@/hooks/useGame";
import { AppShell } from "./app-shell";

function adapterWith(state: GameState | null): StorageAdapter {
  let value = state;
  return { load: () => value, save: (s) => { value = s; } };
}

function renderShell(adapter: StorageAdapter) {
  return render(
    <GameProvider adapter={adapter}>
      <AppShell />
    </GameProvider>
  );
}

describe("AppShell — 프로필 전환 + 저장소 seam", () => {
  it("[S1-1] 자녀B 선택 시 자녀B 진행 컨텍스트로 전환된다", async () => {
    const state = seedState();
    state.progress.childA.exp = 30;
    state.progress.childB.exp = 0;
    const user = userEvent.setup();
    renderShell(adapterWith(state));

    await screen.findByText("EXP 30"); // 기본 자녀A
    await user.click(screen.getByRole("radio", { name: "자녀B" }));

    // 자녀B의 값(EXP 0)이 나타나고 자녀A의 값(EXP 30)은 사라진다
    expect(await screen.findByText("EXP 0")).toBeInTheDocument();
    expect(screen.queryByText("EXP 30")).toBeNull();
  });

  it("[S1-2] 부모 선택 시 길드 샵 관리(역할) 컨텍스트로 라우팅된다", async () => {
    const user = userEvent.setup();
    renderShell(adapterWith(seedState()));

    await user.click(screen.getByRole("radio", { name: "부모" }));

    expect(
      await screen.findByText("부모 · 길드 샵 관리")
    ).toBeInTheDocument();
  });

  it("[S1-3] 부모 진입에 PIN·로그인 게이트가 없다", async () => {
    const user = userEvent.setup();
    renderShell(adapterWith(seedState()));

    await user.click(screen.getByRole("radio", { name: "부모" }));

    // 관리 화면이 즉시 나타나고, 인증 입력이 존재하지 않는다
    expect(await screen.findByText("부모 · 길드 샵 관리")).toBeInTheDocument();
    expect(screen.queryByLabelText(/PIN|비밀번호|password/i)).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("[S13-3] 첫 진입 진행 지표는 EXP 0 · 코인 0 · Lv1", async () => {
    renderShell(adapterWith(null)); // 저장소 비어 있음 → seed

    expect(await screen.findByText("EXP 0")).toBeInTheDocument();
    expect(screen.getByText("코인 0")).toBeInTheDocument();
    expect(screen.getByText("Lv1")).toBeInTheDocument();
  });

  it("[INV-2] 한 자녀의 진행이 다른 자녀 컨텍스트에 노출되지 않는다", async () => {
    const state = seedState();
    state.progress.childA.exp = 30;
    state.progress.childB.exp = 0;
    const user = userEvent.setup();
    renderShell(adapterWith(state));

    await screen.findByText("EXP 30");
    await user.click(screen.getByRole("radio", { name: "자녀B" }));

    await screen.findByText("EXP 0");
    expect(screen.queryByText("EXP 30")).toBeNull(); // A의 값이 B 화면에 없음
  });

  it("[INV-3] 저장된 상태가 새 마운트에서 복원된다 (load/save 왕복)", async () => {
    const adapter = adapterWith(null);

    // 1) 최초 마운트 → seed가 저장된다 (save 경로)
    const first = renderShell(adapter);
    await screen.findByText("EXP 0");
    await waitFor(() => expect(adapter.load()).not.toBeNull());
    first.unmount();

    // 2) 저장소에 지속된 값을 변형 → 새 마운트가 그 값을 로드한다 (load 경로)
    const persisted = adapter.load() as GameState;
    persisted.progress.childA.exp = 77;
    adapter.save(persisted);

    renderShell(adapter);
    expect(await screen.findByText("EXP 77")).toBeInTheDocument();
  });
});
