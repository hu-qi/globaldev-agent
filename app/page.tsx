'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type GrowthTask = {
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
};

type CreatedIssue = {
  number: number;
  title: string;
  url: string;
};

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
  productHuntAssets: {
    tagline: string;
    shortDescription: string;
    firstComment: string;
    keyFeatures: string[];
    faq: Array<{ question: string; answer: string }>;
    galleryCaptions: string[];
  };
  communityChecks: {
    hackerNews: { risks: string[]; rewrite: string; checklist: string[] };
    reddit: { risks: string[]; rewrite: string; checklist: string[] };
  };
  issueInsights: {
    themes: string[];
    concerns: string[];
    sourceIssueCount: number;
  };
  growthTasks: GrowthTask[];
  result?: { id: string; url: string };
};

const sampleRepo = 'https://github.com/hu-qi/globaldev-agent';

type PublicResultPreview = {
  id: string;
  createdAt: string;
  path: string;
  repoName: string;
  oneLiner: string;
};

function Card({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{children}</span>;
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1.5 text-sm font-semibold transition',
        active ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  children,
  disabled,
  tone
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  tone?: 'neutral' | 'success' | 'danger';
}) {
  const toneClass =
    tone === 'success'
      ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
      : tone === 'danger'
        ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={['inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60', toneClass].join(' ')}
    >
      {children}
    </button>
  );
}

function PlatformIcon({ platform }: { platform: 'productHunt' | 'hackerNews' | 'reddit' | 'x' | 'linkedin' }) {
  if (platform === 'x') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.901 1.153h3.68l-8.04 9.19 9.46 12.504h-7.41l-5.81-7.59-6.64 7.59H.46l8.6-9.84L0 1.153h7.6l5.25 6.95 6.05-6.95Zm-1.29 19.49h2.04L6.49 3.24H4.3l13.31 17.4Z" />
      </svg>
    );
  }

  if (platform === 'productHunt') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#FF6154" />
        <path
          d="M8 6h5.1c3 0 4.9 1.9 4.9 4.6 0 2.8-1.9 4.6-4.9 4.6H11v3.2H8V6Zm3 2.6v4.6h1.9c1.4 0 2.2-.9 2.2-2.3 0-1.4-.8-2.3-2.2-2.3H11Z"
          fill="white"
        />
      </svg>
    );
  }

  if (platform === 'hackerNews') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF6600" />
        <path
          d="M8.6 7.2h2.2l1.2 2.6c.2.4.4 1 .6 1.4.2-.4.4-1 .6-1.4l1.2-2.6h2.2l-3 5.8V17h-2v-4l-3-5.8Z"
          fill="white"
        />
      </svg>
    );
  }

  if (platform === 'linkedin') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2" />
        <path
          d="M7.2 10.1H9.6V17H7.2v-6.9Zm1.2-3.1a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM11.1 10.1h2.3v.9h.1c.3-.6 1.1-1.1 2.3-1.1 2.5 0 3 1.6 3 3.7V17h-2.4v-3.1c0-.7 0-1.7-1.1-1.7s-1.2.8-1.2 1.7V17h-2.4v-6.9Z"
          fill="white"
        />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#FF4500" />
      <path
        d="M17.8 12.4c.1.4.2.9.2 1.4 0 2.9-2.7 5.2-6 5.2s-6-2.3-6-5.2c0-.5.1-1 .2-1.4.8.6 2 .9 3.4 1 .6.1 1 .6 1 1.2v.2c.1.8.7 1.4 1.4 1.4s1.3-.6 1.4-1.4v-.2c0-.6.4-1.1 1-1.2 1.4-.1 2.6-.4 3.4-1Z"
        fill="white"
        opacity="0.9"
      />
      <circle cx="9.5" cy="12.3" r="1" fill="white" />
      <circle cx="14.5" cy="12.3" r="1" fill="white" />
      <path d="M10.2 14.9c.5.5 1.1.8 1.8.8s1.3-.3 1.8-.8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 5h5v5m0-5-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M19 14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

async function writeClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.width = '1px';
  textarea.style.height = '1px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!ok) throw new Error('Copy failed');
}

function truncateForUrl(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return value.slice(0, Math.max(0, maxLength - 1)) + '…';
}

function buildIntentUrl(input: {
  platform: 'x' | 'reddit' | 'linkedin' | 'hackerNews' | 'productHunt';
  repoUrl: string;
  title?: string;
  text?: string;
}) {
  const encodedUrl = encodeURIComponent(input.repoUrl);

  if (input.platform === 'x') {
    const text = truncateForUrl(input.text || '', 260);
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`;
  }

  if (input.platform === 'reddit') {
    const title = truncateForUrl(input.title || '', 290);
    const text = truncateForUrl(input.text || '', 1800);
    return `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
  }

  if (input.platform === 'linkedin') {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  }

  if (input.platform === 'hackerNews') {
    const title = truncateForUrl(input.title || '', 120);
    return `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodeURIComponent(title)}`;
  }

  return 'https://www.producthunt.com/posts/new';
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState(sampleRepo);
  const [kit, setKit] = useState<LaunchKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestResults, setLatestResults] = useState<PublicResultPreview[] | null>(null);
  const [latestResultsError, setLatestResultsError] = useState(false);
  const [creatingIssueTitle, setCreatingIssueTitle] = useState<string | null>(null);
  const [createdIssues, setCreatedIssues] = useState<Record<string, CreatedIssue>>({});
  const [issueError, setIssueError] = useState<string | null>(null);
  const [selectedTaskTitles, setSelectedTaskTitles] = useState<string[]>([]);
  const [bulkIssueProgress, setBulkIssueProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkIssueStats, setBulkIssueStats] = useState<{ created: number; skipped: number; failed: number } | null>(null);
  const [bulkCreatingIssues, setBulkCreatingIssues] = useState(false);
  const [rightPanel, setRightPanel] = useState<'launch' | 'ph' | 'rules' | 'tasks'>('launch');
  const [launchChannel, setLaunchChannel] = useState<'productHunt' | 'hackerNews' | 'reddit' | 'xThread' | 'linkedin'>('productHunt');
  const [communityChannel, setCommunityChannel] = useState<'hackerNews' | 'reddit'>('hackerNews');
  const [copyState, setCopyState] = useState<{ key: string; status: 'copied' | 'error' } | null>(null);
  const [xReplyNextIndex, setXReplyNextIndex] = useState(1);
  const abortRef = useRef<AbortController | null>(null);
  const [loadingStartedAt, setLoadingStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [stages, setStages] = useState<{
    repo: 'pending' | 'running' | 'done';
    llm: 'pending' | 'running' | 'done';
    publish: 'pending' | 'running' | 'done' | 'skipped';
  }>({ repo: 'pending', llm: 'pending', publish: 'pending' });

  useEffect(() => {
    if (!copyState) return;
    const timer = window.setTimeout(() => setCopyState(null), 1500);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  useEffect(() => {
    if (kit || loading) return;
    if (latestResults || latestResultsError) return;
    let alive = true;

    void fetch('/api/results?limit=6')
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Failed to load results.');
        return (data.results || []) as PublicResultPreview[];
      })
      .then((results) => {
        if (!alive) return;
        setLatestResults(results);
      })
      .catch(() => {
        if (!alive) return;
        setLatestResultsError(true);
      });

    return () => {
      alive = false;
    };
  }, [kit, latestResults, latestResultsError, loading]);

  useEffect(() => {
    if (launchChannel !== 'xThread') {
      setXReplyNextIndex(1);
      return;
    }
    setXReplyNextIndex(1);
  }, [launchChannel, kit]);

  useEffect(() => {
    if (!loading || !loadingStartedAt) return;
    setElapsedMs(Date.now() - loadingStartedAt);
    const timer = window.setInterval(() => setElapsedMs(Date.now() - loadingStartedAt), 250);
    return () => window.clearInterval(timer);
  }, [loading, loadingStartedAt]);

  function formatElapsed(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function cancelRun() {
    abortRef.current?.abort();
  }

  function stageProgress() {
    const values = [stages.repo, stages.llm, stages.publish === 'skipped' ? 'done' : stages.publish];
    const completed = values.filter((value) => value === 'done').length;
    const total = values.length;
    const runningBoost = values.some((value) => value === 'running') ? 0.1 : 0;
    return Math.min(0.98, completed / total + runningBoost);
  }

  const activeLaunchText = useMemo(() => {
    if (!kit) return '';
    if (launchChannel === 'productHunt') return kit.launchContent.productHunt;
    if (launchChannel === 'hackerNews') return kit.launchContent.hackerNews;
    if (launchChannel === 'reddit') return kit.launchContent.reddit;
    if (launchChannel === 'linkedin') return kit.launchContent.linkedin;
    return kit.launchContent.xThread.join('\n');
  }, [kit, launchChannel]);

  const activeLaunchPlatform = useMemo(() => {
    if (launchChannel === 'xThread') return 'x' as const;
    if (launchChannel === 'linkedin') return 'linkedin' as const;
    return launchChannel as 'productHunt' | 'hackerNews' | 'reddit';
  }, [launchChannel]);

  const xReplyBadge = useMemo(() => {
    if (!kit || activeLaunchPlatform !== 'x') return null;
    const total = kit.launchContent.xThread.length;
    if (total <= 1) return null;
    const next = Math.min(Math.max(1, xReplyNextIndex), total - 1) + 1;
    return `${next}/${total}`;
  }, [activeLaunchPlatform, kit, xReplyNextIndex]);

  async function onCopy(key: string, text: string) {
    try {
      await writeClipboard(text);
      setCopyState({ key, status: 'copied' });
    } catch {
      setCopyState({ key, status: 'error' });
    }
  }

  function openPublish(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function copyTone(key: string) {
    if (copyState?.key !== key) return 'neutral' as const;
    return copyState.status === 'copied' ? ('success' as const) : ('danger' as const);
  }

  function copyHint(key: string) {
    if (copyState?.key !== key) return null;
    return (
      <span className={['rounded-full px-2 py-1 text-xs font-semibold', copyState.status === 'copied' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'].join(' ')}>
        {copyState.status === 'copied' ? 'Copied' : 'Copy failed'}
      </span>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    setIssueError(null);
    setCreatedIssues({});
    setSelectedTaskTitles([]);
    setBulkIssueProgress(null);
    setBulkIssueStats(null);
    setBulkCreatingIssues(false);
    setKit(null);
    setLoadingStartedAt(Date.now());
    setElapsedMs(0);
    setStages({ repo: 'pending', llm: 'pending', publish: 'pending' });

    try {
      const response = await fetch('/api/analyze/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
        signal: abortRef.current.signal
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to analyze repository.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const line = part
            .split('\n')
            .map((item) => item.trim())
            .find((item) => item.startsWith('data: '));
          if (!line) continue;

          const payload = JSON.parse(line.slice('data: '.length)) as
            | { type: 'stage'; name: 'repo' | 'llm' | 'publish'; status: 'start' | 'done' }
            | { type: 'result'; kit: LaunchKit }
            | { type: 'error'; message: string };

          if (payload.type === 'stage') {
            setStages((current) => {
              const next = { ...current };
              if (payload.name === 'repo') next.repo = payload.status === 'start' ? 'running' : 'done';
              if (payload.name === 'llm') next.llm = payload.status === 'start' ? 'running' : 'done';
              if (payload.name === 'publish') next.publish = payload.status === 'start' ? 'running' : 'done';
              return next;
            });
          }

          if (payload.type === 'error') {
            throw new Error(payload.message || 'Failed to analyze repository.');
          }

          if (payload.type === 'result') {
            setKit(payload.kit);
            setStages((current) => (current.publish === 'pending' ? { ...current, publish: 'skipped' } : current));
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Cancelled.');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to analyze repository.');
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  async function createGitHubIssue(task: GrowthTask) {
    setCreatingIssueTitle(task.title);
    setIssueError(null);

    try {
      const response = await fetch('/api/github/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          title: task.title,
          priority: task.priority,
          reason: task.reason
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create GitHub Issue.');
      setCreatedIssues((current) => ({ ...current, [task.title]: data.issue }));
    } catch (err) {
      setIssueError(err instanceof Error ? err.message : 'Failed to create GitHub Issue.');
    } finally {
      setCreatingIssueTitle(null);
    }
  }

  function toggleTaskSelected(title: string) {
    setSelectedTaskTitles((current) => (current.includes(title) ? current.filter((item) => item !== title) : [...current, title]));
  }

  function setAllTasksSelected(titles: string[]) {
    setSelectedTaskTitles((current) => (current.length === titles.length ? [] : titles));
  }

  async function createGitHubIssuesBulk(tasks: GrowthTask[]) {
    if (tasks.length === 0) return;
    setBulkCreatingIssues(true);
    setIssueError(null);
    setBulkIssueProgress({ done: 0, total: tasks.length });
    setBulkIssueStats({ created: 0, skipped: 0, failed: 0 });

    try {
      const streamResponse = await fetch('/api/github/issues/bulk/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          tasks: tasks.map((task) => ({ title: task.title, priority: task.priority, reason: task.reason }))
        })
      });

      if (streamResponse.ok && streamResponse.body) {
        const reader = streamResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          buffer += decoder.decode(chunk.value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const line = part
              .split('\n')
              .map((item) => item.trim())
              .find((item) => item.startsWith('data: '));
            if (!line) continue;

            const payload = JSON.parse(line.slice('data: '.length)) as
              | { type: 'progress'; event: { type: 'start'; total: number } }
              | {
                  type: 'progress';
                  event: {
                    type: 'item';
                    index: number;
                    total: number;
                    result:
                      | { title: string; status: 'created'; issue: CreatedIssue }
                      | { title: string; status: 'skipped'; reason: string }
                      | { title: string; status: 'failed'; error: string };
                  };
                }
              | { type: 'done' }
              | { type: 'error'; message: string };

            if (payload.type === 'error') {
              throw new Error(payload.message || 'Failed to create GitHub Issues.');
            }

            if (payload.type === 'progress' && payload.event.type === 'start') {
              setBulkIssueProgress({ done: 0, total: payload.event.total });
            }

            if (payload.type === 'progress' && payload.event.type === 'item') {
              setBulkIssueProgress({ done: payload.event.index + 1, total: payload.event.total });
              const result = payload.event.result;
              if (result.status === 'created') {
                setCreatedIssues((current) => ({ ...current, [result.title]: result.issue }));
                setBulkIssueStats((current) => (current ? { ...current, created: current.created + 1 } : current));
              }
              if (result.status === 'skipped') {
                setBulkIssueStats((current) => (current ? { ...current, skipped: current.skipped + 1 } : current));
              }
              if (result.status === 'failed') {
                setBulkIssueStats((current) => (current ? { ...current, failed: current.failed + 1 } : current));
              }
            }
          }
        }

        setSelectedTaskTitles([]);
        return;
      }

      const response = await fetch('/api/github/issues/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          tasks: tasks.map((task) => ({ title: task.title, priority: task.priority, reason: task.reason }))
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create GitHub Issues.');

      const results = (data.results || []) as Array<
        | { title: string; status: 'created'; issue: CreatedIssue }
        | { title: string; status: 'skipped'; reason: string }
        | { title: string; status: 'failed'; error: string }
      >;

      const created = results.filter((item) => item.status === 'created') as Array<{ title: string; status: 'created'; issue: CreatedIssue }>;
      const failed = results.filter((item) => item.status === 'failed') as Array<{ title: string; status: 'failed'; error: string }>;

      if (created.length > 0) {
        setCreatedIssues((current) => {
          const next = { ...current };
          for (const item of created) {
            next[item.title] = item.issue;
          }
          return next;
        });
      }

      if (failed.length > 0) {
        setIssueError(`Failed to create ${failed.length} issue(s).`);
      }

      setBulkIssueProgress({ done: tasks.length, total: tasks.length });
      setBulkIssueStats({ created: created.length, skipped: results.filter((item) => item.status === 'skipped').length, failed: failed.length });
      setSelectedTaskTitles([]);
    } catch (err) {
      setIssueError(err instanceof Error ? err.message : 'Failed to create GitHub Issues.');
    } finally {
      setBulkCreatingIssues(false);
      window.setTimeout(() => setBulkIssueProgress(null), 1200);
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
              Paste a GitHub repository URL. The agent reads the project, analyzes overseas positioning, generates platform-native launch content, clusters issue feedback, and turns insights into GitHub Issues.
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
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>Configure GMI_API_KEY and GITHUB_TOKEN on Vercel for the full live workflow.</span>
              <a href="/results" className="font-semibold text-slate-950 underline underline-offset-4">
                Browse results
              </a>
            </div>
          </form>
        </header>

        {error && <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {issueError && <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{issueError}</div>}

        {!kit && !loading && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card title="1. Understand the repo">
                <p className="text-slate-600">Reads README, metadata, topics, language, stars, forks, and recent issues.</p>
              </Card>
              <Card title="2. Generate launch assets">
                <p className="text-slate-600">Creates Product Hunt, Hacker News, Reddit, X, and LinkedIn launch drafts.</p>
              </Card>
              <Card title="3. Convert feedback to issues">
                <p className="text-slate-600">Clusters feedback into growth tasks and writes selected tasks back to GitHub Issues.</p>
              </Card>
            </div>

            <Card
              title="Public Results"
              actions={
                <a href="/results" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200">
                  View all
                </a>
              }
            >
              {latestResults && latestResults.length > 0 ? (
                <div className="space-y-3">
                  {latestResults.map((result) => (
                    <div key={result.id} className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{result.repoName}</p>
                        <p className="mt-1 text-sm text-slate-700">{result.oneLiner}</p>
                        <p className="mt-2 text-xs text-slate-500">{new Date(result.createdAt).toLocaleString()}</p>
                      </div>
                      <a
                        href={result.path}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
                      >
                        Open
                      </a>
                    </div>
                  ))}
                </div>
              ) : latestResultsError ? (
                <p className="text-sm text-slate-600">Unable to load results right now.</p>
              ) : latestResults ? (
                <p className="text-sm text-slate-600">No public results yet.</p>
              ) : (
                <p className="text-sm text-slate-600">Loading results…</p>
              )}
            </Card>
          </div>
        )}

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <div className="mx-auto max-w-xl">
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">
                  Elapsed {formatElapsed(elapsedMs)}
                </span>
                <span className="text-slate-500">Typical: 15–60s (depends on repo size and GitHub rate limits)</span>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>
                    {stages.llm === 'done' ? 'Finalizing...' : stages.repo === 'running' ? 'Fetching repo snapshot...' : stages.llm === 'running' ? 'Generating launch kit...' : 'Starting...'}
                  </span>
                  <button
                    type="button"
                    onClick={cancelRun}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-[width]"
                    style={{ width: `${Math.floor(Math.max(0.02, stageProgress()) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-2 text-left text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Repo snapshot</span>
                  <span className="font-semibold text-slate-600">{stages.repo}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Launch kit generation</span>
                  <span className="font-semibold text-slate-600">{stages.llm}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Publish result page</span>
                  <span className="font-semibold text-slate-600">{stages.publish}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {kit && (
          <div className="grid gap-6">
            <Card
              title="Shareable Result Link"
              actions={
                kit.result ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {copyHint('result-link')}
                    <IconButton
                      label="Copy link"
                      tone={copyTone('result-link')}
                      onClick={() => {
                        if (!kit.result) return;
                        const absolute = new URL(kit.result.url, window.location.origin).toString();
                        void onCopy('result-link', absolute);
                      }}
                    >
                      <ExternalLinkIcon />
                    </IconButton>
                    <a
                      href={kit.result.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Open
                    </a>
                  </div>
                ) : (
                  <a href="/results" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
                    View public results
                  </a>
                )
              }
            >
              {kit.result ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <span className="break-all font-mono">{new URL(kit.result.url, window.location.origin).toString()}</span>
                </div>
              ) : (
                <p className="text-sm text-slate-600">Configure Upstash to publish an SEO-friendly result page at /r/&lt;owner-repo&gt;-&lt;id&gt;.</p>
              )}
            </Card>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <Card title="Repository Snapshot">
                <a href={kit.repo.url} target="_blank" className="text-xl font-bold text-blue-700 underline-offset-4 hover:underline">
                  {kit.repo.name}
                </a>
                {kit.result && (
                  <p className="mt-2">
                    <a
                      href={kit.result.url}
                      target="_blank"
                      className="text-sm font-semibold text-slate-950 underline underline-offset-4"
                    >
                      Open published result
                    </a>
                  </p>
                )}
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

              <div className="sticky top-6 z-10 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <TabButton active={rightPanel === 'launch'} onClick={() => setRightPanel('launch')}>
                    Launch Content
                  </TabButton>
                  <TabButton active={rightPanel === 'ph'} onClick={() => setRightPanel('ph')}>
                    Product Hunt
                  </TabButton>
                  <TabButton active={rightPanel === 'rules'} onClick={() => setRightPanel('rules')}>
                    Rule Check
                  </TabButton>
                  <TabButton active={rightPanel === 'tasks'} onClick={() => setRightPanel('tasks')}>
                    Tasks
                  </TabButton>
                </div>
              </div>

              {rightPanel === 'launch' && (
                <Card
                  title="Global Launch Content"
                  actions={
                    <div className="flex items-center gap-2">
                      {copyHint('launch')}
                      {copyHint('launch-next')}
                      {activeLaunchPlatform === 'x' && xReplyBadge && (
                        <span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">Next {xReplyBadge}</span>
                      )}
                      <IconButton label="Copy" tone={copyTone('launch')} onClick={() => onCopy('launch', activeLaunchText)}>
                        <PlatformIcon platform={activeLaunchPlatform} />
                      </IconButton>
                      {activeLaunchPlatform === 'x' && (
                        <IconButton
                          label="Copy next"
                          tone={copyTone('launch-next')}
                          onClick={() => {
                            if (!kit) return;
                            const total = kit.launchContent.xThread.length;
                            if (total <= 1) return;
                            const index = Math.min(Math.max(1, xReplyNextIndex), total - 1);
                            const tweet = kit.launchContent.xThread[index];
                            setXReplyNextIndex(index + 1 >= total ? 1 : index + 1);
                            void onCopy('launch-next', tweet);
                          }}
                        >
                          <ArrowRightIcon />
                        </IconButton>
                      )}
                      <IconButton
                        label="Publish"
                        onClick={() => {
                          const hnTitle = `Show HN: ${kit.repo.name} — ${kit.repo.description || 'a developer tool'}`;
                          const redditTitle = `${kit.repo.name}: ${kit.positioning.oneLiner}`;
                          const url = buildIntentUrl({
                            platform:
                              activeLaunchPlatform === 'productHunt'
                                ? 'productHunt'
                                : activeLaunchPlatform === 'hackerNews'
                                  ? 'hackerNews'
                                  : activeLaunchPlatform === 'reddit'
                                    ? 'reddit'
                                    : activeLaunchPlatform === 'linkedin'
                                      ? 'linkedin'
                                      : 'x',
                            repoUrl: kit.repo.url,
                            title: activeLaunchPlatform === 'hackerNews' ? hnTitle : activeLaunchPlatform === 'reddit' ? redditTitle : undefined,
                            text:
                              activeLaunchPlatform === 'x'
                                ? kit.launchContent.xThread[0]
                                : activeLaunchPlatform === 'reddit'
                                  ? activeLaunchText
                                  : undefined
                          });
                          openPublish(url);
                          if (activeLaunchPlatform === 'x') {
                            if (kit.launchContent.xThread.length > 1) {
                              setXReplyNextIndex(2);
                              void onCopy('launch-next', kit.launchContent.xThread[1]);
                            }
                            return;
                          }
                          void onCopy('launch', activeLaunchText);
                        }}
                      >
                        <ExternalLinkIcon />
                      </IconButton>
                    </div>
                  }
                >
                  <div className="mb-4 flex flex-wrap gap-2">
                    <TabButton active={launchChannel === 'productHunt'} onClick={() => setLaunchChannel('productHunt')}>
                      Product Hunt
                    </TabButton>
                    <TabButton active={launchChannel === 'hackerNews'} onClick={() => setLaunchChannel('hackerNews')}>
                      Hacker News
                    </TabButton>
                    <TabButton active={launchChannel === 'reddit'} onClick={() => setLaunchChannel('reddit')}>
                      Reddit
                    </TabButton>
                    <TabButton active={launchChannel === 'xThread'} onClick={() => setLaunchChannel('xThread')}>
                      X Thread
                    </TabButton>
                    <TabButton active={launchChannel === 'linkedin'} onClick={() => setLaunchChannel('linkedin')}>
                      LinkedIn
                    </TabButton>
                  </div>

                  {launchChannel === 'productHunt' && <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{kit.launchContent.productHunt}</p>}
                  {launchChannel === 'hackerNews' && (
                    <p className="whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{kit.launchContent.hackerNews}</p>
                  )}
                  {launchChannel === 'reddit' && <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{kit.launchContent.reddit}</p>}
                  {launchChannel === 'xThread' && (
                    <ol className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {kit.launchContent.xThread.map((tweet) => (
                        <li key={tweet}>{tweet}</li>
                      ))}
                    </ol>
                  )}
                  {launchChannel === 'linkedin' && <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{kit.launchContent.linkedin}</p>}
                </Card>
              )}

              {rightPanel === 'ph' && (
                <Card
                  title="Product Hunt Asset Pack"
                  actions={
                    <div className="flex items-center gap-2">
                      {copyHint('ph')}
                      <IconButton
                        label="Copy"
                        tone={copyTone('ph')}
                        onClick={() => {
                          const text = [
                            `Tagline: ${kit.productHuntAssets.tagline}`,
                            '',
                            `Short description: ${kit.productHuntAssets.shortDescription}`,
                            '',
                            'First comment:',
                            kit.productHuntAssets.firstComment,
                            '',
                            'Key features:',
                            ...kit.productHuntAssets.keyFeatures.map((item) => `- ${item}`),
                            '',
                            'FAQ:',
                            ...kit.productHuntAssets.faq.flatMap((item) => [`Q: ${item.question}`, `A: ${item.answer}`, '']),
                            'Gallery captions:',
                            ...kit.productHuntAssets.galleryCaptions.map((item) => `- ${item}`)
                          ].join('\n');
                          return onCopy('ph', text);
                        }}
                      >
                        <PlatformIcon platform="productHunt" />
                      </IconButton>
                      <IconButton
                        label="Publish"
                        onClick={() => {
                          openPublish(buildIntentUrl({ platform: 'productHunt', repoUrl: kit.repo.url }));
                          void onCopy('ph', [kit.productHuntAssets.tagline, '', kit.productHuntAssets.shortDescription, '', kit.productHuntAssets.firstComment].join('\n'));
                        }}
                      >
                        <ExternalLinkIcon />
                      </IconButton>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">Tagline</h3>
                      <p className="mt-1 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{kit.productHuntAssets.tagline}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Short description</h3>
                      <p className="mt-1 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{kit.productHuntAssets.shortDescription}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">First comment</h3>
                      <p className="mt-1 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{kit.productHuntAssets.firstComment}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Key features</h3>
                      <ul className="mt-1 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        {kit.productHuntAssets.keyFeatures.map((feature) => (
                          <li key={feature}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">FAQ</h3>
                      <div className="mt-1 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        {kit.productHuntAssets.faq.map((item) => (
                          <div key={item.question}>
                            <p className="font-semibold text-slate-900">{item.question}</p>
                            <p className="text-slate-700">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Gallery captions</h3>
                      <ul className="mt-1 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        {kit.productHuntAssets.galleryCaptions.map((caption) => (
                          <li key={caption}>• {caption}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {rightPanel === 'rules' && (
                <Card
                  title="Community Rule Check"
                  actions={
                    <div className="flex items-center gap-2">
                      {copyHint('rules')}
                      <IconButton
                        label="Copy"
                        tone={copyTone('rules')}
                        onClick={() =>
                          onCopy('rules', communityChannel === 'hackerNews' ? kit.communityChecks.hackerNews.rewrite : kit.communityChecks.reddit.rewrite)
                        }
                      >
                        <PlatformIcon platform={communityChannel === 'hackerNews' ? 'hackerNews' : 'reddit'} />
                      </IconButton>
                      <IconButton
                        label="Publish"
                        onClick={() => {
                          const url =
                            communityChannel === 'hackerNews'
                              ? buildIntentUrl({
                                  platform: 'hackerNews',
                                  repoUrl: kit.repo.url,
                                  title: `Show HN: ${kit.repo.name} — ${kit.repo.description || 'a developer tool'}`
                                })
                              : buildIntentUrl({
                                  platform: 'reddit',
                                  repoUrl: kit.repo.url,
                                  title: `${kit.repo.name}: ${kit.positioning.oneLiner}`,
                                  text: kit.communityChecks.reddit.rewrite
                                });
                          openPublish(url);
                          void onCopy('rules', communityChannel === 'hackerNews' ? kit.communityChecks.hackerNews.rewrite : kit.communityChecks.reddit.rewrite);
                        }}
                      >
                        <ExternalLinkIcon />
                      </IconButton>
                    </div>
                  }
                >
                  <div className="mb-4 flex flex-wrap gap-2">
                    <TabButton active={communityChannel === 'hackerNews'} onClick={() => setCommunityChannel('hackerNews')}>
                      Hacker News
                    </TabButton>
                    <TabButton active={communityChannel === 'reddit'} onClick={() => setCommunityChannel('reddit')}>
                      Reddit
                    </TabButton>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Risks</p>
                      <ul className="mt-1 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        {(communityChannel === 'hackerNews' ? kit.communityChecks.hackerNews.risks : kit.communityChecks.reddit.risks).map((risk) => (
                          <li key={risk}>• {risk}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Suggested rewrite</p>
                      <p className="mt-1 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        {communityChannel === 'hackerNews' ? kit.communityChecks.hackerNews.rewrite : kit.communityChecks.reddit.rewrite}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Checklist</p>
                      <ul className="mt-1 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        {(communityChannel === 'hackerNews' ? kit.communityChecks.hackerNews.checklist : kit.communityChecks.reddit.checklist).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {rightPanel === 'tasks' && (
                <Card title="Growth Task Board">
                  <p className="mb-4 text-sm text-slate-500">Select tasks and write them back to the target repository as GitHub Issues.</p>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const selectable = kit.growthTasks.filter((task) => !createdIssues[task.title]).map((task) => task.title);
                          setAllTasksSelected(selectable);
                        }}
                        disabled={bulkCreatingIssues || Boolean(creatingIssueTitle)}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTaskTitles([])}
                        disabled={bulkCreatingIssues || Boolean(creatingIssueTitle)}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Clear
                      </button>
                      <span className="rounded-full bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
                        {selectedTaskTitles.length} selected
                      </span>
                      {bulkIssueProgress && (
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                          {bulkIssueProgress.done}/{bulkIssueProgress.total}
                        </span>
                      )}
                      {bulkIssueStats && (
                        <span className="rounded-full bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
                          {bulkIssueStats.created} created · {bulkIssueStats.skipped} skipped · {bulkIssueStats.failed} failed
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const selected = kit.growthTasks.filter((task) => selectedTaskTitles.includes(task.title) && !createdIssues[task.title]);
                        void createGitHubIssuesBulk(selected);
                      }}
                      disabled={bulkCreatingIssues || selectedTaskTitles.length === 0 || Boolean(creatingIssueTitle)}
                      className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {bulkCreatingIssues ? 'Creating issues...' : `Create selected (${selectedTaskTitles.length})`}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {kit.growthTasks.map((task) => {
                      const created = createdIssues[task.title];
                      const isCreating = creatingIssueTitle === task.title;
                      const selected = selectedTaskTitles.includes(task.title);
                      return (
                        <div key={task.title} className="rounded-2xl border border-slate-100 p-4">
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleTaskSelected(task.title)}
                                disabled={Boolean(created) || bulkCreatingIssues || Boolean(creatingIssueTitle)}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950"
                              />
                              <h3 className="font-semibold text-slate-900">{task.title}</h3>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{task.priority}</span>
                          </div>
                          <p className="mb-4 text-sm text-slate-600">{task.reason}</p>
                          {created ? (
                            <a
                              href={created.url}
                              target="_blank"
                              className="inline-flex rounded-xl bg-green-100 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-200"
                            >
                              Open GitHub Issue #{created.number}
                            </a>
                          ) : (
                            <button
                              onClick={() => createGitHubIssue(task)}
                              disabled={Boolean(creatingIssueTitle)}
                              className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isCreating ? 'Creating issue...' : 'Create GitHub Issue'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </main>
  );
}
