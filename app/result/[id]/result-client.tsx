'use client';

import { useEffect, useMemo, useState } from 'react';

type LaunchContent = {
  productHunt: string;
  hackerNews: string;
  reddit: string;
  xThread: string[];
  linkedin: string;
};

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
      className={[
        'inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60',
        toneClass
      ].join(' ')}
    >
      {children}
    </button>
  );
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

async function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
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

function Toast({ message, tone, visible }: { message: string; tone: 'success' | 'danger'; visible: boolean }) {
  return (
    <div
      aria-live="polite"
      className={[
        'pointer-events-none fixed right-5 top-5 z-50 transition-all',
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      ].join(' ')}
    >
      <div
        className={[
          'rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg',
          tone === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'
        ].join(' ')}
      >
        {message}
      </div>
    </div>
  );
}

export function ResultHeaderActions() {
  const [copyState, setCopyState] = useState<'copied' | 'error' | null>(null);

  useEffect(() => {
    if (!copyState) return;
    const timer = window.setTimeout(() => setCopyState(null), 1500);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  async function copyResultLink() {
    try {
      await writeClipboard(window.location.href);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toast message={copyState === 'copied' ? 'Link copied' : 'Copy failed'} tone={copyState === 'copied' ? 'success' : 'danger'} visible={Boolean(copyState)} />
      <button
        type="button"
        onClick={copyResultLink}
        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
      >
        Copy link
      </button>
    </div>
  );
}

export function ResultLaunchDraftsCard({
  repoUrl,
  repoName,
  oneLiner,
  launchContent
}: {
  repoUrl: string;
  repoName: string;
  oneLiner: string;
  launchContent: LaunchContent;
}) {
  const [channel, setChannel] = useState<'productHunt' | 'hackerNews' | 'reddit' | 'xThread' | 'linkedin'>('productHunt');
  const [copyState, setCopyState] = useState<'copied' | 'error' | null>(null);

  useEffect(() => {
    if (!copyState) return;
    const timer = window.setTimeout(() => setCopyState(null), 1500);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const activeText = useMemo(() => {
    if (channel === 'productHunt') return launchContent.productHunt;
    if (channel === 'hackerNews') return launchContent.hackerNews;
    if (channel === 'reddit') return launchContent.reddit;
    if (channel === 'linkedin') return launchContent.linkedin;
    return launchContent.xThread.join('\n');
  }, [channel, launchContent]);

  const activePlatform = useMemo(() => {
    if (channel === 'xThread') return 'x' as const;
    if (channel === 'linkedin') return 'linkedin' as const;
    return channel as 'productHunt' | 'hackerNews' | 'reddit';
  }, [channel]);

  async function onCopy() {
    try {
      await writeClipboard(activeText);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  }

  function onPublish() {
    const hnTitle = `Show HN: ${repoName} — ${oneLiner}`;
    const redditTitle = `${repoName}: ${oneLiner}`;
    const url = buildIntentUrl({
      platform:
        activePlatform === 'productHunt'
          ? 'productHunt'
          : activePlatform === 'hackerNews'
            ? 'hackerNews'
            : activePlatform === 'reddit'
              ? 'reddit'
              : activePlatform === 'linkedin'
                ? 'linkedin'
                : 'x',
      repoUrl,
      title: activePlatform === 'hackerNews' ? hnTitle : activePlatform === 'reddit' ? redditTitle : undefined,
      text: activePlatform === 'x' ? launchContent.xThread[0] : activePlatform === 'reddit' ? activeText : undefined
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    void onCopy();
  }

  const copyTone = copyState === 'copied' ? ('success' as const) : copyState === 'error' ? ('danger' as const) : ('neutral' as const);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">Launch Drafts</h2>
        <div className="flex items-center gap-2">
          {copyState && (
            <span
              className={[
                'rounded-full px-2 py-1 text-xs font-semibold',
                copyState === 'copied' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              ].join(' ')}
            >
              {copyState === 'copied' ? 'Copied' : 'Copy failed'}
            </span>
          )}
          <IconButton label="Copy" tone={copyTone} onClick={onCopy}>
            <PlatformIcon platform={activePlatform} />
          </IconButton>
          <IconButton label="Publish" onClick={onPublish}>
            <ExternalLinkIcon />
          </IconButton>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <TabButton active={channel === 'productHunt'} onClick={() => setChannel('productHunt')}>
          Product Hunt
        </TabButton>
        <TabButton active={channel === 'hackerNews'} onClick={() => setChannel('hackerNews')}>
          Hacker News
        </TabButton>
        <TabButton active={channel === 'reddit'} onClick={() => setChannel('reddit')}>
          Reddit
        </TabButton>
        <TabButton active={channel === 'xThread'} onClick={() => setChannel('xThread')}>
          X Thread
        </TabButton>
        <TabButton active={channel === 'linkedin'} onClick={() => setChannel('linkedin')}>
          LinkedIn
        </TabButton>
      </div>

      {channel === 'productHunt' && <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{launchContent.productHunt}</p>}
      {channel === 'hackerNews' && (
        <p className="whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{launchContent.hackerNews}</p>
      )}
      {channel === 'reddit' && <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{launchContent.reddit}</p>}
      {channel === 'xThread' && (
        <ol className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {launchContent.xThread.map((tweet) => (
            <li key={tweet}>{tweet}</li>
          ))}
        </ol>
      )}
      {channel === 'linkedin' && <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{launchContent.linkedin}</p>}
    </section>
  );
}
