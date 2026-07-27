import { describe, expect, it } from "vitest";
import { calculateSeveranceTax } from "./severance-tax";

describe("calculateSeveranceTax", () => {
  describe("SPEC 검증 케이스 (⚠️ 홈택스 미대조 — SPEC 공식 손계산값)", () => {
    it("(a) 퇴직급여 1억원, 근속 10년", () => {
      const result = calculateSeveranceTax({
        severancePay: 100_000_000,
        serviceYears: 10,
      });
      expect(result.serviceYearDeduction).toBe(15_000_000);
      expect(result.convertedSalary).toBe(102_000_000);
      expect(result.convertedSalaryDeduction).toBe(62_600_000);
      expect(result.taxBase).toBe(39_400_000);
      expect(result.convertedTax).toBe(4_650_000);
      expect(result.severanceTax).toBe(3_875_000);
      expect(result.localIncomeTax).toBe(387_500);
      expect(result.netAmount).toBe(95_737_500);
    });

    it("(b) 퇴직급여 2억원, 근속 20년", () => {
      const result = calculateSeveranceTax({
        severancePay: 200_000_000,
        serviceYears: 20,
      });
      expect(result.serviceYearDeduction).toBe(40_000_000);
      expect(result.convertedSalary).toBe(96_000_000);
      expect(result.convertedSalaryDeduction).toBe(59_500_000);
      expect(result.taxBase).toBe(36_500_000);
      expect(result.convertedTax).toBe(4_215_000);
      expect(result.severanceTax).toBe(7_025_000);
      expect(result.localIncomeTax).toBe(702_500);
      expect(result.netAmount).toBe(192_272_500);
    });

    it("(c) 퇴직급여 5,000만원, 근속 5년", () => {
      const result = calculateSeveranceTax({
        severancePay: 50_000_000,
        serviceYears: 5,
      });
      expect(result.serviceYearDeduction).toBe(5_000_000);
      expect(result.convertedSalary).toBe(108_000_000);
      expect(result.convertedSalaryDeduction).toBe(65_300_000);
      expect(result.taxBase).toBe(42_700_000);
      expect(result.convertedTax).toBe(5_145_000);
      expect(result.severanceTax).toBe(2_143_750);
      expect(result.localIncomeTax).toBe(214_375);
      expect(result.netAmount).toBe(47_641_880);
    });
  });

  describe("경계값 — 근속연수공제 구간 전환", () => {
    it("근속 1년 (최소값, 환산급여공제 최상위 구간·기본세율 4번째 구간 통과)", () => {
      const result = calculateSeveranceTax({
        severancePay: 30_000_000,
        serviceYears: 1,
      });
      expect(result.severanceTax).toBe(4_022_500);
      expect(result.localIncomeTax).toBe(402_250);
      expect(result.netAmount).toBe(25_575_250);
    });

    it("근속 5년 (≤5년 구간)", () => {
      const result = calculateSeveranceTax({
        severancePay: 30_000_000,
        serviceYears: 5,
      });
      expect(result.severanceTax).toBe(775_000);
      expect(result.localIncomeTax).toBe(77_500);
      expect(result.netAmount).toBe(29_147_500);
    });

    it("근속 6년 (6~10년 구간 진입)", () => {
      const result = calculateSeveranceTax({
        severancePay: 30_000_000,
        serviceYears: 6,
      });
      expect(result.severanceTax).toBe(510_000);
      expect(result.localIncomeTax).toBe(51_000);
      expect(result.netAmount).toBe(29_439_000);
    });

    it("근속 10년 (6~10년 구간 마지막)", () => {
      const result = calculateSeveranceTax({
        severancePay: 28_500_000,
        serviceYears: 10,
      });
      expect(result.severanceTax).toBe(164_000);
      expect(result.localIncomeTax).toBe(16_400);
      expect(result.netAmount).toBe(28_319_600);
    });

    it("근속 11년 (11~20년 구간 진입)", () => {
      const result = calculateSeveranceTax({
        severancePay: 28_500_000,
        serviceYears: 11,
      });
      expect(result.severanceTax).toBe(88_000);
      expect(result.localIncomeTax).toBe(8_800);
      expect(result.netAmount).toBe(28_403_200);
    });

    it("근속 20년 (11~20년 구간 마지막)", () => {
      const result = calculateSeveranceTax({
        severancePay: 100_000_000,
        serviceYears: 20,
      });
      expect(result.severanceTax).toBe(1_120_000);
      expect(result.localIncomeTax).toBe(112_000);
      expect(result.netAmount).toBe(98_768_000);
    });

    it("근속 21년 (20년 초과 구간 진입)", () => {
      const result = calculateSeveranceTax({
        severancePay: 64_000_000,
        serviceYears: 21,
      });
      expect(result.severanceTax).toBe(168_000);
      expect(result.localIncomeTax).toBe(16_800);
      expect(result.netAmount).toBe(63_815_200);
    });
  });

  describe("근속연수 직접 입력 정규화 (근속연수 1년 미만은 1년으로 처리)", () => {
    it("근속연수 0은 1년으로 취급한다", () => {
      const zeroYears = calculateSeveranceTax({
        severancePay: 30_000_000,
        serviceYears: 0,
      });
      const oneYear = calculateSeveranceTax({
        severancePay: 30_000_000,
        serviceYears: 1,
      });
      expect(zeroYears).toEqual(oneYear);
    });

    it("소수점 근속연수는 올림 처리한다", () => {
      const fractional = calculateSeveranceTax({
        severancePay: 30_000_000,
        serviceYears: 5.5,
      });
      const roundedUp = calculateSeveranceTax({
        severancePay: 30_000_000,
        serviceYears: 6,
      });
      expect(fractional).toEqual(roundedUp);
    });
  });
});
