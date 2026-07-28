import Link from "next/link";
import { GUIDES, RELATED_GUIDES } from "@/lib/guides";

type RelatedGuidesProps = {
  tool: keyof typeof RELATED_GUIDES;
};

export function RelatedGuides({ tool }: RelatedGuidesProps) {
  const slugs = RELATED_GUIDES[tool];
  const guides = slugs
    .map((slug) => GUIDES.find((guide) => guide.slug === slug))
    .filter((guide): guide is (typeof GUIDES)[number] => guide !== undefined);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold text-navy">관련 가이드</h2>
      <ul className="flex flex-col gap-2">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guide/${guide.slug}`}
              className="text-navy underline decoration-amber"
            >
              {guide.title} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
