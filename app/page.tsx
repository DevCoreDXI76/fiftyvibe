import type { Metadata } from "next";
import type { SVGProps } from "react";
import Link from "next/link";
import { HomeToolCard } from "@/components/home-tool-card";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "피프티바이브 — 퇴직연금 계산 도구",
  description:
    "50세 1인 개발자가 만드는 퇴직소득세·일시금 vs 연금·DB/DC 전환 계산 도구. 숫자만 입력하면 1분 안에 결과를 확인할 수 있습니다.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "피프티바이브 — 퇴직연금 계산 도구",
    description:
      "50세 1인 개발자가 만드는 퇴직소득세·일시금 vs 연금·DB/DC 전환 계산 도구.",
    url: "/",
    type: "website",
  },
};

function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-navy"
      aria-hidden="true"
      {...props}
    />
  );
}

function CalculatorIcon() {
  return (
    <IconBase>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <circle cx="8" cy="12" r="0.5" fill="currentColor" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
      <circle cx="16" cy="12" r="0.5" fill="currentColor" />
      <circle cx="8" cy="16" r="0.5" fill="currentColor" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
      <circle cx="16" cy="16" r="0.5" fill="currentColor" />
    </IconBase>
  );
}

function ScaleIcon() {
  return (
    <IconBase>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="5" y1="7" x2="19" y2="7" />
      <path d="M5 7 L2 13 a3 3 0 0 0 6 0 Z" />
      <path d="M19 7 L16 13 a3 3 0 0 0 6 0 Z" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </IconBase>
  );
}

function SwapIcon() {
  return (
    <IconBase>
      <path d="M4 7h13" />
      <path d="M14 4l3 3-3 3" />
      <path d="M20 17H7" />
      <path d="M10 20l-3-3 3-3" />
    </IconBase>
  );
}

const TOOL_CARDS = [
  {
    step: 1,
    icon: <CalculatorIcon />,
    title: "퇴직소득세 계산기",
    description: "퇴직금 실수령액이 궁금하다면",
    href: "/tools/severance-tax",
  },
  {
    step: 2,
    icon: <ScaleIcon />,
    title: "일시금 vs 연금 비교",
    description: "어떻게 받을지 고민된다면",
    href: "/tools/lump-vs-pension",
  },
  {
    step: 3,
    icon: <SwapIcon />,
    title: "DB/DC 전환 계산기",
    description: "DC 전환을 검토 중이라면",
    href: "/tools/db-dc",
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-navy py-16 text-ivory sm:py-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            피프티바이브
            <span className="brand-cursor" aria-hidden="true">
              ▮
            </span>
            <br />
            퇴직금, 세금 떼면 얼마 남을까
          </h1>
          <p className="max-w-xl text-base text-ivory/80 sm:text-lg">
            저도 2027년 3월 DB에서 DC로 전환합니다. 그 과정에 필요했던
            계산기를 직접 만들었습니다.
          </p>
          <p className="text-base font-medium text-amber sm:text-lg">
            숫자만 입력하면 1분 안에 끝나요.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 sm:grid-cols-3">
          {TOOL_CARDS.map((card) => (
            <HomeToolCard key={card.href} {...card} />
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy">최신 가이드</h2>
            <Link
              href="/guide"
              className="text-sm font-medium text-navy underline decoration-amber"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {GUIDES.slice(0, 3).map((guide) => (
              <Link
                key={guide.slug}
                href={`/guide/${guide.slug}`}
                className="rounded-lg border border-steel/30 bg-white p-6 transition hover:border-amber hover:shadow-md"
              >
                <p className="text-lg font-semibold text-navy">{guide.title}</p>
                <p className="mt-2 text-sm text-navy/70">{guide.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
