import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의 | 피프티바이브",
  description: "피프티바이브에 문의하는 방법.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "문의 | 피프티바이브",
    description: "피프티바이브에 문의하는 방법.",
    url: "/contact",
    type: "website",
  },
};

const CHANNELS = [
  {
    label: "유튜브",
    description: "제작 과정과 사용법을 영상으로 확인하세요.",
    href: "https://www.youtube.com/channel/UCjhTmstRtldofVqiCG5-r5w",
  },
  {
    label: "네이버 블로그",
    description: "더 자세한 글과 후기를 볼 수 있습니다.",
    href: "https://blog.naver.com/coredxi",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 text-navy">
      <h1 className="text-2xl font-bold">
        문의하기
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>

      <p>
        피프티바이브는 별도의 문의 폼을 운영하지 않습니다. 아래 채널을 통해
        소통하고 있으니 편하게 연락해 주세요.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        {CHANNELS.map((channel) => (
          <a
            key={channel.href}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg border border-steel/30 bg-white p-6 transition hover:border-amber hover:shadow-md"
          >
            <p className="text-lg font-semibold text-navy">{channel.label}</p>
            <p className="mt-2 text-sm text-navy/70">{channel.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
