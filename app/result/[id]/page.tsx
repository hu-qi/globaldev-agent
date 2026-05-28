import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { buildPrettyResultPath, getPublishedResult, isResultStoreConfigured } from '../../../lib/resultStore';

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (!isResultStoreConfigured()) {
    return {
      title: 'Result Pages Unavailable — GlobalDev Agent',
      robots: { index: false, follow: false },
      alternates: { canonical: `${siteUrl()}/result/${params.id}` }
    };
  }

  const result = await getPublishedResult(params.id);
  if (!result) {
    return {
      title: 'Result Not Found — GlobalDev Agent',
      robots: { index: false, follow: false },
      alternates: { canonical: `${siteUrl()}/result/${params.id}` }
    };
  }

  const canonical = `${siteUrl()}${buildPrettyResultPath(result.repoUrl, params.id)}`;
  const title = `${result.kit.repo.name} — Global Launch Kit`;
  const description = result.kit.positioning.oneLiner;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      publishedTime: result.createdAt
    },
    twitter: {
      card: 'summary',
      title,
      description
    }
  };
}

export default async function ResultPage({ params }: { params: { id: string } }) {
  if (!isResultStoreConfigured()) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-950">Result Pages Unavailable</h1>
        <p className="mt-3 text-slate-700">The result store is not configured.</p>
        <p className="mt-6">
          <Link href="/" className="font-semibold text-slate-950 underline">
            Back to home
          </Link>
        </p>
      </main>
    );
  }

  const result = await getPublishedResult(params.id);
  if (!result) notFound();

  permanentRedirect(buildPrettyResultPath(result.repoUrl, params.id));
}
