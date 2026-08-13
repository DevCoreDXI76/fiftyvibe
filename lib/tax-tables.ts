export const TAX_TABLES = {
  2026: {
    serviceYearDeduction: [
      { upTo: 5, fromYear: 0, base: 0, perYear: 1_000_000 },
      { upTo: 10, fromYear: 5, base: 5_000_000, perYear: 2_000_000 },
      { upTo: 20, fromYear: 10, base: 15_000_000, perYear: 2_500_000 },
      { upTo: null, fromYear: 20, base: 40_000_000, perYear: 3_000_000 },
    ],
    convertedSalaryDeduction: [
      { upTo: 8_000_000, over: 0, base: 0, rate: 1.0 },
      { upTo: 70_000_000, over: 8_000_000, base: 8_000_000, rate: 0.6 },
      { upTo: 100_000_000, over: 70_000_000, base: 45_200_000, rate: 0.55 },
      { upTo: 300_000_000, over: 100_000_000, base: 61_700_000, rate: 0.45 },
      { upTo: null, over: 300_000_000, base: 151_700_000, rate: 0.35 },
    ],
    basicTaxRate: [
      { upTo: 14_000_000, rate: 0.06, deduction: 0 },
      { upTo: 50_000_000, rate: 0.15, deduction: 1_260_000 },
      { upTo: 88_000_000, rate: 0.24, deduction: 5_760_000 },
      { upTo: 150_000_000, rate: 0.35, deduction: 15_440_000 },
      { upTo: 300_000_000, rate: 0.38, deduction: 19_940_000 },
      { upTo: 500_000_000, rate: 0.4, deduction: 25_940_000 },
      { upTo: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
      { upTo: null, rate: 0.45, deduction: 65_940_000 },
    ],
    localIncomeTaxRate: 0.1,
    deferredPensionTaxReduction: [
      { upToYear: 10, rate: 0.7 },
      { upToYear: null, rate: 0.6 },
    ],
    // 연금수령한도 산식(2026-08-13 재검증, 2개 독립 출처 일치): 연금수령연차가
    // yearThreshold(11) 미만이면 "연금계좌 평가액 ÷ (11 − 연금수령연차) × 120%"를
    // 한도로 하고, 11년 이상이면 전액을 한도로 본다.
    // 근거: 소득세법 시행령 제40조의2 제3항제3호(산식), 같은 조 제4항 본문(11년 이상 전액).
    pensionWithdrawalLimit: {
      yearThreshold: 11,
      multiplier: 1.2,
    },
  },
} as const;

export type TaxYear = keyof typeof TAX_TABLES;
