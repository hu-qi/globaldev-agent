import Link from 'next/link';
import { buildPrettyResultPath, isResultStoreConfigured, listPublishedResults } from '../../lib/resultStore';

export default async function ResultsPage() {
  if (!isResultStoreConfigured()) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-950">Results</h1>
        <p className="mt-3 text-slate-700">The result store is not configured.</p>
        <p className="mt-6">
          <Link href="/" className="font-semibold text-slate-950 underline">
            Back to home
          </Link>
        </p>
      </main>
    );
  }

  const results = await listPublishedResults(30);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-950">Latest Results</h1>
        <Link href="/" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          Generate new
        </Link>
      </div>

      <ul className="mt-8 space-y-4">
        {results.map((result) => (
          <li key={result.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{result.kit.repo.name}</h2>
                <p className="mt-2 text-sm text-slate-700">{result.kit.positioning.oneLiner}</p>
                <p className="mt-3 text-xs text-slate-500">{new Date(result.createdAt).toLocaleString()}</p>
              </div>
              <Link
                href={buildPrettyResultPath(result.repoUrl, result.id)}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800"
              >
                Open
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
