import type { MetadataRoute } from 'next';
import { buildPrettyResultPath, isResultStoreConfigured, listPublishedResults } from '../lib/resultStore';

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isResultStoreConfigured()) return [];

  const base = siteUrl();
  const results = await listPublishedResults(5000);

  return results.map((result) => ({
    url: `${base}${buildPrettyResultPath(result.repoUrl, result.id)}`
  }));
}
