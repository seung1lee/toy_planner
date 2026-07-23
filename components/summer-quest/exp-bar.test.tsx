import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpBar } from "./exp-bar";

describe("ExpBar — EXP 진행도 (S14-2)", () => {
  it("[S14-2] EXP 값에 따라 진행도바 채움 정도와 텍스트가 전환된다", () => {
    const { rerender } = render(<ExpBar exp={0} />);
    expect(screen.getByText("0 / 50")).toBeInTheDocument();
    const indicator = document.querySelector(
      '[data-slot="progress-indicator"]'
    ) as HTMLElement;
    expect(indicator.style.transform).toBe("translateX(-100%)"); // 0%

    rerender(<ExpBar exp={40} />);

    expect(screen.getByText("40 / 50")).toBeInTheDocument();
    expect(indicator.style.transform).toBe("translateX(-20%)"); // 80%
  });
});
