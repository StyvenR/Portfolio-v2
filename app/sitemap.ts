import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/#projets`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/#a-propos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/#contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];
}
