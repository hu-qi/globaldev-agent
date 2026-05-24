const baseUrl = process.env.GMI_BASE_URL || 'https://api.gmi-serving.com/v1';
const apiKey = process.env.GMI_API_KEY;
const model = process.env.GMI_MODEL || 'deepseek-ai/DeepSeek-V4-Pro';
const temperature = Number(process.env.GMI_TEMPERATURE || 0.4);

// Keep the live CI smoke test intentionally small. The application can use
// GMI_MAX_TOKENS=128000, but a connectivity/auth/model smoke test should not
// request a huge completion budget.
const maxTokens = Number(process.env.GMI_SMOKE_MAX_TOKENS || 128);

if (!apiKey) {
  console.log('GMI_API_KEY is not configured. Skipping live GMI Cloud smoke test.');
  process.exit(0);
}

const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

console.log('Starting GMI Cloud smoke test.');
console.log(`Endpoint: ${endpoint}`);
console.log(`Model: ${model}`);
console.log(`Smoke max tokens: ${maxTokens}`);

const payload = {
  model,
  messages: [
    {
      role: 'system',
      content: 'You are a CI smoke test. Return compact JSON only.'
    },
    {
      role: 'user',
      content: 'Return a JSON object with ok true, provider GMI Cloud Inference Engine, and scene globaldev-agent-ci.'
    }
  ],
  temperature,
  max_tokens: maxTokens,
  response_format: { type: 'json_object' },
  context_length_exceeded_behavior: 'truncate'
};

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`
  },
  body: JSON.stringify(payload)
});

if (!response.ok) {
  const detail = await response.text();
  console.error(`GMI smoke test failed with status ${response.status}.`);
  console.error('Request summary:');
  console.error(JSON.stringify({ model, temperature, max_tokens: maxTokens, endpoint }, null, 2));
  console.error('Response body preview:');
  console.error(detail.slice(0, 1200));
  process.exit(1);
}

const data = await response.json();
const content = data.choices?.[0]?.message?.content;

if (!content) {
  console.error('GMI smoke test failed: response did not contain choices[0].message.content.');
  console.error(JSON.stringify(data).slice(0, 1200));
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(content);
} catch {
  console.error('GMI smoke test failed: model response was not valid JSON.');
  console.error(content.slice(0, 1200));
  process.exit(1);
}

if (parsed.ok !== true) {
  console.error('GMI smoke test failed: JSON ok field was not true.');
  console.error(JSON.stringify(parsed).slice(0, 1200));
  process.exit(1);
}

console.log('GMI Cloud smoke test passed.');
console.log(`Scene: ${parsed.scene || 'globaldev-agent-ci'}`);
