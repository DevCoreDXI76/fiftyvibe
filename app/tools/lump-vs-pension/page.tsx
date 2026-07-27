import type { Metadata } from "next";
import { LumpVsPensionCalculator } from "@/components/lump-vs-pension-calculator";
import { AdSlot } from "@/components/ad-slot";

export const metadata: Metadata = {
  title: "퇴직금 일시금 vs 연금 수령 세금 비교 계산기 | 피프티바이브",
  description:
    "퇴직금을 일시금으로 받을 때와 연금으로 나눠 받을 때의 세금을 비교해보세요. 이연퇴직소득세 감면 혜택까지 반영한 절세액을 확인할 수 있습니다.",
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

const FAQ_ITEMS = [
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
    question: "연금으로 받으면 세금이 전혀 없나요?",
    answer:
      "아닙니다. 이연퇴직소득세(이 계산기가 비교하는 부분) 외에, 연금계좌 운용수익에 대한 별도의 연금소득세(3.3~5.5%)가 부과됩니다. 이 계산기는 운용수익분은 포함하지 않은 참고용 비교입니다.",
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

      <section className="flex flex-col gap-4 text-navy">
        <p>
          퇴직금을 일시금으로 한 번에 받을지, 연금으로 나눠 받을지는 세금
          측면에서 큰 차이를 만듭니다. 퇴직급여를 연금계좌에 넣고 나눠 받으면
          원래 부과됐을 퇴직소득세를 즉시 내지 않고 이연했다가, 실제 수령하는
          시점에 감면된 세율로 나눠 냅니다. 연금 수령 1년차부터 10년차까지는
          원래 세액의 70%만, 11년차부터는 60%만 부과되므로, 오래 나눠 받을수록
          유리한 구조입니다.
        </p>
        <p>
          이 계산기는 도구 1(퇴직소득세 계산기)에서 넘어온 퇴직급여와
          근속연수를 그대로 받아, 일시금으로 받았을 때의 총세금과 선택한
          수령기간(10·15·20년 또는 직접 입력) 동안 연금으로 나눠 받았을 때의
          총세금을 비교해 보여줍니다. 수령기간이 길수록, 그리고 11년차 이후
          구간이 포함될수록 절세 효과가 커지는 경향이 있습니다.
        </p>
      </section>

      <AdSlot variant="content" />

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
