# Contributing to GlobalDev Agent

Thanks for your interest in contributing to GlobalDev Agent.

## Development setup

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000> and test the workflow with a GitHub repository URL.

## Environment variables

Create a local `.env.local` file from `.env.example`:

```bash
cp .env.example .env.local
```

Required for live LLM generation:

```env
GMI_BASE_URL=https://api.gmi-serving.com/v1
GMI_API_KEY=
GMI_MODEL=deepseek-ai/DeepSeek-V4-Pro
GMI_TEMPERATURE=0.4
GMI_MAX_TOKENS=128000
```

Optional for higher GitHub API rate limits and creating GitHub Issues:

```env
GITHUB_TOKEN=
```

Never commit real API keys or tokens.

## Suggested workflow

1. Create a feature branch.
2. Make focused changes.
3. Run local checks:

```bash
pnpm typecheck
pnpm build
```

4. Open a pull request with a clear description.

## Contribution areas

- Agent workflow improvements
- GitHub Issue creation flow
- GitCode repository support
- Product Hunt / Hacker News / Reddit feedback ingestion
- UI and demo experience improvements
- Documentation and competition material polish

## Commit style

Use short, descriptive commit messages, for example:

```text
feat: add GitHub issue creation flow
fix: handle missing README gracefully
docs: improve Vercel deployment guide
```
