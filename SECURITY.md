# Security Policy

## Secrets and API keys

GlobalDev Agent uses server-side environment variables for external API access.

Sensitive values include:

```text
GMI_API_KEY
GITHUB_TOKEN
```

Do not commit these values to GitHub, documentation, issues, screenshots, or logs.

Use the following secure locations instead:

- Local development: `.env.local`
- Vercel deployment: Environment Variables
- GitHub Actions: Repository Secrets

## Rotating leaked keys

If a key is accidentally exposed:

1. Revoke it immediately in the provider dashboard.
2. Generate a new key.
3. Update Vercel Environment Variables and GitHub Actions Secrets.
4. Redeploy the application.
5. Check logs and commit history for any remaining exposure.

## Reporting security issues

Please do not open a public GitHub Issue for sensitive security reports.

Contact the maintainer privately if you discover a vulnerability or accidental key exposure.
