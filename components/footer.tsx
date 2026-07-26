const CHANNEL_LINKS = [
  {
    label: "유튜브",
    href: "https://www.youtube.com/channel/UCjhTmstRtldofVqiCG5-r5w",
  },
  { label: "네이버 블로그", href: "https://blog.naver.com/coredxi" },
];

const POLICY_LINKS = [
  { label: "개인정보처리방침", href: "#" },
  { label: "문의", href: "#" },
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
        <nav className="flex gap-4" aria-label="정책 링크">
          {POLICY_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-amber">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
