import { describe, expect, it } from "vitest";
import { calculateServiceYears } from "./service-years";

describe("calculateServiceYears", () => {
  it("정확히 n년째 되는 날 퇴사하면 n+1년으로 처리한다 (홈택스 실측 확인)", () => {
    expect(calculateServiceYears("2015-03-01", "2025-03-01")).toBe(11);
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

  describe("홈택스 공식 예제표 (2024년 귀속 퇴직소득 지급명세서 모의계산 페이지 게재)", () => {
    it("1994-04-15 ~ 1998-04-14 (4년 하루 전) → 4년", () => {
      expect(calculateServiceYears("1994-04-15", "1998-04-14")).toBe(4);
    });

    it("1994-04-15 ~ 1998-04-15 (정확히 4년째 되는 날) → 5년", () => {
      expect(calculateServiceYears("1994-04-15", "1998-04-15")).toBe(5);
    });

    it("2016-01-31 ~ 2017-01-30 (1년 하루 전) → 1년", () => {
      expect(calculateServiceYears("2016-01-31", "2017-01-30")).toBe(1);
    });

    it("2016-01-31 ~ 2017-01-31 (정확히 1년째 되는 날) → 2년", () => {
      expect(calculateServiceYears("2016-01-31", "2017-01-31")).toBe(2);
    });

    it("2015-02-28 ~ 2016-02-27 (1년 하루 전) → 1년", () => {
      expect(calculateServiceYears("2015-02-28", "2016-02-27")).toBe(1);
    });

    it("2015-02-28 ~ 2016-02-28 (정확히 1년째 되는 날) → 2년", () => {
      expect(calculateServiceYears("2015-02-28", "2016-02-28")).toBe(2);
    });

  });

  describe("윤년(2/29) 입사 경계값 — 민법 제160조제3항 근거 (홈택스 직접 확인은 아님)", () => {
    it("2016-02-29 ~ 2017-02-28 (2/29의 1주년은 평년에서 2/28로 만료 — 정확히 그날 퇴사하면 2년)", () => {
      expect(calculateServiceYears("2016-02-29", "2017-02-28")).toBe(2);
    });

    it("2016-02-29 ~ 2017-02-27 (만료 하루 전) → 1년", () => {
      expect(calculateServiceYears("2016-02-29", "2017-02-27")).toBe(1);
    });
  });
});
