"use client";

import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";
import { calculateDbDcCompare } from "@/lib/calculators/db-dc";
import { formatWon, parseWonInput } from "@/lib/format-currency";
import { trackEvent } from "@/lib/analytics";
import { Disclaimer } from "@/components/disclaimer";
import { AdSlot } from "@/components/ad-slot";

const DbDcChart = dynamic(
  () => import("./db-dc-chart").then((mod) => mod.DbDcChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded bg-steel/10" />
    ),
  },
);

type DbDcOutput = ReturnType<typeof calculateDbDcCompare>;

type CalculationState = {
  output: DbDcOutput;
};

const MIN_REMAINING_YEARS = 1;
const MAX_REMAINING_YEARS = 40;
const MIN_RATE_PERCENT = -10;
const MAX_RATE_PERCENT = 30;
const MIN_PEAK_REDUCTION_PERCENT = 1;
const MAX_PEAK_REDUCTION_PERCENT = 50;

export function DbDcCalculator() {
  const [salaryInput, setSalaryInput] = useState("");
  const [growthRateInput, setGrowthRateInput] = useState("");
  const [remainingYearsInput, setRemainingYearsInput] = useState("");
  const [dcReturnRateInput, setDcReturnRateInput] = useState("");
  const [peakEnabled, setPeakEnabled] = useState(false);
  const [peakYearsInput, setPeakYearsInput] = useState("");
  const [peakReductionInput, setPeakReductionInput] = useState("");
  const [error, setError] = useState("");
  const [calculation, setCalculation] = useState<CalculationState | null>(
    null,
  );
  const [accordionOpen, setAccordionOpen] = useState(false);

  const resetCalculation = () => setCalculation(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const currentAnnualSalary = parseWonInput(salaryInput);
    if (currentAnnualSalary <= 0) {
      setError("현재 연봉을 입력해주세요.");
      setCalculation(null);
      return;
    }

    const annualGrowthRate = Number(growthRateInput);
    if (
      !growthRateInput ||
      Number.isNaN(annualGrowthRate) ||
      annualGrowthRate < MIN_RATE_PERCENT ||
      annualGrowthRate > MAX_RATE_PERCENT
    ) {
      setError(
        `연 임금상승률은 ${MIN_RATE_PERCENT}~${MAX_RATE_PERCENT}% 사이로 입력해주세요.`,
      );
      setCalculation(null);
      return;
    }

    const remainingYears = Number(remainingYearsInput);
    if (
      !remainingYearsInput ||
      Number.isNaN(remainingYears) ||
      remainingYears < MIN_REMAINING_YEARS ||
      remainingYears > MAX_REMAINING_YEARS
    ) {
      setError(
        `잔여 근속연수는 ${MIN_REMAINING_YEARS}~${MAX_REMAINING_YEARS}년 사이로 입력해주세요.`,
      );
      setCalculation(null);
      return;
    }

    const dcReturnRate = Number(dcReturnRateInput);
    if (
      !dcReturnRateInput ||
      Number.isNaN(dcReturnRate) ||
      dcReturnRate < MIN_RATE_PERCENT ||
      dcReturnRate > MAX_RATE_PERCENT
    ) {
      setError(
        `DC 기대수익률은 ${MIN_RATE_PERCENT}~${MAX_RATE_PERCENT}% 사이로 입력해주세요.`,
      );
      setCalculation(null);
      return;
    }

    let peak: { yearsBeforeRetirement: number; reductionRate: number } | undefined;
    if (peakEnabled) {
      const yearsBeforeRetirement = Number(peakYearsInput);
      if (
        !peakYearsInput ||
        Number.isNaN(yearsBeforeRetirement) ||
        yearsBeforeRetirement < 1 ||
        yearsBeforeRetirement > remainingYears
      ) {
        setError(
          "정년까지 남은 연차는 1년 이상, 잔여 근속연수 이하로 입력해주세요.",
        );
        setCalculation(null);
        return;
      }

      const reductionPercent = Number(peakReductionInput);
      if (
        !peakReductionInput ||
        Number.isNaN(reductionPercent) ||
        reductionPercent < MIN_PEAK_REDUCTION_PERCENT ||
        reductionPercent > MAX_PEAK_REDUCTION_PERCENT
      ) {
        setError(
          `감액률은 ${MIN_PEAK_REDUCTION_PERCENT}~${MAX_PEAK_REDUCTION_PERCENT}% 사이로 입력해주세요.`,
        );
        setCalculation(null);
        return;
      }

      peak = {
        yearsBeforeRetirement,
        reductionRate: reductionPercent / 100,
      };
    }

    setError("");
    const output = calculateDbDcCompare({
      currentAnnualSalary,
      annualGrowthRate: annualGrowthRate / 100,
      remainingYears,
      dcReturnRate: dcReturnRate / 100,
      peak,
    });
    setCalculation({ output });
    trackEvent("calculate_click", { tool: "db-dc" });
  };

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-steel/30 bg-white p-6"
      >
        <div>
          <label htmlFor="salary" className="mb-1 block text-sm font-medium text-navy">
            현재 연봉 (원)
          </label>
          <input
            id="salary"
            type="text"
            inputMode="numeric"
            value={salaryInput ? Number(salaryInput).toLocaleString("ko-KR") : ""}
            onChange={(event) => {
              setSalaryInput(event.target.value.replace(/[^0-9]/g, ""));
              resetCalculation();
            }}
            placeholder="예: 80,000,000"
            className="w-full rounded border border-steel/40 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="growthRate" className="mb-1 block text-sm font-medium text-navy">
            연 임금상승률 (%)
          </label>
          <input
            id="growthRate"
            type="number"
            step="0.1"
            value={growthRateInput}
            onChange={(event) => {
              setGrowthRateInput(event.target.value);
              resetCalculation();
            }}
            className="w-full rounded border border-steel/40 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="remainingYears" className="mb-1 block text-sm font-medium text-navy">
            잔여 근속연수 (년)
          </label>
          <input
            id="remainingYears"
            type="number"
            min={MIN_REMAINING_YEARS}
            max={MAX_REMAINING_YEARS}
            value={remainingYearsInput}
            onChange={(event) => {
              setRemainingYearsInput(event.target.value);
              resetCalculation();
            }}
            className="w-full rounded border border-steel/40 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="dcReturnRate" className="mb-1 block text-sm font-medium text-navy">
            DC 기대수익률 (%)
          </label>
          <input
            id="dcReturnRate"
            type="number"
            step="0.1"
            value={dcReturnRateInput}
            onChange={(event) => {
              setDcReturnRateInput(event.target.value);
              resetCalculation();
            }}
            className="w-full rounded border border-steel/40 px-3 py-2"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={peakEnabled}
            onChange={(event) => {
              setPeakEnabled(event.target.checked);
              resetCalculation();
            }}
          />
          임금피크제 적용
        </label>

        {peakEnabled && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="peakYears" className="mb-1 block text-sm font-medium text-navy">
                정년까지 남은 연차 수
              </label>
              <input
                id="peakYears"
                type="number"
                min="1"
                value={peakYearsInput}
                onChange={(event) => {
                  setPeakYearsInput(event.target.value);
                  resetCalculation();
                }}
                className="w-full rounded border border-steel/40 px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="peakReduction" className="mb-1 block text-sm font-medium text-navy">
                감액률 (%)
              </label>
              <input
                id="peakReduction"
                type="number"
                min={MIN_PEAK_REDUCTION_PERCENT}
                max={MAX_PEAK_REDUCTION_PERCENT}
                value={peakReductionInput}
                onChange={(event) => {
                  setPeakReductionInput(event.target.value);
                  resetCalculation();
                }}
                className="w-full rounded border border-steel/40 px-3 py-2"
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="rounded bg-navy px-4 py-2 font-medium text-ivory hover:bg-navy-deep"
        >
          비교하기
        </button>
      </form>

      {calculation && (
        <div className="flex flex-col gap-4">
          <p className="rounded border border-amber/60 bg-amber/10 p-4 text-sm text-navy">
            ⚠ DB→DC 전환은 되돌릴 수 없습니다. 실제 전환 전 반드시 충분히 검토하세요.
          </p>

          <div className="flex gap-8">
            <div>
              <p className="text-sm text-navy/70">DB 유지 시 예상액</p>
              <p className="text-2xl font-bold text-navy">
                {formatWon(calculation.output.dbFull)}
              </p>
            </div>
            <div>
              <p className="text-sm text-navy/70">DC 전환 시 예상액</p>
              <p className="text-2xl font-bold text-navy">
                {formatWon(calculation.output.dcFull)}
              </p>
            </div>
          </div>

          <DbDcChart data={calculation.output.yearlyTrajectory} />

          <p className="text-sm text-navy">
            {Number.isNaN(calculation.output.breakEvenRate)
              ? "손익분기 수익률: 해당 없음 (잔여 근속연수가 1년 이하인 경우 계산할 수 없습니다.)"
              : `연 ${(calculation.output.breakEvenRate * 100).toFixed(1)}% 이상이면 DC가 유리합니다.`}
          </p>

          {calculation.output.peakAnalysis && (
            <div>
              <p className="text-navy">
                최적 전환 시점: {calculation.output.peakAnalysis.optimalYear}년차
              </p>
              <button
                type="button"
                onClick={() => setAccordionOpen((open) => !open)}
                className="text-sm font-medium text-navy underline decoration-amber"
              >
                연차별 전환 시나리오 보기 {accordionOpen ? "▲" : "▼"}
              </button>
              {accordionOpen && (
                <table className="mt-3 w-full text-sm">
                  <thead>
                    <tr className="border-b border-steel/40 text-left text-navy/70">
                      <th className="py-2">전환 시점</th>
                      <th className="py-2 text-right">예상 총액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculation.output.peakAnalysis.scenarios.map((scenario) => (
                      <tr key={scenario.year} className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">
                          {scenario.year === 0
                            ? "즉시 전환"
                            : `${scenario.year}년차`}
                        </td>
                        <td className="py-2 text-right text-navy">
                          {formatWon(scenario.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <AdSlot variant="result" />
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
