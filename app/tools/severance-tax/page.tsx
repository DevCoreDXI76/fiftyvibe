import type { Metadata } from "next";
import { SeveranceTaxCalculator } from "@/components/severance-tax-calculator";
import { AdSlot } from "@/components/ad-slot";

export const metadata: Metadata = {
  title: "퇴직소득세 계산기 (2026) — 퇴직금 실수령액 세후 계산 | 피프티바이브",
  description:
    "퇴직금 실수령액과 세금을 미리 계산해보세요. 근속연수공제부터 지방소득세까지 계산 과정을 단계별로 확인할 수 있습니다.",
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

const FAQ_ITEMS = [
  {
    question: "근속연수는 어떻게 계산하나요?",
    answer:
      "입사일부터 퇴사일까지의 기간을 연 단위로 계산하며, 1년 미만의 기간이 있으면 그 부분은 1년으로 올려서 계산합니다. 예를 들어 9년 3개월을 근무했다면 근속연수는 10년으로 처리됩니다.",
  },
  {
    question: "왜 근속연수가 짧으면 세금이 더 많이 나오나요?",
    answer:
      "계산 과정에서 퇴직급여를 근속연수로 나눈 뒤 12를 곱해 1년치로 환산한 소득(환산급여)을 구하는 단계가 있습니다. 근속연수가 짧을수록 이 환산급여가 커져서 더 높은 세율 구간이 적용되기 때문입니다. 짧은 근속을 반복하며 세금을 회피하는 것을 막기 위한 제도적 장치입니다.",
  },
  {
    question: "이 계산기 결과와 실제 회사에서 지급하는 금액이 다를 수 있나요?",
    answer:
      "네, 다를 수 있습니다. 이 계산기는 소득세법에 규정된 퇴직소득세 계산 공식을 기준으로 하지만, 실제 원천징수 시 단수처리(원 단위 반올림·절사) 방식이나 회사의 급여 시스템에 따라 소액의 차이가 발생할 수 있습니다. 정확한 금액은 반드시 홈택스 모의계산이나 세무 전문가를 통해 확인하세요.",
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

      <section className="flex flex-col gap-4 text-navy">
        <p>
          퇴직금을 한 번에 받을 때 부과되는 퇴직소득세는 일반 근로소득세와는 다른
          방식으로 계산됩니다. 근속연수가 길수록, 그리고 퇴직급여가 근속연수에
          비해 과도하게 크지 않을수록 세금 부담이 줄어드는 구조인데, 이는
          퇴직금을 오랜 기간 일한 대가를 한 번에 정산받는 소득으로 보고
          누진세율의 충격을 완화하기 위한 장치입니다.
        </p>
        <p>
          계산은 크게 세 단계로 나뉩니다. 첫째, 근속연수에 비례한
          근속연수공제를 퇴직급여에서 뺍니다. 근속연수가 길수록 공제액이
          커집니다. 둘째, 남은 금액을 근속연수로 나눈 뒤 12를 곱해 환산급여라는
          1년치 환산 소득을 만듭니다. 이 환산 과정 때문에 근속연수가
          짧을수록(예: 1~2년) 환산급여가 급격히 커져서 더 높은 세율 구간이
          적용되는 효과가 생깁니다. 짧은 근속을 반복하며 퇴직금을 나눠 받는
          방식으로 세금을 피하는 것을 막기 위한 설계입니다. 셋째, 환산급여에서
          다시 환산급여공제를 뺀 과세표준에 일반 소득세와 같은 누진세율을
          적용해 세액을 구한 뒤, 다시 근속연수 비율만큼 되돌려 최종
          퇴직소득세를 산출합니다.
        </p>
      </section>

      <AdSlot variant="content" />

      <section className="flex flex-col gap-4 text-navy">
        <p>
          여기에 퇴직소득세의 10%에 해당하는 지방소득세가 추가로 부과되며, 두
          세금을 뺀 나머지가 실제로 통장에 들어오는 실수령액입니다.
        </p>
        <p>
          이 계산기에 퇴직급여 총액과 근속연수(또는 입사일·퇴사일)를 입력하면
          실수령액과 예상 세금을 바로 확인할 수 있고, 계산 과정 보기를 펼치면
          근속연수공제부터 지방소득세까지 7단계 계산 과정을 각각 얼마인지
          확인할 수 있습니다. 근속연수가 애매하거나 여러 시나리오를 비교하고
          싶다면 숫자를 바꿔가며 여러 번 계산해보는 것을 추천합니다.
        </p>
        {/* TODO(운영자): DB→DC 전환 준비 경험담 문단 삽입 예정 */}
        <p>
          이 계산기는 소득세법(§48, §55, §64의4)에 규정된 공식을 그대로
          구현했습니다. 다만 세부 단수처리(원 단위 반올림·절사 규칙)는 홈택스
          모의계산 결과와 최종 대조 중이므로, 정확한 금액은 반드시 홈택스
          모의계산이나 세무 전문가를 통해 다시 한번 확인하시기 바랍니다.
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
