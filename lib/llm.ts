export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type GmiCallTrace = {
  provider: 'GMI Cloud Inference Engine';
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
  responseFormat: 'json_object';
  scenes: string[];
};

const gmiBaseUrl = process.env.GMI_BASE_URL || 'https://api.gmi-serving.com/v1';
const gmiModel = process.env.GMI_MODEL || 'deepseek-ai/DeepSeek-V4-Pro';
const gmiTemperature = Number(process.env.GMI_TEMPERATURE || 0.4);
const gmiMaxTokens = Number(process.env.GMI_MAX_TOKENS || 128000);

export const gmiCallTrace: GmiCallTrace = {
  provider: 'GMI Cloud Inference Engine',
  endpoint: `${gmiBaseUrl}/chat/completions`,
  model: gmiModel,
  temperature: gmiTemperature,
  maxTokens: gmiMaxTokens,
  responseFormat: 'json_object',
  scenes: [
    'Product Analyst Agent analyzes GitHub README and repo metadata',
    'Market Positioning Agent creates overseas positioning and personas',
    'Content Agent generates Product Hunt, Hacker News, Reddit, X, and LinkedIn launch content',
    'Feedback Agent clusters GitHub Issues into user concerns',
    'Growth PM Agent converts insights into prioritized growth tasks'
  ]
};

export async function generateText(messages: ChatMessage[]): Promise<string | null> {
  const gmiKey = process.env.GMI_API_KEY;
  if (!gmiKey) return null;

  const response = await fetch(`${gmiBaseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${gmiKey}`
    },
    body: JSON.stringify({
      model: gmiModel,
      messages,
      temperature: gmiTemperature,
      max_tokens: gmiMaxTokens,
      response_format: { type: 'json_object' },
      context_length_exceeded_behavior: 'truncate'
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GMI Cloud request failed: ${response.status} ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? null;
}

export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  const fenced = value.match(/```json\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced || value;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
