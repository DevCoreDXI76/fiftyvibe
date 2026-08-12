import type { Metadata } from "next";
import { SeveranceTaxCalculator } from "@/components/severance-tax-calculator";
import { AdSlot } from "@/components/ad-slot";
import { RelatedGuides } from "@/components/related-guides";
import { ToolGuide, type ToolGuideFaqItem } from "@/components/tool-guide";
import { TAX_TABLES } from "@/lib/tax-tables";
import { formatWonUnit } from "@/lib/format-tax-copy";

export const metadata: Metadata = {
  title: "퇴직소득세 계산기 (2026) — 퇴직금 실수령액 세후 계산 | 피프티바이브",
  description:
    "퇴직금 실수령액과 세금을 미리 계산해보세요. 근속연수공제부터 지방소득세까지 계산 과정을 단계별로 확인하고, 실제 계산기 함수로 검증한 예시와 자주 묻는 질문 8가지까지 한 페이지에서 확인할 수 있습니다.",
  alternates: {
    canonical: "/tools/severance-tax",
  },
  openGraph: {
    title: "퇴직소득세 계산기 (2026) — 퇴직금 실수령액 세후 계산 | 피프티바이브",
    description:
      "퇴직금 실수령액과 세금을 미리 계산해보세요. 근속연수공제부터 지방소득세까지 계산 과정을 단계별로 확인할 수 있습니다.",
    url: "/tools/severance-tax",
    type: "website",
  },
};

const PAGE_URL = "https://fiftyvibe.kr/tools/severance-tax";

// 본문에 인용하는 세율표 수치는 절대 하드코딩하지 않고 TAX_TABLES에서 직접 가져온다.
const lastServiceYearBracket =
  TAX_TABLES[2026].serviceYearDeduction[
    TAX_TABLES[2026].serviceYearDeduction.length - 1
  ];
const firstConvertedSalaryDeductionBracket =
  TAX_TABLES[2026].convertedSalaryDeduction[0];

const FAQ_ITEMS: ToolGuideFaqItem[] = [
  {
    question: "근속연수는 어떻게 계산하나요?",
    answer:
      "입사일부터 퇴사일까지의 기간을 연 단위로 계산하며, 1년 미만의 기간이 있으면 그 부분은 1년으로 올려서 계산합니다. 예를 들어 9년 3개월을 근무했다면 근속연수는 10년으로 처리됩니다. 또한 입사일로부터 정확히 만 1년, 2년 등 \"그날\"에 퇴사하는 경우에도 다음 해로 계산됩니다(예: 정확히 10년째 되는 날 퇴사하면 근속연수는 11년으로 처리됩니다).",
  },
  {
    question: "왜 근속연수가 짧으면 세금이 더 많이 나오나요?",
    answer:
      "계산 과정에서 퇴직급여를 근속연수로 나눈 뒤 12를 곱해 1년치로 환산한 소득(환산급여)을 구하는 단계가 있습니다. 근속연수가 짧을수록 이 환산급여가 커져서 더 높은 세율 구간이 적용되기 때문입니다. 짧은 근속을 반복하며 세금을 회피하는 것을 막기 위한 제도적 장치입니다.",
  },
  {
    question: "퇴직소득세는 왜 월급에 매기는 소득세와 따로 계산되나요?",
    answer:
      "퇴직소득세는 다른 소득과 합산하지 않는 분류과세 대상이기 때문입니다. 월급이나 사업소득처럼 매년 반복되는 소득은 한 해 동안 번 금액을 모두 더해 누진세율을 적용하는 종합과세 대상이지만, 퇴직금은 여러 해에 걸쳐 일한 대가를 한 번에 받는 소득입니다. 종합소득에 그대로 합산하면 그해에만 소득이 몰린 것처럼 보여 세부담이 지나치게 커지기 때문에, 환산급여와 연분연승이라는 별도 계산식으로 여러 해에 걸쳐 쌓인 소득이라는 성격을 반영합니다.",
  },
  {
    question: "퇴직금을 IRP로 받으면 세금이 어떻게 되나요?",
    answer:
      "IRP(개인형퇴직연금)는 특정 금융상품이 아니라 퇴직급여를 연금 형태로 수령하기 위해 법으로 정해진 계좌 유형입니다. 퇴직금을 IRP 계좌로 이체하면 이 계산기가 보여주는 퇴직소득세를 즉시 내지 않고 실제로 연금을 수령하는 시점까지 미룰 수 있는데, 이를 과세이연이라고 합니다. 이연된 세금은 실제 수령 연차에 따라 감면된 세율로 나눠 부과되며, 자세한 비교는 \"일시금 vs 연금 비교 계산기\"에서 확인할 수 있습니다.",
  },
  {
    question: "중간정산을 받은 적이 있으면 어떻게 입력하나요?",
    answer:
      "이 계산기는 이번에 받는 퇴직급여와 이번 근무 기간만을 기준으로 계산합니다. 과거에 중간정산을 받은 적이 있다면 근속연수는 중간정산 이후 시점부터 이번 퇴사일까지로, 퇴직급여 총액도 중간정산 이후 새로 쌓인 금액만 입력하면 됩니다. 다만 실제 원천징수 시에는 과거 중간정산 이력이 세액 계산에 함께 반영되는 경우가 있어 회사 정산 금액과 차이가 날 수 있으니, 정확한 금액은 회사 담당 부서나 홈택스를 통해 다시 확인하시기 바랍니다.",
  },
  {
    question: "이 계산기 결과와 실제 회사에서 지급하는 금액이 다를 수 있나요?",
    answer:
      "네, 다를 수 있습니다. 이 계산기는 소득세법에 규정된 퇴직소득세 계산 공식을 기준으로 하지만, 실제 원천징수 시 단수처리(원 단위 반올림·절사) 방식이나 회사의 급여 시스템에 따라 소액의 차이가 발생할 수 있습니다. 정확한 금액은 반드시 홈택스 모의계산이나 세무 전문가를 통해 확인하세요.",
  },
  {
    question: "계산 결과는 법적 효력이 있나요?",
    answer:
      "아니요, 법적 효력이 없습니다. 이 계산기는 소득세법에 규정된 계산식을 참고용으로 구현한 것으로, 계산기 결과 화면에 표시되는 안내문에서도 동일하게 밝히고 있듯 실제 세액은 세법 개정이나 개별 상황에 따라 달라질 수 있습니다. 최종 금액은 반드시 홈택스 모의계산이나 세무 전문가를 통해 확인하시기 바랍니다.",
  },
  {
    question: "퇴직금을 일시금과 연금 중 무엇으로 받는 게 유리한가요?",
    answer:
      '근속연수, 예상 수령 기간, 다른 소득 여부 등에 따라 달라집니다. 일반적으로 연금으로 나눠 받으면 이연퇴직소득세 감면 혜택이 있어 세금 부담이 줄어드는 경우가 많습니다. 자세한 비교는 "일시금 vs 연금 수령 비교 계산기"에서 확인하실 수 있습니다.',
  },
];

export default function SeveranceTaxPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "퇴직소득세 계산기",
        url: PAGE_URL,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "홈",
            item: "https://fiftyvibe.kr",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "퇴직소득세 계산기",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-2xl font-bold text-navy">
        퇴직소득세 계산기
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>

      <SeveranceTaxCalculator />

      <ToolGuide
        sections={[
          {
            id: "definition",
            title: "이 계산기가 계산하는 것",
            children: (
              <>
                <p>
                  퇴직소득세는 퇴직금을 한 번에 받을 때 부과되는 세금으로,
                  매달 받는 월급에 매겨지는 근로소득세와는 계산 방식이 완전히
                  다릅니다. 근로소득세는 1년치 소득을 모두 더한 뒤 누진세율을
                  적용하는 종합과세 대상이지만, 퇴직소득세는 다른 소득과
                  합산하지 않고 퇴직금만 따로 떼어 계산하는 분류과세
                  대상입니다. 퇴직금은 여러 해에 걸쳐 일한 대가를 한 번에
                  받는 돈이라, 1년치 소득처럼 취급해 누진세율을 그대로
                  적용하면 세부담이 지나치게 커지기 때문에 별도의 계산
                  구조를 둔 것입니다.
                </p>
                <p>
                  이 계산기는 2026년 현재 시행 중인 소득세법(제48조·제55조·
                  제64조의4)에 규정된 계산식을 그대로 구현했습니다.
                  근속연수공제·환산급여공제·기본세율 구간 등 계산에 쓰이는
                  모든 수치는 이 사이트가 한 곳(세율표)에서 관리하며, 세법이
                  개정되면 세율표도 함께 갱신할 방침입니다. 또한 2026년 7월
                  홈택스 모의계산기와 결과를 대조해 세부 단수처리(반올림·
                  절사 규칙)까지 오차 0원인 것을 확인했으며, 아래 계산
                  예시가 그 대조 케이스를 그대로 재현한 것입니다.
                </p>
                <p>
                  여기에 퇴직소득세의 10%에 해당하는 지방소득세가 추가로
                  부과되며, 두 세금을 뺀 나머지가 실제로 통장에 들어오는
                  실수령액입니다.
                </p>
              </>
            ),
          },
          {
            id: "structure",
            title: "계산 구조 4단계 해설",
            children: (
              <>
                <p>퇴직소득세는 다음 네 단계를 거쳐 계산됩니다.</p>
                <p>
                  <strong>① 근속연수공제.</strong> 퇴직급여에서 근속연수에
                  비례한 공제액을 먼저 뺍니다. 근속연수가 길수록 공제액이
                  커지는 구조로, 예를 들어 근속연수{" "}
                  {lastServiceYearBracket.fromYear}년을 넘는 구간부터는
                  초과하는 해마다 연{" "}
                  {formatWonUnit(lastServiceYearBracket.perYear)}씩 공제액이
                  늘어납니다. 오래 근무할수록 세금 계산의 출발점이 되는
                  금액 자체가 줄어드는 셈입니다.
                </p>
                <p>
                  <strong>② 환산급여.</strong> 근속연수공제를 뺀 금액을
                  근속연수로 나눈 뒤 다시 12를 곱해, 마치 1년 동안 번
                  소득처럼 환산합니다. 이 단계 때문에 근속연수가 짧을수록
                  (예: 1~2년) 환산급여가 급격히 커져 더 높은 세율 구간이
                  적용되는 효과가 생깁니다. 짧은 근속을 반복하며 퇴직금을
                  나눠 받아 세금을 줄이는 편법을 막기 위한 설계입니다.
                </p>
                <p>
                  <strong>③ 환산급여공제.</strong> 환산급여에서 다시 한 번
                  구간별 공제를 뺍니다. 환산급여가{" "}
                  {formatWonUnit(firstConvertedSalaryDeductionBracket.upTo)}{" "}
                  이하인 구간은 전액(
                  {Math.round(firstConvertedSalaryDeductionBracket.rate * 100)}
                  %) 공제되고, 금액이 커질수록 공제율이 단계적으로
                  낮아집니다. 이렇게 나온 금액이 세율을 적용할 기준인
                  과세표준입니다.
                </p>
                <p>
                  <strong>④ 세율 적용과 연분연승.</strong> 과세표준에 일반
                  소득세와 같은 누진세율을 적용해 세액(환산산출세액)을 구한
                  뒤, 이 세액을 다시 12로 나누고 근속연수를 곱해 최종
                  퇴직소득세로 되돌립니다. ②에서 근속연수로 나눈 뒤 12를
                  곱해 세율 구간을 부풀렸다면, ④에서는 정확히 반대 방향으로
                  12로 나누고 근속연수를 곱해 원래 규모로 되돌리는
                  것입니다. 이 &quot;나눴다 다시 곱하는&quot; 연분연승
                  구조 덕분에, 여러 해에 걸쳐 번 퇴직금이 단 한 해의
                  소득으로 오인되어 최고세율 구간까지 떠밀리는 것을 막고,
                  근속연수가 길수록 세부담이 완화되는 효과가 만들어집니다.
                </p>
              </>
            ),
          },
        ]}
      />

      <AdSlot variant="content" />

      <ToolGuide
        sections={[
          {
            id: "examples",
            title: "계산 예시 2건 (실제 계산기 함수로 검증)",
            children: (
              <>
                <p>
                  아래 두 예시는 손으로 어림잡아 쓴 숫자가 아니라, 이
                  계산기가 실제로 사용하는 함수를 그대로 실행해 나온
                  값입니다. 두 예시 모두 자동화 테스트(vitest)로 고정해
                  두었기 때문에, 계산 로직이 바뀌지 않는 한 언제나 이
                  숫자와 정확히 일치합니다.
                </p>
                <div className="overflow-x-auto">
                  <p className="mb-2 font-medium text-navy">
                    예시 A — 근속 20년, 퇴직급여 2억 원
                  </p>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">근속연수공제</td>
                        <td className="py-2 text-right text-navy">
                          40,000,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">환산급여</td>
                        <td className="py-2 text-right text-navy">
                          96,000,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">환산급여공제</td>
                        <td className="py-2 text-right text-navy">
                          59,500,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">과세표준</td>
                        <td className="py-2 text-right text-navy">
                          36,500,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">환산산출세액</td>
                        <td className="py-2 text-right text-navy">
                          4,215,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">퇴직소득세</td>
                        <td className="py-2 text-right text-navy">
                          7,025,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">지방소득세</td>
                        <td className="py-2 text-right text-navy">
                          702,500원
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium text-navy">
                          실수령액
                        </td>
                        <td className="py-2 text-right font-medium text-navy">
                          192,272,500원
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="overflow-x-auto">
                  <p className="mb-2 font-medium text-navy">
                    예시 B — 근속 8년, 퇴직급여 5,000만 원
                  </p>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">근속연수공제</td>
                        <td className="py-2 text-right text-navy">
                          11,000,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">환산급여</td>
                        <td className="py-2 text-right text-navy">
                          58,500,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">환산급여공제</td>
                        <td className="py-2 text-right text-navy">
                          38,300,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">과세표준</td>
                        <td className="py-2 text-right text-navy">
                          20,200,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">환산산출세액</td>
                        <td className="py-2 text-right text-navy">
                          1,770,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">퇴직소득세</td>
                        <td className="py-2 text-right text-navy">
                          1,180,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">지방소득세</td>
                        <td className="py-2 text-right text-navy">
                          118,000원
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium text-navy">
                          실수령액
                        </td>
                        <td className="py-2 text-right font-medium text-navy">
                          48,702,000원
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  두 예시를 비교해보면, 퇴직급여가 더 적은 예시 B(5,000만
                  원)의 실효세율이 예시 A(2억 원)보다 오히려 낮게
                  나옵니다(예시 B는 총세금 1,298,000원으로 실효세율 약
                  2.6%, 예시 A는 총세금 7,727,500원으로 실효세율 약
                  3.9%). 근속연수(8년 vs 20년)와 퇴직급여 규모가 함께
                  작용해 환산급여·과세표준이 달라지기 때문으로, &quot;퇴직급여가
                  적으면 세금도 무조건 적다&quot;고 단순화할 수 없다는 점을
                  보여주는 사례이기도 합니다.
                </p>
                {/* TODO(운영자): DB→DC 전환 준비 경험담 문단 삽입 예정 */}
              </>
            ),
          },
        ]}
        faqItems={FAQ_ITEMS}
      />

      <AdSlot variant="content" />

      <RelatedGuides tool="severance-tax" />
    </div>
  );
}
