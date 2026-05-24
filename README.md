# GlobalDev Agent

**From README to Global Launch.**

GlobalDev Agent is an AI DevRel and growth agent for open-source projects, developer tools, and indie products going global. Paste a GitHub repository URL, and it generates a complete **Global Launch Kit**: product positioning, overseas developer personas, Product Hunt/Hacker News/Reddit/X launch content, issue insights, and prioritized growth tasks.

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
- Generate a Global Launch Kit with an LLM-compatible client.
- Supports GMI Cloud / OpenAI-style chat completion endpoints through environment variables.
- Includes deterministic mock output when no LLM key is configured, so the demo still works.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- GitHub REST API
- OpenAI-compatible LLM API client for GMI Cloud or other providers

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
GITHUB_TOKEN=ghp_xxx

# OpenAI-compatible API endpoint. For GMI Cloud, replace with the endpoint provided by the competition docs.
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-xxx
LLM_MODEL=gpt-4o-mini
```

When `LLM_API_KEY` is not set, the app returns a high-quality mocked Global Launch Kit for demo purposes.

## Demo script

1. Paste a public GitHub repository URL.
2. Click **Generate Global Launch Kit**.
3. Show the Agent timeline: Repo Analyzer → Product Analyst → Market Agent → Content Agent → Feedback Agent → Growth PM.
4. Present the generated launch kit and growth tasks.
5. Explain how the next version can write tasks back to GitHub Issues.

## Competition pitch

> GlobalDev Agent turns a GitHub repository into a global launch plan. It helps Chinese developer tools and open-source projects understand their overseas positioning, generate platform-native launch content, analyze real GitHub feedback, and convert growth insights into product tasks.

## Roadmap

- [ ] Create GitHub Issues from generated growth tasks.
- [ ] Add Product Hunt launch asset generator.
- [ ] Add Reddit/Hacker News community rule checker.
- [ ] Add GitCode repository support.
- [ ] Add feedback ingestion from Product Hunt, Reddit, Hacker News, and X.
