import { describe, expect, it } from "vitest";
import { formatWon, parseWonInput } from "./format-currency";

describe("formatWon", () => {
  it("0원을 포맷한다", () => {
    expect(formatWon(0)).toBe("0원");
  });

  it("천단위 콤마를 붙인다", () => {
    expect(formatWon(1234567)).toBe("1,234,567원");
  });

  it("억 단위 금액도 콤마를 붙인다", () => {
    expect(formatWon(100_000_000)).toBe("100,000,000원");
  });
});

describe("parseWonInput", () => {
  it("빈 문자열은 0을 반환한다", () => {
    expect(parseWonInput("")).toBe(0);
  });

  it("콤마가 섞인 문자열에서 숫자만 추출한다", () => {
    expect(parseWonInput("1,234,567")).toBe(1234567);
  });

  it("숫자가 아닌 문자가 섞여도 숫자만 추출한다", () => {
    expect(parseWonInput("100만원")).toBe(100);
  });
});
