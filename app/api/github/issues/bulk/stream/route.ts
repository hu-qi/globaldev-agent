import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BulkIssueProgressEvent, createGrowthIssuesBulkWithProgress } from '../../../../../../lib/github';

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

type StreamEvent =
  | { type: 'progress'; at: string; event: BulkIssueProgressEvent }
  | { type: 'done'; at: string }
  | { type: 'error'; at: string; message: string };

function toSse(event: StreamEvent) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request) {
  let parsedBody: z.infer<typeof requestSchema> | null = null;
  try {
    parsedBody = requestSchema.parse(await request.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
  if (!parsedBody) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const body = parsedBody;

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: StreamEvent) => controller.enqueue(encoder.encode(toSse(event)));

      try {
        await createGrowthIssuesBulkWithProgress(
          { repoUrl: body.repoUrl, tasks: body.tasks },
          {
            onEvent: (event) => send({ type: 'progress', at: new Date().toISOString(), event })
          }
        );
        send({ type: 'done', at: new Date().toISOString() });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        send({ type: 'error', at: new Date().toISOString(), message });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}
