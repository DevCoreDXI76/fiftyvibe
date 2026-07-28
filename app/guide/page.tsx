import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "가이드 | 피프티바이브",
  description: "퇴직연금, 퇴직소득세, DB/DC 전환에 관한 가이드 모음.",
  alternates: { canonical: "/guide" },
  openGraph: {
    title: "가이드 | 피프티바이브",
    description: "퇴직연금, 퇴직소득세, DB/DC 전환에 관한 가이드 모음.",
    url: "/guide",
    type: "website",
  },
};

export default function GuidePage() {
  return (
    <>
      <h1 className="text-2xl font-bold">
        가이드
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>
      <div className="flex flex-col gap-4">
        {GUIDES.map((guide) => (
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
    </>
  );
}
