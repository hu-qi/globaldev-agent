import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runGlobalDevAgent } from '../../../lib/agent';

const requestSchema = z.object({
  repoUrl: z.string().min(3)
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const result = await runGlobalDevAgent(body.repoUrl);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
