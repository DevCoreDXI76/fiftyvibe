import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";

export const dynamic = "force-static";

const BASE_URL = "https://fiftyvibe.kr";

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/tools/severance-tax", priority: 0.9, changeFrequency: "monthly" },
  { path: "/tools/lump-vs-pension", priority: 0.9, changeFrequency: "monthly" },
  { path: "/tools/db-dc", priority: 0.9, changeFrequency: "monthly" },
  { path: "/guide", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const guideEntries: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${BASE_URL}/guide/${guide.slug}`,
    lastModified: guide.publishedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...guideEntries];
}
