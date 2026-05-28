import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  buildPrettyResultPath,
  buildResultSlug,
  getPublishedResult,
  isResultStoreConfigured,
  listPublishedResults,
  parsePrettyResultParam
} from '../../../lib/resultStore';
import { ResultHeaderActions, ResultLaunchDraftsCard } from '../../result/[id]/result-client';

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function generateMetadata({ params }: { params: { slugId: string } }): Promise<Metadata> {
  const parsed = parsePrettyResultParam(params.slugId);
  if (!parsed) {
    return {
      title: 'Result Not Found — GlobalDev Agent',
      robots: { index: false, follow: false },
      alternates: { canonical: `${siteUrl()}/r/${params.slugId}` }
    };
  }

  if (!isResultStoreConfigured()) {
    return {
      title: 'Result Pages Unavailable — GlobalDev Agent',
      robots: { index: false, follow: false },
      alternates: { canonical: `${siteUrl()}/r/${params.slugId}` }
    };
  }

  const result = await getPublishedResult(parsed.id);
  if (!result) {
    return {
      title: 'Result Not Found — GlobalDev Agent',
      robots: { index: false, follow: false },
      alternates: { canonical: `${siteUrl()}/r/${params.slugId}` }
    };
  }

  const canonicalPath = buildPrettyResultPath(result.repoUrl, parsed.id);
  const canonical = `${siteUrl()}${canonicalPath}`;
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

export default async function PrettyResultPage({ params }: { params: { slugId: string } }) {
  const parsed = parsePrettyResultParam(params.slugId);
  if (!parsed) notFound();

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

  const result = await getPublishedResult(parsed.id);
  if (!result) notFound();

  const expectedParam = `${buildResultSlug(result.repoUrl)}-${parsed.id}`;
  if (expectedParam !== params.slugId) {
    permanentRedirect(`/r/${expectedParam}`);
  }

  const { kit } = result;
  const latest = (await listPublishedResults(8)).filter((item) => item.id !== parsed.id).slice(0, 3);
  const canonicalPath = buildPrettyResultPath(result.repoUrl, parsed.id);
  const canonical = `${siteUrl()}${canonicalPath}`;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">{kit.repo.name}</h1>
          <p className="mt-2 text-slate-700">{kit.positioning.oneLiner}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href={kit.repo.url} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
            GitHub Repo
          </a>
          <Link href="/results" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
            Browse results
          </Link>
          <ResultHeaderActions />
          <Link href="/" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            Generate yours
          </Link>
        </div>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Product & Positioning</h2>
          <p className="mt-4 text-sm text-slate-700">{kit.product.coreValue}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-700">
            <span className="rounded-full bg-slate-100 px-3 py-1">{kit.product.category}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{kit.repo.stars} stars</span>
          </div>
          <h3 className="mt-6 font-semibold text-slate-950">Differentiators</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {kit.product.differentiators.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <ResultLaunchDraftsCard
          repoUrl={kit.repo.url}
          repoName={kit.repo.name}
          oneLiner={kit.positioning.oneLiner}
          launchContent={kit.launchContent}
        />
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Growth Tasks</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {kit.growthTasks.map((task) => (
            <li key={task.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-950">{task.title}</h3>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {task.priority}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{task.reason}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Share</h2>
            <p className="mt-2 text-sm text-slate-700">
              Share this UGC result page, or fork the repo link above to post directly on platforms.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ResultHeaderActions />
            <a
              href={canonical}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
            >
              Open
            </a>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="break-all font-mono text-xs text-slate-700">{canonical}</p>
        </div>
      </section>

      {latest.length > 0 && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-950">More Results</h2>
            <Link href="/results" className="text-sm font-semibold text-slate-950 underline underline-offset-4">
              View all
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {latest.map((item) => (
              <li key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{item.kit.repo.name}</p>
                <p className="mt-2 text-sm text-slate-700">{item.kit.positioning.oneLiner}</p>
                <Link
                  href={buildPrettyResultPath(item.repoUrl, item.id)}
                  className="mt-3 inline-block text-sm font-semibold text-slate-950 underline underline-offset-4"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${kit.repo.name} — Global Launch Kit`,
            description: kit.positioning.oneLiner,
            url: canonical,
            datePublished: result.createdAt,
            author: { '@type': 'Organization', name: 'GlobalDev Agent' }
          })
        }}
      />

      <p className="mt-10 text-sm text-slate-500">Published at {new Date(result.createdAt).toLocaleString()}</p>
    </main>
  );
}

