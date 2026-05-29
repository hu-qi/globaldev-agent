import { NextResponse } from 'next/server';
import { buildPrettyResultPath, isResultStoreConfigured, listPublishedResults } from '../../../lib/resultStore';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get('limit') ?? '6');
  const limit = Math.min(30, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 6));

  if (!isResultStoreConfigured()) {
    return NextResponse.json(
      { results: [] },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }

  const results = await listPublishedResults(limit);
  return NextResponse.json(
    {
      results: results.map((result) => ({
        id: result.id,
        createdAt: result.createdAt,
        path: buildPrettyResultPath(result.repoUrl, result.id),
        repoName: result.kit.repo.name,
        ownerAvatarUrl: result.kit.repo.ownerAvatarUrl ?? null,
        oneLiner: result.kit.positioning.oneLiner
      }))
    },
    {
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  );
}
