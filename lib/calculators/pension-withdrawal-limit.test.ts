import { describe, expect, it } from "vitest";
import { calculatePensionWithdrawalLimit } from "./pension-withdrawal-limit";

describe("calculatePensionWithdrawalLimit", () => {
  it("1년차: 계좌평가액 1억원 → 1억/10*120% = 1,200만원", () => {
    const result = calculatePensionWithdrawalLimit({
      accountValue: 100_000_000,
      withdrawalYear: 1,
    });
    expect(result.limit).toBe(12_000_000);
    expect(result.isUnlimited).toBe(false);
  });

  it("5년차: 계좌평가액 1억원 → 1억/6*120% = 2,000만원", () => {
    const result = calculatePensionWithdrawalLimit({
      accountValue: 100_000_000,
      withdrawalYear: 5,
    });
    expect(result.limit).toBe(20_000_000);
    expect(result.isUnlimited).toBe(false);
  });

  it("나누어떨어지지 않는 경우(2년차) 원단위 절사", () => {
    const result = calculatePensionWithdrawalLimit({
      accountValue: 100_000_000,
      withdrawalYear: 2,
    });
    // 1억 / 9 * 1.2 = 13,333,333.333... → 절사
    expect(result.limit).toBe(13_333_333);
    expect(result.isUnlimited).toBe(false);
  });

  it("10년차(경계 직전): 계좌평가액 1억원 → 1억/1*120% = 1억2천만원", () => {
    const result = calculatePensionWithdrawalLimit({
      accountValue: 100_000_000,
      withdrawalYear: 10,
    });
    expect(result.limit).toBe(120_000_000);
    expect(result.isUnlimited).toBe(false);
  });

  it("11년차(경계): 한도 없음, 전액이 한도", () => {
    const result = calculatePensionWithdrawalLimit({
      accountValue: 100_000_000,
      withdrawalYear: 11,
    });
    expect(result.limit).toBe(100_000_000);
    expect(result.isUnlimited).toBe(true);
  });

  it("15년차(11년 초과): 한도 없음", () => {
    const result = calculatePensionWithdrawalLimit({
      accountValue: 300_000_000,
      withdrawalYear: 15,
    });
    expect(result.limit).toBe(300_000_000);
    expect(result.isUnlimited).toBe(true);
  });

  it("연금수령연차가 1 미만이면 에러", () => {
    expect(() =>
      calculatePensionWithdrawalLimit({
        accountValue: 100_000_000,
        withdrawalYear: 0,
      }),
    ).toThrow();
  });
});
