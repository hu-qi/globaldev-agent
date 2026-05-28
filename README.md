# GlobalDev Agent

**From README to Global Launch.**

[中文说明 / README-zh](./README-zh.md)

GlobalDev Agent is an AI DevRel and growth agent for open-source projects, developer tools, and indie products going global. Paste a GitHub repository URL, and it generates a complete **Global Launch Kit**: product positioning, overseas developer personas, Product Hunt/Hacker News/Reddit/X launch content, issue insights, and prioritized growth tasks.

## Deploy to Vercel

Yes, this project can be deployed to Vercel as a standard Next.js app.

Recommended Vercel settings:

- Framework Preset: Next.js
- Install Command: `pnpm install --no-frozen-lockfile`
- Build Command: `pnpm build`
- Output Directory: Next.js default

Required Vercel environment variables:

```text
GMI_BASE_URL=https://api.gmi-serving.com/v1
GMI_API_KEY=your_new_gmi_cloud_api_key
GMI_MODEL=deepseek-ai/DeepSeek-V4-Pro
GMI_TEMPERATURE=0.4
GMI_MAX_TOKENS=128000
```

Optional environment variable:

```text
GITHUB_TOKEN=your_github_token
```

Never commit a real `GMI_API_KEY` to the repository. Configure it only in Vercel Environment Variables, local `.env.local`, or GitHub Actions Secrets.

## Competition requirement: GMI Cloud Inference Engine

This project explicitly calls **GMI Cloud Inference Engine** for all LLM reasoning and generation steps.

- Provider: GMI Cloud Inference Engine
- API style: OpenAI-compatible Chat Completions
- Endpoint: `https://api.gmi-serving.com/v1/chat/completions`
- API key variable: `GMI_API_KEY`
- Default model variable: `GMI_MODEL=deepseek-ai/DeepSeek-V4-Pro`
- Server-side only: the API key is read from `.env.local` and is never exposed to browser code

### API calling scenes

| Scene | Agent node | Input | Output |
|---|---|---|---|
| Product analysis | Product Analyst Agent | GitHub README, repo metadata, topics, language, stars | Product category, core value, target users, differentiators |
| Market positioning | Market Positioning Agent | Product analysis result | One-liner, narrative, overseas personas |
| Launch content | Content Agent | Positioning and repo context | Product Hunt, Hacker News, Reddit, X, LinkedIn drafts |
| Feedback intelligence | Feedback Agent | Recent GitHub Issues | Themes, concerns, adoption blockers |
| Growth execution | Growth PM Agent | All previous outputs | Prioritized growth task board |

### Parameter design

The app calls GMI Cloud with these parameters:

```json
{
  "model": "process.env.GMI_MODEL",
  "messages": [
    { "role": "system", "content": "GlobalDev Agent role and output rules" },
    { "role": "user", "content": "Repository snapshot and JSON schema request" }
  ],
  "temperature": 0.4,
  "max_tokens": 128000,
  "response_format": { "type": "json_object" },
  "context_length_exceeded_behavior": "truncate"
}
```

### Chain logic

```text
GitHub repository URL
        ↓
GitHub REST API fetches README, metadata, and recent issues
        ↓
Server-side API route /api/analyze builds a compact repository snapshot
        ↓
GMI Cloud Inference Engine generates structured Global Launch Kit JSON
        ↓
The app validates/parses the JSON and fills safe fallback fields when needed
        ↓
Frontend renders Agent Timeline, positioning, launch content, issue insights, and growth tasks
```

## CI verification

GitHub Actions runs a CI workflow on push, pull request, and manual dispatch.

The workflow performs:

1. Install dependencies with pnpm.
2. Run TypeScript typecheck.
3. Build the Next.js app.
4. Run a live GMI Cloud Inference Engine smoke test through `pnpm ci:gmi-smoke`.

Required repository secret:

```text
GMI_API_KEY
```

Optional repository secrets:

```text
GMI_BASE_URL
GMI_MODEL
```

The smoke test calls the same Chat Completions endpoint with a compact JSON response request. It verifies that the API key, endpoint, model name, JSON response format, and response parsing are all working. If `GMI_API_KEY` is missing, the smoke test exits successfully with a skip message so forked PRs do not fail because secrets are unavailable.

## Why this project

Many great developer products fail to reach global users because teams do not have a dedicated DevRel, growth, and community team. GlobalDev Agent turns a GitHub repository into an actionable launch plan.

## MVP workflow

```text
GitHub repository URL
        ↓
Repo Analyzer reads README and repository metadata
        ↓
Product Analyst Agent extracts product value and users
        ↓
Market Positioning Agent creates global positioning
        ↓
Content Agent generates platform-adapted launch content
        ↓
Feedback Agent analyzes GitHub issues and user pain points
        ↓
Growth PM Agent generates execution tasks
```

## Features

- Analyze a GitHub repository from `owner/repo` or full GitHub URL.
- Fetch README and repository metadata through the public GitHub REST API.
- Optionally fetch recent GitHub Issues when `GITHUB_TOKEN` is configured.
- Generate a Global Launch Kit through GMI Cloud Inference Engine.
- Uses GMI Cloud environment variables by default.
- Includes deterministic mock output when `GMI_API_KEY` is not configured, so local demos still work.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- GitHub REST API
- GMI Cloud Inference Engine

## Quick start

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000> and paste a GitHub repository URL.

## Environment variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

```env
# Optional, but recommended for fetching issues from private/high-rate GitHub usage
GITHUB_TOKEN=

# Required for competition submission: GMI Cloud Inference Engine
GMI_BASE_URL=https://api.gmi-serving.com/v1
GMI_API_KEY=
GMI_MODEL=deepseek-ai/DeepSeek-V4-Pro
GMI_TEMPERATURE=0.4
GMI_MAX_TOKENS=128000
```

When `GMI_API_KEY` is not set, the app returns a high-quality mocked Global Launch Kit for demo purposes. For the official competition demo and submitted deployment, configure `GMI_API_KEY` so all agent reasoning uses GMI Cloud Inference Engine.

## Demo script

1. Paste a public GitHub repository URL.
2. Click **Generate Global Launch Kit**.
3. Show the Agent timeline: Repo Analyzer → Product Analyst → Market Agent → Content Agent → Feedback Agent → Growth PM.
4. Present the generated launch kit and growth tasks.
5. Explain that the reasoning/generation step is served by GMI Cloud Inference Engine through `/api/analyze`.

## Competition pitch

> GlobalDev Agent turns a GitHub repository into a global launch plan. It helps Chinese developer tools and open-source projects understand their overseas positioning, generate platform-native launch content, analyze real GitHub feedback, and convert growth insights into product tasks. All reasoning and content generation are powered by GMI Cloud Inference Engine.

## Roadmap

- [x] Create GitHub Issues from generated growth tasks.
- [x] Add Product Hunt launch asset generator.
- [x] Add Reddit/Hacker News community rule checker.
- [x] Publishable result pages at `/result/<id>` (SSR + metadata + sitemap for SEO-ready UGC).
- [ ] Bulk-create issues from the entire task board.
- [ ] Configure issue labels / assignees / templates.
- [ ] Add GitCode repository support.
- [ ] Add feedback ingestion from Product Hunt, Reddit, Hacker News, and X.
