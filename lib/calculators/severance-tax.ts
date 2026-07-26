import { TAX_TABLES } from "../tax-tables";

type SeveranceTaxInput = {
  severancePay: number;
  serviceYears: number;
};

type SeveranceTaxResult = {
  serviceYearDeduction: number;
  convertedSalary: number;
  convertedSalaryDeduction: number;
  taxBase: number;
  convertedTax: number;
  severanceTax: number;
  localIncomeTax: number;
  netAmount: number;
};

// 부동소수점 연산 오차(예: 0.15 곱셈)로 정수 결과가 미세하게 어긋나는 것을 방지
function roundWon(value: number): number {
  return Math.round(value);
}

// 6·7단계(퇴직소득세·지방소득세)의 "원단위 절사" 규칙 — 부동소수점 오차 보정 포함
function floorWon(value: number): number {
  return Math.floor(value + 1e-6);
}

function calculateServiceYearDeduction(serviceYears: number): number {
  const table = TAX_TABLES[2026].serviceYearDeduction;
  const bracket = table.find((b) => b.upTo === null || serviceYears <= b.upTo);
  if (!bracket) {
    throw new Error(`근속연수공제 구간을 찾을 수 없습니다: ${serviceYears}`);
  }
  return bracket.base + bracket.perYear * (serviceYears - bracket.fromYear);
}

function calculateConvertedSalaryDeduction(convertedSalary: number): number {
  const table = TAX_TABLES[2026].convertedSalaryDeduction;
  const bracket = table.find(
    (b) => b.upTo === null || convertedSalary <= b.upTo,
  );
  if (!bracket) {
    throw new Error(`환산급여공제 구간을 찾을 수 없습니다: ${convertedSalary}`);
  }
  return roundWon(
    bracket.base + (convertedSalary - bracket.over) * bracket.rate,
  );
}

function calculateConvertedTax(taxBase: number): number {
  const table = TAX_TABLES[2026].basicTaxRate;
  const bracket = table.find((b) => b.upTo === null || taxBase <= b.upTo);
  if (!bracket) {
    throw new Error(`기본세율 구간을 찾을 수 없습니다: ${taxBase}`);
  }
  return roundWon(taxBase * bracket.rate - bracket.deduction);
}

export function calculateSeveranceTax(
  input: SeveranceTaxInput,
): SeveranceTaxResult {
  const { severancePay, serviceYears } = input;

  const serviceYearDeduction = calculateServiceYearDeduction(serviceYears);
  const convertedSalary = roundWon(
    ((severancePay - serviceYearDeduction) / serviceYears) * 12,
  );
  const convertedSalaryDeduction =
    calculateConvertedSalaryDeduction(convertedSalary);
  const taxBase = convertedSalary - convertedSalaryDeduction;
  const convertedTax = calculateConvertedTax(taxBase);
  const severanceTax = floorWon((convertedTax / 12) * serviceYears);
  const localIncomeTax = floorWon(severanceTax * 0.1);
  const netAmount = severancePay - severanceTax - localIncomeTax;

  return {
    serviceYearDeduction,
    convertedSalary,
    convertedSalaryDeduction,
    taxBase,
    convertedTax,
    severanceTax,
    localIncomeTax,
    netAmount,
  };
}
