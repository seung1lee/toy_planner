import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom에는 matchMedia가 없다. next-themes·sonner가 마운트 시 호출하므로 stub이 필요하다.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
