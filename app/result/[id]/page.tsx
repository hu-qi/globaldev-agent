import Link from 'next/link';
import { getPublishedResult, isResultStoreConfigured } from '../../../lib/resultStore';

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
  if (!result) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-950">Result Not Found</h1>
        <p className="mt-3 text-slate-700">This result id does not exist.</p>
        <p className="mt-6">
          <Link href="/" className="font-semibold text-slate-950 underline">
            Back to home
          </Link>
        </p>
      </main>
    );
  }

  const { kit } = result;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">{kit.repo.name}</h1>
          <p className="mt-2 text-slate-700">{kit.positioning.oneLiner}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={kit.repo.url} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
            GitHub Repo
          </a>
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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Launch Drafts</h2>
          <div className="mt-4 space-y-5 text-sm text-slate-700">
            <div>
              <h3 className="font-semibold text-slate-950">Product Hunt</h3>
              <p className="mt-2 whitespace-pre-wrap">{kit.launchContent.productHunt}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-950">Hacker News</h3>
              <p className="mt-2 whitespace-pre-wrap">{kit.launchContent.hackerNews}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-950">Reddit</h3>
              <p className="mt-2 whitespace-pre-wrap">{kit.launchContent.reddit}</p>
            </div>
          </div>
        </div>
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

      <p className="mt-10 text-sm text-slate-500">Published at {new Date(result.createdAt).toLocaleString()}</p>
    </main>
  );
}

