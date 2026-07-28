import Link from "next/link";

const CHANNEL_LINKS = [
  {
    label: "유튜브",
    href: "https://www.youtube.com/channel/UCjhTmstRtldofVqiCG5-r5w",
  },
  { label: "네이버 블로그", href: "https://blog.naver.com/coredxi" },
];

const SITE_LINKS = [
  { label: "소개", href: "/about" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "문의", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="bg-navy-deep text-ivory">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm sm:flex-row sm:justify-between">
        <nav className="flex gap-4" aria-label="채널 링크">
          {CHANNEL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <nav className="flex gap-4" aria-label="사이트 링크">
          {SITE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-amber">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
