type ToolCTAProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
};

export function ToolCTA({ title, description, href, ctaLabel }: ToolCTAProps) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-steel/30 bg-white p-6 transition hover:border-amber hover:shadow-md"
    >
      <p className="text-lg font-semibold text-navy">{title}</p>
      <p className="mt-2 text-sm text-navy/70">{description}</p>
      <span className="mt-4 inline-block text-sm font-medium text-amber">
        {ctaLabel} →
      </span>
    </a>
  );
}
