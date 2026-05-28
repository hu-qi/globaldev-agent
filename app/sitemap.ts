import type { MetadataRoute } from 'next';
import { isResultStoreConfigured, listPublishedResultIds } from '../lib/resultStore';

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isResultStoreConfigured()) return [];

  const base = siteUrl();
  const ids = await listPublishedResultIds(5000);

  return ids.map((id) => ({
    url: `${base}/result/${id}`
  }));
}

