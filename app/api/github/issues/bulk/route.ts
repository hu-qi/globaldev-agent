import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createGrowthIssuesBulk } from '../../../../../lib/github';

const requestSchema = z.object({
  repoUrl: z.string().min(3),
  tasks: z
    .array(
      z.object({
        title: z.string().min(3),
        priority: z.enum(['High', 'Medium', 'Low']),
        reason: z.string().min(3)
      })
    )
    .min(1)
    .max(50)
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const results = await createGrowthIssuesBulk(body);
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

