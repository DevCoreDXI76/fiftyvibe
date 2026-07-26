import { describe, expect, it } from "vitest";
import { calculateServiceYears } from "./service-years";

describe("calculateServiceYears", () => {
  it("정확히 n년 경과하면 올림 없이 n년", () => {
    expect(calculateServiceYears("2015-03-01", "2025-03-01")).toBe(10);
  });

  it("n년에서 하루라도 더 지나면 n+1년으로 올림", () => {
    expect(calculateServiceYears("2015-03-01", "2025-03-02")).toBe(11);
  });

  it("1년 미만 경과 시 1년으로 올림", () => {
    expect(calculateServiceYears("2024-01-01", "2024-06-15")).toBe(1);
  });

  it("입사일과 퇴사일이 같으면(0일 경과) 1년으로 올림", () => {
    expect(calculateServiceYears("2024-01-01", "2024-01-01")).toBe(1);
  });
});
