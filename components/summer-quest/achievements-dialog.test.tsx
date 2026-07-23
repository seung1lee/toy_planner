import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AchievementsDialog } from "./achievements-dialog";

describe("AchievementsDialog — 업적 목록 (S16-1)", () => {
  it("[S16-1] 잠금/해제 상태가 구분된 뱃지 목록이 표시된다", async () => {
    const user = userEvent.setup();
    render(<AchievementsDialog unlockedIds={["first-clear"]} />);

    await user.click(screen.getByRole("button", { name: "업적" }));

    expect(await screen.findByText("첫 클리어")).toBeInTheDocument();
    expect(screen.getAllByText("획득")).toHaveLength(1); // 해제된 업적 1개
    expect(screen.getAllByText("잠김")).toHaveLength(3); // 나머지 3개는 잠김
  });
});
