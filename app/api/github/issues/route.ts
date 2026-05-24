import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createGrowthIssue } from '../../../../lib/github';

const requestSchema = z.object({
  repoUrl: z.string().min(3),
  title: z.string().min(3),
  priority: z.enum(['High', 'Medium', 'Low']),
  reason: z.string().min(3)
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const issue = await createGrowthIssue(body);
    return NextResponse.json({ issue });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
