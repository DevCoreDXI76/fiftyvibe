import { TAX_TABLES } from "../tax-tables";
import { calculateSeveranceTax } from "./severance-tax";

export type PensionCompareInput = {
  severancePay: number;
  serviceYears: number;
  payoutYears: number;
};

export type YearlyPensionTax = {
  year: number;
  reductionRate: number;
  severanceTax: number;
  localIncomeTax: number;
};

export type PensionCompareResult = {
  lumpSum: {
    severanceTax: number;
    localIncomeTax: number;
    totalTax: number;
  };
  pension: {
    yearlyBreakdown: YearlyPensionTax[];
    totalSeveranceTax: number;
    totalLocalIncomeTax: number;
    totalTax: number;
  };
  savings: {
    amount: number;
    percentage: number;
  };
};

function floorWon(value: number): number {
  return Math.floor(value + 1e-6);
}

function reductionRateForYear(year: number): number {
  const table = TAX_TABLES[2026].deferredPensionTaxReduction;
  const bracket = table.find((b) => b.upToYear === null || year <= b.upToYear);
  if (!bracket) {
    throw new Error(`이연퇴직소득세 감면율 구간을 찾을 수 없습니다: ${year}`);
  }
  return bracket.rate;
}

export function calculatePensionCompare(
  input: PensionCompareInput,
): PensionCompareResult {
  const { severancePay, serviceYears, payoutYears } = input;

  const lumpSumResult = calculateSeveranceTax({ severancePay, serviceYears });
  const lumpSum = {
    severanceTax: lumpSumResult.severanceTax,
    localIncomeTax: lumpSumResult.localIncomeTax,
    totalTax: lumpSumResult.severanceTax + lumpSumResult.localIncomeTax,
  };

  // 균등분할 가정(SPEC.md §3): 원래 퇴직소득세를 수령기간으로 균등 안분한 뒤,
  // 연차별 감면율(1~10년차 70%, 11년차~ 60%)을 적용한다.
  const yearlySeveranceTaxShare = lumpSum.severanceTax / payoutYears;
  const localIncomeTaxRate = TAX_TABLES[2026].localIncomeTaxRate;

  const yearlyBreakdown: YearlyPensionTax[] = [];
  for (let year = 1; year <= payoutYears; year++) {
    const reductionRate = reductionRateForYear(year);
    const severanceTax = floorWon(yearlySeveranceTaxShare * reductionRate);
    const localIncomeTax = floorWon(severanceTax * localIncomeTaxRate);
    yearlyBreakdown.push({ year, reductionRate, severanceTax, localIncomeTax });
  }

  const totalSeveranceTax = yearlyBreakdown.reduce(
    (sum, y) => sum + y.severanceTax,
    0,
  );
  const totalLocalIncomeTax = yearlyBreakdown.reduce(
    (sum, y) => sum + y.localIncomeTax,
    0,
  );
  const totalTax = totalSeveranceTax + totalLocalIncomeTax;

  const savingsAmount = lumpSum.totalTax - totalTax;
  // severanceTax가 0원인 입력(과세표준이 0 이하)에서 0/0 = NaN을 방지한다.
  const savingsPercentage =
    lumpSum.totalTax === 0 ? 0 : (savingsAmount / lumpSum.totalTax) * 100;

  return {
    lumpSum,
    pension: {
      yearlyBreakdown,
      totalSeveranceTax,
      totalLocalIncomeTax,
      totalTax,
    },
    savings: { amount: savingsAmount, percentage: savingsPercentage },
  };
}
