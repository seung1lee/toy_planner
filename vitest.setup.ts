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

// 테스트에서는 실제 네트워크 호출을 하지 않는다 (예: WeatherWidget의 Open-Meteo 호출).
// jsdom엔 navigator.geolocation이 없어 항상 fallback 좌표로 실제 fetch를 시도하게 되므로,
// 즉시 실패하는 stub으로 막는다. 개별 테스트가 필요하면 vi.spyOn(global, "fetch")로 재정의한다.
global.fetch = vi.fn().mockRejectedValue(new Error("fetch disabled in tests"));
