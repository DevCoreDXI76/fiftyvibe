import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 피프티바이브",
  description: "피프티바이브 개인정보처리방침 및 쿠키 사용 안내.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "개인정보처리방침 | 피프티바이브",
    description: "피프티바이브 개인정보처리방침 및 쿠키 사용 안내.",
    url: "/privacy",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 text-navy">
      <h1 className="text-2xl font-bold">
        개인정보처리방침
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>

      <p>
        피프티바이브(이하 &ldquo;사이트&rdquo;)는 이용자의 개인정보를 중요하게
        생각하며, 관련 법령을 준수합니다. 본 방침은 사이트 이용에 적용됩니다.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">
          1. 수집하는 개인정보 항목 및 수집 방법
        </h2>
        <p>
          사이트는 회원가입, 게시판, 문의 폼 등 이용자가 직접 개인정보를
          입력하는 기능을 제공하지 않습니다. 계산기에 입력하는 값(퇴직급여,
          연봉 등)의 계산 자체는 이용자의 브라우저 내에서만 이루어지며, 이를
          저장·처리하는 서버를 별도로 운영하지 않습니다. 다만 일부 도구 간
          이동 시 입력값이 페이지 URL(쿼리 파라미터)에 담겨 전달될 수 있으며,
          이는 브라우저 기록이나 이동 경로(리퍼러)에 남을 수 있습니다. 사이트
          자체가 이 값을 별도로 수집·저장하지는 않습니다. localStorage,
          sessionStorage 등 브라우저 저장소도 사용하지 않습니다.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">2. 쿠키(Cookie)의 사용</h2>
        <p>
          사이트는 Google Analytics(GA4)를 통해 방문자 수, 페이지 조회 등
          통계 정보를 수집합니다. 이 과정에서 쿠키가 사용될 수 있으며, 수집되는
          정보는 개인을 식별할 수 없는 형태로 처리됩니다.
        </p>
        <p>
          향후 Google 애드센스 광고가 게재될 경우, Google 및 광고 파트너가
          관심기반 광고 제공을 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저
          설정에서 쿠키 저장을 거부할 수 있으며, 이 경우 일부 서비스 이용에
          제한이 있을 수 있습니다. Google의 광고 쿠키 관리는{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-amber"
          >
            Google 광고 설정
          </a>
          에서 가능합니다.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">3. 개인정보의 보유 및 이용기간</h2>
        <p>
          사이트는 이용자의 개인정보를 별도로 수집·저장하지 않으므로 보유기간이
          존재하지 않습니다. GA4를 통해 수집되는 통계 정보는 Google의 정책에
          따라 처리됩니다.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">4. 개인정보의 제3자 제공</h2>
        <p>
          사이트는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 GA4,
          애드센스 등 제휴 서비스 이용 과정에서 Google의 개인정보처리방침이
          별도로 적용될 수 있습니다.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">5. 이용자의 권리</h2>
        <p>
          이용자는 언제든지 브라우저 설정을 통해 쿠키 수집을 거부할 수
          있습니다. 개인정보 관련 문의는 아래 연락처로 하실 수 있습니다.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">6. 개인정보 보호책임자</h2>
        <p>성명: 홍길동</p>
        {/* TODO(운영자): 배포 전용 이메일 개설 후 연락처 직접 입력 */}
        <p className="text-navy/60">연락처: 배포 전 이메일 개설 후 채워야 합니다.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">7. 고지의 의무</h2>
        <p>
          이 방침의 내용은 법령·정책 변경에 따라 수정될 수 있으며, 변경 시 이
          페이지를 통해 공지합니다.
        </p>
      </section>

      {/* TODO(운영자): 실제 배포일로 시행일자 확정 */}
      <p className="text-sm text-navy/60">시행일자: 배포 시 확정 예정</p>
    </div>
  );
}
