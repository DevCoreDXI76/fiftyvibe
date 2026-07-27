export type DbDcInput = {
  currentAnnualSalary: number;
  annualGrowthRate: number;
  remainingYears: number;
  dcReturnRate: number;
  peak?: {
    yearsBeforeRetirement: number;
    reductionRate: number;
  };
};

export type DbDcYearlyPoint = {
  year: number;
  dbValue: number;
  dcValue: number;
};

export type ConversionScenario = {
  year: number;
  total: number;
};

export type DbDcResult = {
  dbFull: number;
  dcFull: number;
  yearlyTrajectory: DbDcYearlyPoint[];
  breakEvenRate: number;
  peakAnalysis?: {
    scenarios: ConversionScenario[];
    optimalYear: number;
  };
};

// 임금피크제 미적용 시의 기본 연봉 궤적. 적용 시에는 피크 시작 직전 연봉을 기준으로
// 매년 복리로 축소되는 것으로 단순화한다(실제 제도의 계단식 감액을 근사).
function salaryAt(year: number, input: DbDcInput): number {
  const baseSalary =
    input.currentAnnualSalary * Math.pow(1 + input.annualGrowthRate, year - 1);

  if (!input.peak) {
    return baseSalary;
  }

  const peakStart =
    input.remainingYears - input.peak.yearsBeforeRetirement + 1;
  if (year < peakStart) {
    return baseSalary;
  }

  const peakBase =
    peakStart > 1
      ? input.currentAnnualSalary *
        Math.pow(1 + input.annualGrowthRate, peakStart - 2)
      : input.currentAnnualSalary;

  const yearsIntoPeak = year - peakStart + 1;
  return peakBase * Math.pow(1 - input.peak.reductionRate, yearsIntoPeak);
}

// y년차까지 근무 후 그 시점에 DB로 정산할 경우의 가치.
// "30일분 평균임금 × 총근속연수"를 근사(이 도구는 지금부터의 미래 적립분만 비교하므로
// 총근속연수=y로 둔다 — 과거 근속분은 전환 여부와 무관한 확정 DB 권리).
function dbValueAt(year: number, input: DbDcInput): number {
  if (year === 0) return 0;
  return (salaryAt(year, input) / 12) * year;
}

// y년차까지 DC로 납입해온 경우의 누적 잔액. 매년 말 salary(i)/12를 납입하고
// 잔여기간 동안 rate로 복리 성장한다고 가정(균등분할 아님 — 실제 그 해 임금 기준).
function dcValueAt(
  year: number,
  input: DbDcInput,
  rate: number = input.dcReturnRate,
): number {
  let total = 0;
  for (let i = 1; i <= year; i++) {
    total += (salaryAt(i, input) / 12) * Math.pow(1 + rate, year - i);
  }
  return total;
}

// dcValueAt(n, rate) === dbValueAt(n)이 되는 rate를 이분탐색으로 구한다.
// dcValueAt은 rate에 대해 단조증가(납입액이 모두 양수)이므로 이분탐색이 안전하다.
function calculateBreakEvenRate(input: DbDcInput): number {
  // n<=1이면 유일한 납입 항의 복리 지수가 0이 되어 DC_full이 rate와 무관해진다
  // (dcValueAt(1)은 항상 salary(1)/12 === dbValueAt(1)) — 손익분기가 정의되지 않는다.
  if (input.remainingYears <= 1) return NaN;

  const target = dbValueAt(input.remainingYears, input);
  let lo = -0.99;
  let hi = 2.0;

  for (let iter = 0; iter < 60; iter++) {
    const mid = (lo + hi) / 2;
    const dc = dcValueAt(input.remainingYears, input, mid);
    if (dc < target) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

// k년차까지 DB로 남았다가 그 시점 가치를 DC/IRP로 이전해 잔여기간 복리 성장시키고,
// k+1년차부터는 새로 DC를 납입한다고 가정할 때의 총액.
// k=0이면 dcFull과, k=remainingYears면 dbFull과 정확히 일치해야 한다(경계 항등식).
function totalAtConversionYear(k: number, input: DbDcInput): number {
  const dbPortion =
    dbValueAt(k, input) *
    Math.pow(1 + input.dcReturnRate, input.remainingYears - k);

  let dcPortion = 0;
  for (let i = k + 1; i <= input.remainingYears; i++) {
    dcPortion +=
      (salaryAt(i, input) / 12) *
      Math.pow(1 + input.dcReturnRate, input.remainingYears - i);
  }

  return dbPortion + dcPortion;
}

export function calculateDbDcCompare(input: DbDcInput): DbDcResult {
  const { remainingYears } = input;

  const yearlyTrajectory: DbDcYearlyPoint[] = [];
  for (let year = 1; year <= remainingYears; year++) {
    yearlyTrajectory.push({
      year,
      dbValue: Math.round(dbValueAt(year, input)),
      dcValue: Math.round(dcValueAt(year, input)),
    });
  }

  const dbFull = Math.round(dbValueAt(remainingYears, input));
  const dcFull = Math.round(dcValueAt(remainingYears, input));
  const breakEvenRate = calculateBreakEvenRate(input);

  let peakAnalysis: DbDcResult["peakAnalysis"];
  if (input.peak) {
    const scenarios: ConversionScenario[] = [];
    let optimalYear = 0;
    let bestTotal = -Infinity;

    // n이 최대 40 정도이므로 O(n²)로 즉시 계산 가능(성능 이슈 없음).
    for (let k = 0; k <= remainingYears; k++) {
      const total = Math.round(totalAtConversionYear(k, input));
      scenarios.push({ year: k, total });
      // 엄격히 더 큰 값일 때만 갱신 → 동점 시 더 작은 k(더 이른 전환)가 자동으로 우선됨
      if (total > bestTotal) {
        bestTotal = total;
        optimalYear = k;
      }
    }

    peakAnalysis = { scenarios, optimalYear };
  }

  return {
    dbFull,
    dcFull,
    yearlyTrajectory,
    breakEvenRate,
    peakAnalysis,
  };
}
