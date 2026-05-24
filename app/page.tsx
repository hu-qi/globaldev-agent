'use client';

import { FormEvent, useState } from 'react';

type LaunchKit = {
  repo: {
    name: string;
    url: string;
    description: string | null;
    language: string | null;
    stars: number;
    topics: string[];
  };
  timeline: Array<{ agent: string; status: string; summary: string }>;
  product: {
    category: string;
    coreValue: string;
    targetUsers: string[];
    differentiators: string[];
  };
  positioning: {
    oneLiner: string;
    narrative: string;
    personas: Array<{ name: string; need: string }>;
  };
  launchContent: {
    productHunt: string;
    hackerNews: string;
    reddit: string;
    xThread: string[];
    linkedin: string;
  };
  issueInsights: {
    themes: string[];
    concerns: string[];
    sourceIssueCount: number;
  };
  growthTasks: Array<{ title: string; priority: 'High' | 'Medium' | 'Low'; reason: string }>;
};

const sampleRepo = 'https://github.com/vercel/next.js';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{children}</span>;
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState(sampleRepo);
  const [kit, setKit] = useState<LaunchKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setKit(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze repository.');
      setKit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze repository.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-mist px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 grid gap-8 rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl md:grid-cols-[1.1fr_0.9fr] md:p-12">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">GlobalDev Agent</p>
            <h1 className="mb-5 text-4xl font-bold tracking-tight md:text-6xl">From README to Global Launch.</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Paste a GitHub repository URL. The agent reads the project, analyzes overseas positioning, generates platform-native launch content, clusters issue feedback, and turns insights into growth tasks.
            </p>
          </div>
          <form onSubmit={onSubmit} className="self-center rounded-3xl bg-white p-5 text-slate-950 shadow-2xl">
            <label className="mb-2 block text-sm font-medium text-slate-600">GitHub repository URL</label>
            <input
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/owner/repo"
              className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-500 transition focus:ring-4"
            />
            <button
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Agents are working...' : 'Generate Global Launch Kit'}
            </button>
            <p className="mt-3 text-xs text-slate-500">Works with public repos. Add GITHUB_TOKEN for higher rate limits.</p>
          </form>
        </header>

        {error && <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

        {!kit && !loading && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card title="1. Understand the repo">
              <p className="text-slate-600">Reads README, metadata, topics, language, stars, forks, and recent issues.</p>
            </Card>
            <Card title="2. Generate launch assets">
              <p className="text-slate-600">Creates Product Hunt, Hacker News, Reddit, X, and LinkedIn launch drafts.</p>
            </Card>
            <Card title="3. Convert feedback to tasks">
              <p className="text-slate-600">Clusters GitHub issue feedback and creates prioritized growth tasks.</p>
            </Card>
          </div>
        )}

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="font-medium text-slate-800">Running Repo Analyzer, Product Analyst, Market Agent, Content Agent, Feedback Agent, and Growth PM...</p>
          </div>
        )}

        {kit && (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <Card title="Repository Snapshot">
                <a href={kit.repo.url} target="_blank" className="text-xl font-bold text-blue-700 underline-offset-4 hover:underline">
                  {kit.repo.name}
                </a>
                <p className="mt-2 text-slate-600">{kit.repo.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Pill>{kit.repo.language || 'Unknown language'}</Pill>
                  <Pill>{kit.repo.stars} stars</Pill>
                  {kit.repo.topics.slice(0, 5).map((topic) => (
                    <Pill key={topic}>{topic}</Pill>
                  ))}
                </div>
              </Card>

              <Card title="Agent Timeline">
                <div className="space-y-4">
                  {kit.timeline.map((item) => (
                    <div key={item.agent} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">{item.agent}</h3>
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">completed</span>
                      </div>
                      <p className="text-sm text-slate-600">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Issue Insights">
                <p className="mb-3 text-sm text-slate-500">Based on {kit.issueInsights.sourceIssueCount} recent open issues.</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {kit.issueInsights.themes.map((theme) => (
                    <Pill key={theme}>{theme}</Pill>
                  ))}
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  {kit.issueInsights.concerns.map((concern) => (
                    <li key={concern}>• {concern}</li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Product & Positioning">
                <div className="mb-5 rounded-2xl bg-blue-50 p-4 text-blue-950">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">One-liner</p>
                  <p className="mt-1 text-xl font-bold">{kit.positioning.oneLiner}</p>
                </div>
                <p className="mb-5 leading-7 text-slate-700">{kit.positioning.narrative}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-semibold">Target users</h3>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {kit.product.targetUsers.map((user) => (
                        <li key={user}>• {user}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Differentiators</h3>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {kit.product.differentiators.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card title="Global Launch Content">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Product Hunt</h3>
                    <p className="mt-1 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{kit.launchContent.productHunt}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Hacker News</h3>
                    <p className="mt-1 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{kit.launchContent.hackerNews}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Reddit</h3>
                    <p className="mt-1 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{kit.launchContent.reddit}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">X Thread</h3>
                    <ol className="mt-1 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {kit.launchContent.xThread.map((tweet) => (
                        <li key={tweet}>{tweet}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </Card>

              <Card title="Growth Task Board">
                <div className="space-y-3">
                  {kit.growthTasks.map((task) => (
                    <div key={task.title} className="rounded-2xl border border-slate-100 p-4">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">{task.title}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{task.priority}</span>
                      </div>
                      <p className="text-sm text-slate-600">{task.reason}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
