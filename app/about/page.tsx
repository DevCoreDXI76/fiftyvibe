import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "소개 | 피프티바이브",
  description:
    "50세 1인 개발자 피프티바이브가 퇴직연금 계산 도구를 만드는 이유와 계산 근거, 개인정보 처리 방침을 소개합니다.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "소개 | 피프티바이브",
    description:
      "50세 1인 개발자 피프티바이브가 퇴직연금 계산 도구를 만드는 이유와 계산 근거, 개인정보 처리 방침을 소개합니다.",
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
        이 사이트의 모든 계산기는 2026년 현재 시행 중인 소득세법을
        기준으로 하며, 홈택스 모의계산과 대조해 검증합니다. 세법이
        개정되면 계산 로직과 세율표도 함께 업데이트할 방침입니다.
      </p>

      <p>
        이 사이트의 모든 계산은 여러분의 브라우저 안에서만 실행되며,
        입력하신 정보는 서버로 전송되거나 저장되지 않습니다. 자세한
        내용은{" "}
        <Link
          href="/privacy"
          className="text-navy underline decoration-amber"
        >
          개인정보처리방침
        </Link>
        에서 확인하실 수 있습니다.
      </p>

      <p>
        문의는 devcoredxi00@coredxi.com으로 보내주시거나,{" "}
        <Link
          href="/contact"
          className="text-navy underline decoration-amber"
        >
          문의 페이지
        </Link>
        에 안내된 채널을 이용해주세요.
      </p>

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
