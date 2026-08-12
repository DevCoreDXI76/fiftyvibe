import type { Metadata } from "next";
import { DbDcCalculator } from "@/components/db-dc-calculator";
import { AdSlot } from "@/components/ad-slot";
import { RelatedGuides } from "@/components/related-guides";
import { ToolGuide, type ToolGuideFaqItem } from "@/components/tool-guide";

export const metadata: Metadata = {
  title: "퇴직연금 DB DC 전환 계산기 — 유불리 비교 | 피프티바이브",
  description:
    "확정급여형(DB)과 확정기여형(DC) 중 무엇이 유리한지 미리 계산해보세요. 손익분기 수익률과 임금피크제 적용 시 최적 전환 시점, 실제 계산기 함수로 검증한 예시와 자주 묻는 질문 7가지까지 확인할 수 있습니다.",
  alternates: {
    canonical: "/tools/db-dc",
  },
  openGraph: {
    title: "퇴직연금 DB DC 전환 계산기 — 유불리 비교 | 피프티바이브",
    description:
      "확정급여형(DB)과 확정기여형(DC) 중 무엇이 유리한지 미리 계산해보세요. 손익분기 수익률과 임금피크제 적용 시 최적 전환 시점까지 확인할 수 있습니다.",
    url: "/tools/db-dc",
    type: "website",
  },
};

const PAGE_URL = "https://fiftyvibe.kr/tools/db-dc";

const FAQ_ITEMS: ToolGuideFaqItem[] = [
  {
    question: "DB형과 DC형은 어떻게 다른가요?",
    answer:
      "DB(확정급여형)는 퇴직 시점의 임금 수준과 근속연수로 퇴직급여가 정해지는 방식이고, DC(확정기여형)는 매년 일정액을 개인 계좌에 적립해 직접 운용한 결과가 퇴직급여가 되는 방식입니다. DB는 임금 상승에, DC는 운용 수익률에 유불리가 좌우됩니다.",
  },
  {
    question: "손익분기 수익률이 무슨 의미인가요?",
    answer:
      "앞으로 DC 계좌의 연평균 운용수익률이 이 수치 이상이면 DC로 전환하는 것이 DB를 유지하는 것보다 유리해진다는 뜻입니다. 반대로 이 수치보다 낮은 수익률만 기대할 수 있다면 DB를 유지하는 편이 유리합니다.",
  },
  {
    question: "전환 시점의 퇴직금은 어떻게 되나요?",
    answer:
      "DC로 전환하는 순간, 그때까지 쌓인 DB형 퇴직급여(과거 근속분)는 전환 시점의 임금 수준을 기준으로 한 번 정산되어 DC 계좌로 이전됩니다. 이후부터는 매년 새로 납입되는 금액과 그 운용 실적에 따라 퇴직급여가 쌓입니다. 이 계산기는 전환 시점의 과거 근속분 정산은 다루지 않고, 지금부터 정년까지 남은 기간 동안 새로 쌓이는 부분만 비교한다는 점을 참고하시기 바랍니다.",
  },
  {
    question: "임금피크제가 있으면 계산이 어떻게 달라지나요?",
    answer:
      '임금피크제가 적용되면 정년 직전 임금이 줄어들어 DB의 최종 정산액도 함께 줄어듭니다. 이 계산기는 임금피크제 시작 시점과 감액률을 입력받아 매년 복리로 임금이 줄어드는 것으로 단순화해 계산하며, 이 경우에 한해 "몇 년차에 전환하는 것이 가장 유리한지" 전체 연차를 탐색해 알려줍니다.',
  },
  {
    question: "DC 전환 후 운용은 누가 하나요?",
    answer:
      "DC형은 회사가 아니라 가입자 본인이 운용 지시를 내리는 구조입니다. 정기예금처럼 원리금이 보장되는 상품부터 펀드·ETF 등 실적배당형 상품까지 운용 방법을 직접 선택하고 바꿀 수 있으며, 운용 결과(수익 또는 손실)도 본인이 그대로 부담합니다. 다만 위험자산에는 적립금의 70% 한도가 적용되는 등 법으로 정한 운용 규제가 있습니다. 이 계산기는 특정 운용 상품이나 운용사를 추천하지 않으며, 입력한 기대수익률은 어디까지나 가정치입니다.",
  },
  {
    question: "회사가 전환을 강요할 수 있나요?",
    answer:
      "원칙적으로 DB에서 DC로 전환하려면 근로자 개인의 동의가 필요하며, 회사가 일방적으로 전환을 강제할 수는 없습니다. 다만 회사 차원에서 제도 자체를 DC형으로 새로 도입하거나 전환을 권고하는 경우는 있을 수 있어, 정확한 절차와 본인의 권리는 회사 인사·노무 담당 부서를 통해 확인하시는 것이 안전합니다.",
  },
  {
    question: "DB에서 DC로 전환하면 나중에 다시 DB로 돌아갈 수 있나요?",
    answer:
      "아니요, DC로 전환하면 이후 다시 DB로 되돌릴 수 없습니다. 이 계산기의 결과는 어디까지나 참고 자료이며, 실제 전환 여부는 신중하게 검토한 뒤 결정하시기 바랍니다.",
  },
];

export default function DbDcPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "퇴직연금 DB DC 전환 계산기",
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
            name: "퇴직연금 DB DC 전환 계산기",
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
        DB/DC 전환 계산기
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>

      <DbDcCalculator />

      <ToolGuide
        sections={[
          {
            id: "difference",
            title: "DB/DC 차이와 전환 시 변화",
            children: (
              <>
                <p>
                  확정급여형(DB)과 확정기여형(DC)은 퇴직급여를 쌓는 방식이
                  근본적으로 다릅니다. DB는 퇴직 시점의 임금 수준에
                  근속연수를 곱해 퇴직급여를 정산하는 방식이라, 임금이
                  꾸준히 오르는 동안에는 유리한 구조입니다. 반면 DC는 매년
                  일정액을 개인 계좌에 적립하고 직접 운용해 수익을 쌓는
                  방식이라, 운용수익률이 임금상승률보다 높으면 유리해집니다.
                </p>
                <p>
                  이 계산기는 지금 이 시점부터 정년까지 남은 기간 동안 새로
                  쌓이는 퇴직급여만 비교합니다. 다만 실제 전환 시에는 이미
                  근무한 기간에 대한 DB 권리도 전환 시점의 임금 수준으로
                  함께 정산됩니다 — 즉, 임금피크제가 이미 적용된 뒤에
                  전환하면 과거 근속분까지 낮아진 임금 기준으로 정산되어
                  불리해질 수 있습니다. 이것이 많은 분들이 임금피크제
                  적용 전에 DC 전환을 서두르는 이유 중 하나이며, 이
                  계산기의 결과에는 반영되지 않은 부분이니 참고하시기
                  바랍니다.
                </p>
              </>
            ),
          },
          {
            id: "variables",
            title: "전환 판단의 핵심 변수",
            children: (
              <>
                <p>
                  전환 유불리를 가르는 핵심 변수는 딱 두 가지, 남은 근무
                  기간 동안의 연평균 임금상승률과 DC 계좌의 연평균
                  운용수익률입니다. 이 계산기가 보여주는 &quot;손익분기
                  수익률&quot;은 이 두 변수를 같은 값으로 만드는
                  지점입니다 — 앞으로 기대하는 DC 운용수익률이 손익분기
                  수익률보다 높으면 DC 전환이, 낮으면 DB 유지가 구조적으로
                  유리합니다.
                </p>
                <p>
                  이 계산기는 특정 운용수익률 전망치나 금융상품을 제시하지
                  않습니다. 입력창에 본인이 가정하는 임금상승률과
                  기대수익률을 직접 넣어보고, 그 가정 아래에서 구조적으로
                  어느 쪽이 유리한지 확인하는 용도로 설계되었습니다. 임금
                  전망은 회사의 승급·호봉 체계를, 운용수익률 전망은 본인의
                  투자 성향과 시장 상황을 참고해 보수적으로 가정해보시길
                  권합니다.
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
            title: "계산 예시 1건 (임금피크제 적용, 실제 계산기 함수로 검증)",
            children: (
              <>
                <p>
                  아래 예시는 이 계산기가 실제로 사용하는 함수를 그대로
                  실행해 나온 값이며, 자동화 테스트로 고정되어 있어 계산
                  로직이 바뀌지 않는 한 언제나 이 숫자와 정확히 일치합니다.
                  현재 연봉·임금상승률·운용수익률·임금피크제 조건은 계산
                  구조를 보여주기 위한 가정치일 뿐, 특정 수익률이나
                  상품을 권장하는 것이 아닙니다.
                </p>
                <p>
                  조건: 현재 연봉 1억 2,000만 원, 연 임금상승률 0%, 잔여
                  근속연수 5년, DC 기대수익률 연 3%, 정년 2년 전부터
                  임금피크제 시작(감액률 20%).
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-steel/40 text-left text-navy/70">
                        <th className="py-2">전환 시점</th>
                        <th className="py-2 text-right">예상 총액</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">즉시 전환</td>
                        <td className="py-2 text-right text-navy">
                          47,431,358원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">1년차</td>
                        <td className="py-2 text-right text-navy">
                          47,431,358원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">2년차</td>
                        <td className="py-2 text-right text-navy">
                          47,103,540원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">3년차</td>
                        <td className="py-2 text-right text-navy">
                          46,467,000원
                        </td>
                      </tr>
                      <tr className="border-b border-steel/20">
                        <td className="py-2 text-navy/70">4년차</td>
                        <td className="py-2 text-right text-navy">
                          39,360,000원
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium text-navy">
                          5년차(=DB 유지)
                        </td>
                        <td className="py-2 text-right font-medium text-navy">
                          32,000,000원
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  이 조건에서는 &quot;즉시 전환&quot;이 최적 전환 시점으로
                  계산됩니다. 전환 시점이 늦어질수록(특히 임금피크제가
                  시작되는 4년차 이후) 예상 총액이 급격히 줄어드는 것을
                  확인할 수 있는데, 이는 임금피크제로 낮아진 임금이 DC
                  적립액 산정 기준이 되기 때문입니다. 즉 임금피크제를 이미
                  겪은 뒤에 전환하면 그만큼 적게 적립하고 전환하는 셈이 되어
                  불리해지는 구조를 이 예시가 보여줍니다.
                </p>
                {/* TODO(운영자): DB→DC 전환 결정 경험담 문단 삽입 예정 */}
              </>
            ),
          },
        ]}
        faqItems={FAQ_ITEMS}
      />

      <section className="flex flex-col gap-4 text-navy">
        <p>
          임금피크제가 적용되는 경우, 정년 직전 일정 기간 동안 임금이 매년
          일정 비율만큼 줄어드는데, 이 계산기는 이를 매년 복리로 축소되는
          단순화된 모델로 계산합니다. 실제 제도는 회사마다 감액 방식이 다를
          수 있으니 정확한 수치는 회사 규정을 확인하세요.
        </p>
        <p>
          이 계산기는 급여 구성(상여금·수당 등), 운용 수수료, 세금 등을
          반영하지 않은 단순화 모델이며, 특정 금융상품이나 운용 전략을
          추천하지 않습니다. 계산 결과는 참고 자료로만 활용하시기 바랍니다.
        </p>
        <p>
          무엇보다 DB에서 DC로의 전환은 한 번 결정하면 되돌릴 수 없습니다.
          손익분기 수익률과 최적 전환 시점은 어디까지나 참고 지표이며, 실제
          전환 여부는 본인의 급여 전망, 위험 감수 성향, 남은 근속기간 등을
          종합적으로 고려해 신중하게 결정하시기 바랍니다.
        </p>
      </section>

      <RelatedGuides tool="db-dc" />
    </div>
  );
}
