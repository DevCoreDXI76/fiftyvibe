import type { Metadata } from "next";
import { LumpVsPensionCalculator } from "@/components/lump-vs-pension-calculator";
import { AdSlot } from "@/components/ad-slot";
import { RelatedGuides } from "@/components/related-guides";
import { ToolGuide, type ToolGuideFaqItem } from "@/components/tool-guide";
import { TAX_TABLES } from "@/lib/tax-tables";
import { formatPercent } from "@/lib/format-tax-copy";

export const metadata: Metadata = {
  title: "퇴직금 일시금 vs 연금 수령 세금 비교 계산기 | 피프티바이브",
  description:
    "퇴직금을 일시금으로 받을 때와 연금으로 나눠 받을 때의 세금을 비교해보세요. 이연퇴직소득세 감면 구조와 실제 계산기 함수로 검증한 예시, 자주 묻는 질문 9가지까지 확인할 수 있습니다.",
  alternates: {
    canonical: "/tools/lump-vs-pension",
  },
  openGraph: {
    title: "퇴직금 일시금 vs 연금 수령 세금 비교 계산기 | 피프티바이브",
    description:
      "퇴직금을 일시금으로 받을 때와 연금으로 나눠 받을 때의 세금을 비교해보세요. 이연퇴직소득세 감면 혜택까지 반영한 절세액을 확인할 수 있습니다.",
    url: "/tools/lump-vs-pension",
    type: "website",
  },
};

const PAGE_URL = "https://fiftyvibe.kr/tools/lump-vs-pension";

// 감면율은 세율표에서 직접 가져온다. deferredPensionTaxReduction[].rate는
// "부과되는 비율"이므로(예: 0.7 = 70%만 부과 = 30% 감면), 화면 문구에
// 맞춰 반드시 1 - rate로 감면율을 계산한다.
const reductionBrackets = TAX_TABLES[2026].deferredPensionTaxReduction;
const firstReductionBracket = reductionBrackets[0]; // {upToYear:10, rate:0.7}
const secondReductionBracket = reductionBrackets[1]; // {upToYear:null, rate:0.6}

const FAQ_ITEMS: ToolGuideFaqItem[] = [
  {
    question: "이연퇴직소득세가 뭔가요?",
    answer:
      "퇴직금을 일시금으로 받으면 즉시 부과되는 퇴직소득세를, 연금계좌로 받으면 실제 수령 시점까지 미뤄두는 것을 말합니다. 미뤄둔 세금은 실제 수령 연차에 따라 감면된 세율(1~10년차 70%, 11년차부터 60%)로 나눠 부과됩니다.",
  },
  {
    question: "왜 오래 나눠 받을수록 세금이 줄어드나요?",
    answer:
      "감면율이 연차가 지날수록 유리해지는 구조이기 때문입니다(11년차부터 40% 감면). 이연된 세액을 여러 해에 걸쳐 나눠 내면서 매 연차 감면 혜택을 받기 때문에, 수령기간이 길수록 전체 감면 효과가 커집니다.",
  },
  {
    question: "연금으로 받으면 무조건 유리한가요?",
    answer:
      "세금만 놓고 보면 연금으로 나눠 받을 때 이연퇴직소득세 감면 혜택이 있어 유리한 경우가 많습니다. 다만 연금계좌 운용수익에는 별도의 연금소득세가 부과되고, 건강보험료나 당장 필요한 자금 여부 등 세금 외의 변수도 함께 작용하기 때문에 모든 상황에서 무조건 유리하다고 단정할 수는 없습니다. 본인의 자금 계획과 함께 종합적으로 판단하시기 바랍니다.",
  },
  {
    question: "연금 수령 한도는 어떻게 되나요?",
    answer:
      "연금수령한도란, 한 해에 연금으로 인출할 수 있는 금액에 법으로 정한 상한이 있다는 뜻입니다. 한도를 넘겨 인출하면 초과분은 연금이 아니라 일시금으로 받은 것으로 보아 이연해둔 원래 퇴직소득세가 감면 없이 그대로 부과되므로, 감면 혜택을 온전히 받으려면 한도 내에서 나눠 받아야 합니다. 이 계산기는 입력한 수령기간 동안 한도를 지키며 균등하게 수령한다고 가정하고 계산하므로, 실제 연금계좌 약관의 한도 계산식은 가입한 금융회사를 통해 별도로 확인하시기 바랍니다.",
  },
  {
    question: "연금계좌를 중도 해지하면 세금이 어떻게 되나요?",
    answer:
      "연금계좌를 중도에 해지해 일시금으로 인출하면, 이연해둔 퇴직소득세가 감면 없이 그대로 부과됩니다. 결과적으로 애초에 일시금으로 받았을 때와 같은 금액의 세금을 내게 되어, 이 계산기가 보여주는 절세 효과는 사라집니다. 해지 시점이나 사유에 따라 추가적인 불이익이 있을 수 있으니 신중히 결정하시기 바랍니다.",
  },
  {
    question: "연금으로 받으면 세금이 전혀 없나요?",
    answer:
      "아닙니다. 이연퇴직소득세(이 계산기가 비교하는 부분) 외에, 연금계좌 운용수익에 대한 별도의 연금소득세(3.3~5.5%)가 부과됩니다. 이 계산기는 운용수익분은 포함하지 않은 참고용 비교입니다.",
  },
  {
    question: "건강보험료에 영향이 있나요?",
    answer:
      "연금소득은 건강보험료 산정 시 소득으로 반영될 수 있어, 수령액 규모나 다른 소득과 합산되는 방식에 따라 지역가입자 보험료나 피부양자 자격에 영향을 줄 수 있습니다. 다만 구체적인 반영 방식과 기준은 해마다 바뀔 수 있고 개인 상황(다른 소득·자산 여부)에 따라 달라지므로, 이 계산기는 이 부분을 계산에 포함하지 않습니다. 정확한 영향은 국민건강보험공단을 통해 확인하시기 바랍니다.",
  },
  {
    question: "55세 전에 받으면 어떻게 되나요?",
    answer:
      "원칙적으로 연금 수령은 만 55세 이후, 연금계좌 가입 후 5년이 지나야 가능합니다. 55세 이전에 퇴직급여를 인출하면 연금이 아니라 일시금 수령으로 처리되어 이 계산기가 비교하는 이연·감면 혜택을 받을 수 없고, 원래의 퇴직소득세가 감면 없이 그대로 부과됩니다. 다만 55세 이전이라도 퇴직으로 받은 급여를 IRP 계좌로 이체해두면 실제 수령 시점(55세 이후)까지 과세를 미룰 수 있습니다.",
  },
  {
    question: "수령기간은 어떻게 정하나요?",
    answer:
      "10·15·20년 중 선택하거나 직접 입력할 수 있습니다. 실제로는 연금 상품 약관이나 개인 자금 계획에 따라 수령기간을 정하게 되며, 이 계산기는 각 선택지별 세금 차이를 미리 가늠해보는 용도입니다.",
  },
];

export default function LumpVsPensionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "일시금 vs 연금 비교 계산기",
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
            name: "일시금 vs 연금 비교 계산기",
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
        일시금 vs 연금 비교 계산기
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>

      <LumpVsPensionCalculator />

      <ToolGuide
        sections={[
          {
            id: "comparison",
            title: "이 계산기가 비교하는 것",
            children: (
              <>
                <p>
                  퇴직금을 일시금으로 한 번에 받을지, 연금으로 나눠 받을지는
                  세금 측면에서 큰 차이를 만듭니다. 퇴직급여를 연금계좌에
                  넣고 나눠 받으면 원래 &quot;퇴직소득세 계산기&quot;에서 계산되는
                  퇴직소득세를 즉시 내지 않고 이연했다가, 실제 수령하는
                  시점에 연차별로 감면된 세율로 나눠 냅니다. 이는 퇴직소득세
                  자체를 다시 계산하는 것이 아니라, 이미 계산된 퇴직소득세를
                  &quot;언제, 얼마씩&quot; 낼지 재분배하는 구조라는 점이 핵심입니다.
                </p>
                <p>
                  일시금으로 받으면 &quot;퇴직소득세 계산기&quot;가 보여주는 세액을
                  퇴직 시점에 한 번에 냅니다. 반면 연금으로 받으면 같은
                  세액을 선택한 수령기간(10·15·20년 또는 직접 입력)에 걸쳐
                  나눠 내되, 각 연차마다 감면율이 적용되어 실제로 내는
                  총액이 줄어듭니다. 이 계산기는 도구 1(퇴직소득세
                  계산기)에서 넘어온 퇴직급여와 근속연수를 그대로 받아, 두
                  방식의 총세금을 나란히 비교해 보여줍니다.
                </p>
              </>
            ),
          },
          {
            id: "structure",
            title: "연금 수령 시 세제혜택 구조",
            children: (
              <>
                <p>
                  이연퇴직소득세의 감면율은 수령 연차에 따라 두 단계로
                  나뉩니다. 연금 수령 1년차부터{" "}
                  {firstReductionBracket.upToYear}년차까지는 원래 세액의{" "}
                  {formatPercent(firstReductionBracket.rate)}만 부과되어(=
                  {formatPercent(1 - firstReductionBracket.rate)} 감면),{" "}
                  {firstReductionBracket.upToYear! + 1}년차부터는 원래
                  세액의 {formatPercent(secondReductionBracket.rate)}만
                  부과됩니다(={formatPercent(1 - secondReductionBracket.rate)}{" "}
                  감면). 오래 나눠 받을수록 감면율이 더 유리한 구간에
                  머무는 기간이 길어지는 셈입니다.
                </p>
                <p>
                  구체적인 계산 방식은 이렇습니다. 먼저 일시금으로 받았을
                  때의 원래 퇴직소득세를 선택한 수령기간으로 균등하게
                  나눕니다. 그다음 각 연차에 해당하는 감면율을 곱해 그해에
                  실제로 낼 세금을 구하고, 이를 모든 연차에 걸쳐 더한
                  값이 연금으로 받을 때의 총세금입니다. 일시금 총세금에서
                  이 값을 뺀 차액이 이 계산기가 보여주는 절세액입니다.
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
            title: "계산 예시 (실제 계산기 함수로 검증)",
            children: (
              <>
                <p>
                  아래 예시는 이 계산기가 실제로 사용하는 함수를 그대로
                  실행해 나온 값이며, 자동화 테스트로 고정되어 있어 계산
                  로직이 바뀌지 않는 한 언제나 이 숫자와 정확히 일치합니다.
                </p>
                <div className="overflow-x-auto">
                  <p className="mb-2 font-medium text-navy">
                    예시 — 퇴직급여 1억 원, 근속 11년, 10년 수령
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-steel/40 text-left text-navy/70">
                        <th className="py-2">구분</th>
                        <th className="py-2 text-right">퇴직소득세</th>
                        <th className="py-2 text-right">지방소득세</th>
                        <th className="py-2 text-right">합계</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">
                          일시금으로 받을 때
                        </td>
                        <td className="py-2 text-right text-navy">
                          3,492,500원
                        </td>
                        <td className="py-2 text-right text-navy">
                          349,250원
                        </td>
                        <td className="py-2 text-right text-navy">
                          3,841,750원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">
                          연금 1~10년차(연차별, 감면율 70% 동일)
                        </td>
                        <td className="py-2 text-right text-navy">
                          244,475원
                        </td>
                        <td className="py-2 text-right text-navy">
                          24,447원
                        </td>
                        <td className="py-2 text-right text-navy">
                          268,922원
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium text-navy">
                          연금 10년 합계
                        </td>
                        <td className="py-2 text-right font-medium text-navy">
                          2,444,750원
                        </td>
                        <td className="py-2 text-right font-medium text-navy">
                          244,470원
                        </td>
                        <td className="py-2 text-right font-medium text-navy">
                          2,689,220원
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  일시금 총세금 3,841,750원에서 연금 10년 합계 2,689,220원을
                  뺀 1,152,530원이 절세액이며, 일시금 대비 약 30.0%
                  절감입니다. 같은 조건(퇴직급여 1억 원, 근속 11년)이라도
                  수령기간을 10년이 아니라 15년으로 늘리면 11년차부터는
                  감면율이 60%로 낮아지는데, 이 계산기는 10년차까지는
                  70%, 11년차부터는 60% 감면율을 정확히 구분해 적용하도록
                  검증되어 있습니다 — 즉 수령기간을 길게 잡을수록 감면율이
                  더 유리한 구간(11년차 이후)이 포함될 가능성이 커진다는
                  뜻입니다.
                </p>
                {/* TODO(운영자): 연금 개시 나이 관련 경험담 문단 삽입 예정 */}
              </>
            ),
          },
        ]}
        faqItems={FAQ_ITEMS}
      />

      <section className="flex flex-col gap-4 text-navy">
        <p>
          다만 이 비교는 이연된 퇴직소득세만을 기준으로 합니다. 실제로
          연금계좌에 퇴직급여를 넣어두면 운용 수익이 발생하고, 이 운용수익
          부분에는 별도로 연금소득세(3.3~5.5%, 나이와 수령 기간에 따라
          차등)가 부과됩니다. 이 계산기는 그 운용수익분 세금은 포함하지
          않으므로, 실제로 받게 될 세후 금액은 여기서 보여주는 절세액보다
          적을 수 있습니다.
        </p>
        <p>
          일시금과 연금 중 어느 쪽이 유리한지는 근속연수, 예상 수령 기간,
          다른 소득과의 합산 여부, 자금이 당장 필요한지 등 개인 상황에 따라
          달라집니다. 이 계산기는 세금 측면의 참고 자료로만 활용하고, 실제
          결정 전에는 세무 전문가와 상담하시기 바랍니다. 또한 이 계산기는
          연차별 세액을 원래 퇴직소득세를 수령기간으로 균등하게 나눈 값으로
          모델링합니다. 예를 들어 10년간 나눠 받는다면 원래 퇴직소득세를
          단순히 10등분한 금액에 각 연차 감면율을 적용하는 방식이며, 실제
          세법상 이연퇴직소득세 정산 방식과 세부적으로 다를 수 있습니다.
          도구 1(퇴직소득세 계산기)은 홈택스 모의계산과 대조해 오차 0원을
          확인했지만, 홈택스에는 일시금과 연금을 비교하는 모의계산 기능
          자체가 없어 이 도구는 같은 방식으로 실제 지급 결과와 대조 검증하는
          것이 불가능하다는 점도 참고하시어, 최종 수령 방식 결정에는 이
          계산기의 절세액을 하나의 참고 지표로만 활용하시기 바랍니다.
        </p>
      </section>

      <RelatedGuides tool="lump-vs-pension" />
    </div>
  );
}
