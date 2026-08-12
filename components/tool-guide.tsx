import type { ReactNode } from "react";

export type ToolGuideSection = {
  id: string;
  title: string;
  children: ReactNode;
};

export type ToolGuideFaqItem = {
  question: string;
  answer: string;
};

export type ToolGuideProps = {
  sections: ToolGuideSection[];
  faqItems?: ToolGuideFaqItem[];
  faqHeading?: string;
};

export function ToolGuide({
  sections,
  faqItems,
  faqHeading = "자주 묻는 질문",
}: ToolGuideProps) {
  const hasFaq = Boolean(faqItems && faqItems.length > 0);

  const faqJsonLd = hasFaq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems!.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  return (
    <>
      {sections.map((section) => (
        <section key={section.id} className="flex flex-col gap-4 text-navy">
          <h2 className="text-xl font-bold text-navy">
            {section.title}
            <span className="brand-cursor" aria-hidden="true">
              ▮
            </span>
          </h2>
          {section.children}
        </section>
      ))}

      {hasFaq && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-navy">
            {faqHeading}
            <span className="brand-cursor" aria-hidden="true">
              ▮
            </span>
          </h2>
          <div className="flex flex-col gap-3">
            {faqItems!.map((item) => (
              <details
                key={item.question}
                className="group rounded border border-steel/30 bg-white p-4"
              >
                <summary className="cursor-pointer font-medium text-navy marker:text-amber">
                  {item.question}
                </summary>
                <p className="mt-2 text-navy/80">{item.answer}</p>
              </details>
            ))}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        </section>
      )}
    </>
  );
}
