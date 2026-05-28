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

