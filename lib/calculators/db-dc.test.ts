import { describe, expect, it } from "vitest";
import { calculateDbDcCompare } from "./db-dc";

describe("calculateDbDcCompare", () => {
  it("케이스 A: 상승률 0%, 피크 없음 — 손계산값과 정확히 일치", () => {
    const result = calculateDbDcCompare({
      currentAnnualSalary: 120_000_000,
      annualGrowthRate: 0,
      remainingYears: 4,
      dcReturnRate: 0.05,
    });

    expect(result.dbFull).toBe(40_000_000);
    expect(result.dcFull).toBe(43_101_250);
    expect(result.yearlyTrajectory).toEqual([
      { year: 1, dbValue: 10_000_000, dcValue: 10_000_000 },
      { year: 2, dbValue: 20_000_000, dcValue: 20_500_000 },
      { year: 3, dbValue: 30_000_000, dcValue: 31_525_000 },
      { year: 4, dbValue: 40_000_000, dcValue: 43_101_250 },
    ]);
    expect(result.breakEvenRate).toBe(0);
    expect(result.peakAnalysis).toBeUndefined();
  });

  it("케이스 B: 상승률 0%, 임금피크제 적용 — 전체 탐색 손계산값과 정확히 일치", () => {
    const result = calculateDbDcCompare({
      currentAnnualSalary: 120_000_000,
      annualGrowthRate: 0,
      remainingYears: 5,
      dcReturnRate: 0.03,
      peak: { yearsBeforeRetirement: 2, reductionRate: 0.2 },
    });

    expect(result.dbFull).toBe(32_000_000);
    expect(result.dcFull).toBe(47_431_358);

    expect(result.peakAnalysis).toBeDefined();
    const scenarios = result.peakAnalysis!.scenarios;
    expect(scenarios).toHaveLength(6); // year 0..5
    expect(scenarios[0]).toEqual({ year: 0, total: 47_431_358 }); // === dcFull
    expect(scenarios[1]).toEqual({ year: 1, total: 47_431_358 }); // 항등식: dbValueAt(1) === 1년차 DC 납입액
    expect(scenarios[2]).toEqual({ year: 2, total: 47_103_540 });
    expect(scenarios[3]).toEqual({ year: 3, total: 46_467_000 });
    expect(scenarios[4]).toEqual({ year: 4, total: 39_360_000 });
    expect(scenarios[5]).toEqual({ year: 5, total: 32_000_000 }); // === dbFull

    expect(result.peakAnalysis!.optimalYear).toBe(0);
  });

  it("잔여 근속연수가 1년이면 손익분기 수익률은 NaN — DC_full이 수익률에 의존하지 않는 특수 케이스", () => {
    const result = calculateDbDcCompare({
      currentAnnualSalary: 60_000_000,
      annualGrowthRate: 0.05,
      remainingYears: 1,
      dcReturnRate: 0.04,
    });

    expect(result.dbFull).toBe(result.dcFull);
    expect(Number.isNaN(result.breakEvenRate)).toBe(true);
  });

  it("피크가 잔여기간 전체를 덮을 때(peakStart===1) 임금상승률 없이 순수 기하감소로 계산된다", () => {
    // peak.yearsBeforeRetirement === remainingYears → peakStart = n - n + 1 = 1
    // 이 경우 salaryAt의 peakBase는 growth를 적용하지 않은 currentAnnualSalary 그대로 사용된다.
    const result = calculateDbDcCompare({
      currentAnnualSalary: 120_000_000,
      annualGrowthRate: 0.05,
      remainingYears: 3,
      dcReturnRate: 0.04,
      peak: { yearsBeforeRetirement: 3, reductionRate: 0.2 },
    });

    // salary(1)=120M*0.8=96M, salary(2)=120M*0.8^2=76.8M, salary(3)=120M*0.8^3=61.44M
    // (annualGrowthRate=5%는 전혀 반영되지 않음 — 순수 기하감소)
    expect(result.yearlyTrajectory).toEqual([
      { year: 1, dbValue: 8_000_000, dcValue: 8_000_000 },
      { year: 2, dbValue: 12_800_000, dcValue: 14_720_000 },
      { year: 3, dbValue: 15_360_000, dcValue: 20_428_800 },
    ]);
    expect(result.dbFull).toBe(15_360_000);
    expect(result.dcFull).toBe(20_428_800);
  });

  it("peak을 지정하지 않으면 peakAnalysis는 undefined다", () => {
    const result = calculateDbDcCompare({
      currentAnnualSalary: 80_000_000,
      annualGrowthRate: 0.03,
      remainingYears: 10,
      dcReturnRate: 0.04,
    });

    expect(result.peakAnalysis).toBeUndefined();
  });

  it("피크 없을 때 손익분기 수익률은 항상 연 임금상승률과 정확히 같다 (닫힌 형태 항등식)", () => {
    const cases = [
      { annualGrowthRate: -0.1, remainingYears: 2 },
      { annualGrowthRate: 0, remainingYears: 10 },
      { annualGrowthRate: 0.03, remainingYears: 10 },
      { annualGrowthRate: 0.3, remainingYears: 40 },
    ];

    for (const { annualGrowthRate, remainingYears } of cases) {
      const result = calculateDbDcCompare({
        currentAnnualSalary: 80_000_000,
        annualGrowthRate,
        remainingYears,
        dcReturnRate: 0.04, // arbitrary — breakEvenRate doesn't depend on this input
      });
      expect(result.breakEvenRate).toBeCloseTo(annualGrowthRate, 6);
    }
  });
});
