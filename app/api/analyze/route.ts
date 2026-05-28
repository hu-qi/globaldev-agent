import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runGlobalDevAgent } from '../../../lib/agent';
import { generateResultId, isResultStoreConfigured, storePublishedResult } from '../../../lib/resultStore';

const requestSchema = z.object({
  repoUrl: z.string().min(3)
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const kit = await runGlobalDevAgent(body.repoUrl);

    if (!isResultStoreConfigured()) {
      return NextResponse.json(kit);
    }

    const id = generateResultId();
    const url = `/result/${id}`;
    const createdAt = new Date().toISOString();
    const publishedKit = { ...kit, result: { id, url } };
    await storePublishedResult({ id, createdAt, repoUrl: body.repoUrl, kit: publishedKit });

    return NextResponse.json(publishedKit);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
