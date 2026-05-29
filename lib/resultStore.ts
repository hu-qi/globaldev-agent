import type { LaunchKit } from './agent';

type UpstashResponse<T> = { result?: T; error?: string };

export type PublishedResult = {
  id: string;
  createdAt: string;
  repoUrl: string;
  kit: LaunchKit;
};

const PUBLISHED_INDEX_KEY = 'results:published';

function upstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return { url, token };
}

export function isResultStoreConfigured() {
  const { url, token } = upstashConfig();
  return Boolean(url && token);
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value);
}

async function upstashRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, token } = upstashConfig();
  if (!url || !token) {
    throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
  }

  const response = await fetch(`${url}/${path}`, {
    cache: 'no-store',
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {})
    }
  });

  const data = (await response.json()) as UpstashResponse<T>;
  if (!response.ok) {
    throw new Error(data.error || `Upstash request failed (${response.status})`);
  }
  if (data.error) {
    throw new Error(data.error);
  }
  return data.result as T;
}

export function generateResultId() {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 12);
}

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-|-$/g, '');
  return normalized || 'repo';
}

export function buildResultSlug(repoUrl: string) {
  try {
    const url = new URL(repoUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    const owner = segments[0] || '';
    const repo = segments[1] || '';
    const raw = owner && repo ? `${owner}-${repo}` : segments.slice(0, 2).join('-');
    return slugify(raw).slice(0, 60);
  } catch {
    const segments = repoUrl.split('/').filter(Boolean);
    const raw = segments.slice(-2).join('-');
    return slugify(raw).slice(0, 60);
  }
}

export function buildPrettyResultPath(repoUrl: string, id: string) {
  return `/r/${buildResultSlug(repoUrl)}-${id}`;
}

export function parsePrettyResultParam(param: string) {
  const lastDash = param.lastIndexOf('-');
  if (lastDash <= 0) return null;
  const id = param.slice(lastDash + 1);
  if (!/^[a-z0-9]{8,64}$/.test(id)) return null;
  return { id };
}

export async function storePublishedResult(result: PublishedResult) {
  const key = `result:${result.id}`;
  const body = JSON.stringify(result);

  await upstashRequest<string>(`set/${encodePathSegment(key)}`, {
    method: 'POST',
    body
  });

  const score = new Date(result.createdAt).getTime();
  await upstashRequest<number>(
    `zadd/${encodePathSegment(PUBLISHED_INDEX_KEY)}/${encodePathSegment(String(score))}/${encodePathSegment(result.id)}`
  );
}

export async function getPublishedResult(id: string): Promise<PublishedResult | null> {
  const key = `result:${id}`;
  const raw = await upstashRequest<string | null>(`get/${encodePathSegment(key)}`);
  if (!raw) return null;
  return JSON.parse(raw) as PublishedResult;
}

export async function listPublishedResultIds(limit: number) {
  const stop = Math.max(0, limit - 1);
  return upstashRequest<string[]>(
    `zrevrange/${encodePathSegment(PUBLISHED_INDEX_KEY)}/0/${encodePathSegment(String(stop))}`
  );
}

export async function listPublishedResults(limit: number) {
  const ids = await listPublishedResultIds(limit);
  const results: PublishedResult[] = [];
  for (const id of ids) {
    const result = await getPublishedResult(id);
    if (result) results.push(result);
  }
  return results;
}
