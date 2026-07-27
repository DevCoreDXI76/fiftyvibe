import type { Metadata } from "next";
import { DbDcCalculator } from "@/components/db-dc-calculator";
import { AdSlot } from "@/components/ad-slot";

export const metadata: Metadata = {
  title: "퇴직연금 DB DC 전환 계산기 — 유불리 비교 | 피프티바이브",
  description:
    "확정급여형(DB)과 확정기여형(DC) 중 무엇이 유리한지 미리 계산해보세요. 손익분기 수익률과 임금피크제 적용 시 최적 전환 시점까지 확인할 수 있습니다.",
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

const FAQ_ITEMS = [
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
    question: "임금피크제가 있으면 계산이 어떻게 달라지나요?",
    answer:
      '임금피크제가 적용되면 정년 직전 임금이 줄어들어 DB의 최종 정산액도 함께 줄어듭니다. 이 계산기는 임금피크제 시작 시점과 감액률을 입력받아 매년 복리로 임금이 줄어드는 것으로 단순화해 계산하며, 이 경우에 한해 "몇 년차에 전환하는 것이 가장 유리한지" 전체 연차를 탐색해 알려줍니다.',
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
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
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

      <section className="flex flex-col gap-4 text-navy">
        <p>
          확정급여형(DB)과 확정기여형(DC)은 퇴직급여를 쌓는 방식이 근본적으로
          다릅니다. DB는 퇴직 시점의 임금 수준에 근속연수를 곱해 퇴직급여를
          정산하는 방식이라, 임금이 꾸준히 오르는 동안에는 유리한 구조입니다.
          반면 DC는 매년 일정액을 개인 계좌에 적립하고 직접 운용해 수익을
          쌓는 방식이라, 운용수익률이 임금상승률보다 높으면 유리해집니다.
        </p>
        <p>
          이 계산기는 지금 이 시점부터 정년까지 남은 기간 동안 새로 쌓이는
          퇴직급여만 비교합니다. 이미 근무한 기간에 대해 확정된 DB 권리는
          전환 여부와 무관하게 그대로 유지되므로 비교 대상에 포함하지
          않습니다.
        </p>
      </section>

      <AdSlot variant="content" />

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
        {/* TODO(운영자): DB→DC 전환 결정 경험담 문단 삽입 예정 */}
        <p>
          무엇보다 DB에서 DC로의 전환은 한 번 결정하면 되돌릴 수 없습니다.
          손익분기 수익률과 최적 전환 시점은 어디까지나 참고 지표이며, 실제
          전환 여부는 본인의 급여 전망, 위험 감수 성향, 남은 근속기간 등을
          종합적으로 고려해 신중하게 결정하시기 바랍니다.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-navy">자주 묻는 질문</h2>
        {FAQ_ITEMS.map((item) => (
          <div key={item.question}>
            <h3 className="font-medium text-navy">Q. {item.question}</h3>
            <p className="mt-1 text-navy/80">A. {item.answer}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
