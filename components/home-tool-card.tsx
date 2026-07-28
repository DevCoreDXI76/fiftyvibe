"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

type HomeToolCardProps = {
  step: number;
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
};

export function HomeToolCard({
  step,
  icon,
  title,
  description,
  href,
}: HomeToolCardProps) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent("tool_cross_link", { from: "home", to: href })}
      className="flex flex-col gap-3 rounded-lg border border-steel/30 bg-white p-6 transition hover:border-amber hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs font-bold text-ivory">
          {step}
        </span>
        {icon}
      </div>
      <p className="text-lg font-semibold text-navy">{title}</p>
      <p className="text-sm text-navy/70">{description}</p>
    </Link>
  );
}
