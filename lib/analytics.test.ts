import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "./analytics";

describe("trackEvent", () => {
  afterEach(() => {
    globalThis.gtag = undefined;
  });

  it("전역 gtag가 있으면 event 이름과 params로 호출한다", () => {
    const gtag = vi.fn();
    globalThis.gtag = gtag;

    trackEvent("calculate_click", { tool: "severance-tax" });

    expect(gtag).toHaveBeenCalledWith("event", "calculate_click", {
      tool: "severance-tax",
    });
  });

  it("전역 gtag가 없으면 예외 없이 아무 일도 하지 않는다", () => {
    expect(() => trackEvent("calculate_click")).not.toThrow();
  });

  it("params를 생략하면 빈 객체로 호출한다", () => {
    const gtag = vi.fn();
    globalThis.gtag = gtag;

    trackEvent("guide_to_tool");

    expect(gtag).toHaveBeenCalledWith("event", "guide_to_tool", {});
  });
});
