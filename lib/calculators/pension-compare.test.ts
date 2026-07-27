import { describe, expect, it } from "vitest";
import { calculatePensionCompare } from "./pension-compare";

describe("calculatePensionCompare", () => {
  it("모든 연차가 1~10년차 구간인 경우 (100,000,000원/11년, 10년 수령)", () => {
    const result = calculatePensionCompare({
      severancePay: 100_000_000,
      serviceYears: 11,
      payoutYears: 10,
    });

    // lumpSum: 도구 1의 홈택스 실측 대조 케이스 (a) 재사용값
    expect(result.lumpSum.severanceTax).toBe(3_492_500);
    expect(result.lumpSum.localIncomeTax).toBe(349_250);
    expect(result.lumpSum.totalTax).toBe(3_841_750);

    expect(result.pension.yearlyBreakdown).toHaveLength(10);
    expect(result.pension.yearlyBreakdown[0]).toEqual({
      year: 1,
      reductionRate: 0.7,
      severanceTax: 244_475,
      localIncomeTax: 24_447,
    });
    expect(result.pension.totalSeveranceTax).toBe(2_444_750);
    expect(result.pension.totalLocalIncomeTax).toBe(244_470);
    expect(result.pension.totalTax).toBe(2_689_220);

    expect(result.savings.amount).toBe(1_152_530);
    expect(result.savings.percentage).toBeCloseTo(30.00013, 4);
  });

  it("11년차 이상 구간이 섞이는 경우 (100,000,000원/11년, 15년 수령) — 감면율 경계 확인", () => {
    const result = calculatePensionCompare({
      severancePay: 100_000_000,
      serviceYears: 11,
      payoutYears: 15,
    });

    expect(result.pension.yearlyBreakdown).toHaveLength(15);
    expect(result.pension.yearlyBreakdown[9].reductionRate).toBe(0.7); // 10년차
    expect(result.pension.yearlyBreakdown[10].reductionRate).toBe(0.6); // 11년차
  });

  it("수령기간 1년 — 전액 1년차(70% 감면)만 적용되며 절세율은 정확히 30%", () => {
    const result = calculatePensionCompare({
      severancePay: 50_000_000,
      serviceYears: 6,
      payoutYears: 1,
    });

    // lumpSum: 도구 1의 홈택스 실측 대조 케이스 (c) 재사용값
    expect(result.lumpSum.totalTax).toBe(1_947_000);
    expect(result.pension.totalTax).toBe(1_362_900);
    expect(result.savings.amount).toBe(584_100);
    expect(result.savings.percentage).toBeCloseTo(30, 5);
  });

  it("퇴직소득세가 0원인 경우 0으로 나누지 않고 절세율도 0을 반환한다", () => {
    const result = calculatePensionCompare({
      severancePay: 5_000_000,
      serviceYears: 20,
      payoutYears: 10,
    });

    expect(result.lumpSum.totalTax).toBe(0);
    expect(result.pension.totalTax).toBe(0);
    expect(
      result.pension.yearlyBreakdown.every(
        (y) => y.severanceTax === 0 && y.localIncomeTax === 0,
      ),
    ).toBe(true);
    expect(result.savings.amount).toBe(0);
    expect(result.savings.percentage).toBe(0);
    expect(Number.isNaN(result.savings.percentage)).toBe(false);
  });
});
