import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runGlobalDevAgentWithProgress } from '../../../../lib/agent';
import { buildPrettyResultPath, generateResultId, isResultStoreConfigured, storePublishedResult } from '../../../../lib/resultStore';

const requestSchema = z.object({
  repoUrl: z.string().min(3)
});

type StreamEvent =
  | { type: 'stage'; name: 'repo' | 'llm' | 'publish'; status: 'start' | 'done'; at: string }
  | { type: 'result'; at: string; kit: unknown }
  | { type: 'error'; at: string; message: string };

function toSse(event: StreamEvent) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request) {
  let repoUrl = '';

  try {
    const body = requestSchema.parse(await request.json());
    repoUrl = body.repoUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: StreamEvent) => controller.enqueue(encoder.encode(toSse(event)));

      try {
        const kit = await runGlobalDevAgentWithProgress(repoUrl, {
          onStage: ({ name, status }) => send({ type: 'stage', name, status, at: new Date().toISOString() })
        });

        let publishedKit = kit;
        if (isResultStoreConfigured()) {
          send({ type: 'stage', name: 'publish', status: 'start', at: new Date().toISOString() });
          const id = generateResultId();
          const url = buildPrettyResultPath(repoUrl, id);
          const createdAt = new Date().toISOString();
          publishedKit = { ...kit, result: { id, url } };
          await storePublishedResult({ id, createdAt, repoUrl, kit: publishedKit });
          send({ type: 'stage', name: 'publish', status: 'done', at: new Date().toISOString() });
        }

        send({ type: 'result', at: new Date().toISOString(), kit: publishedKit });
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
