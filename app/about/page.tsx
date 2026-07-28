import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개 | 피프티바이브",
  description:
    "50세 1인 개발자 피프티바이브가 퇴직연금 계산 도구를 만드는 이유.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "소개 | 피프티바이브",
    description: "50세 1인 개발자 피프티바이브가 퇴직연금 계산 도구를 만드는 이유.",
    url: "/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 text-navy">
      <h1 className="text-2xl font-bold">
        피프티바이브 소개
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>

      <p>
        안녕하세요, 피프티바이브입니다. 50세, IT 대기업에서 부장으로 일하고
        있습니다. 2027년 3월, 회사의 DB형 퇴직연금을 DC형으로 전환할
        예정입니다.
      </p>

      <p>
        퇴직을 준비하면서 가장 먼저 부딪힌 문제는 계산이었습니다. 퇴직금을
        받으면 세금이 얼마나 빠지는지, 일시금과 연금 중 무엇이 유리한지, DB에서
        DC로 전환해도 괜찮은지 — 검색해봐도 단편적인 정보뿐이었습니다. 그래서
        제가 필요한 계산기를 직접 만들기 시작했습니다.
      </p>

      <p>
        피프티바이브는 그 과정에서 만든 계산 도구 모음입니다. 특정 금융상품을
        추천하거나 투자를 권유하지 않습니다. 세법과 계산 공식에 근거한 숫자만
        보여드립니다.
      </p>

      {/* TODO(운영자): 경력, 구체적인 계기 등 추가 에피소드 삽입 가능 */}

      <p>
        도구를 만들고 검토하는 과정은 유튜브와 네이버 블로그에도 기록하고
        있습니다.
      </p>

      <div className="flex gap-4">
        <a
          href="https://www.youtube.com/channel/UCjhTmstRtldofVqiCG5-r5w"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-navy underline decoration-amber"
        >
          유튜브 →
        </a>
        <a
          href="https://blog.naver.com/coredxi"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-navy underline decoration-amber"
        >
          네이버 블로그 →
        </a>
      </div>
    </div>
  );
}
