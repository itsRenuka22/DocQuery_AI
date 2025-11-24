## Secrets and security

This repository should never contain real secrets in source control. Follow these guidelines:

- Do not commit `.env` or files containing credentials. This repo already lists `.env` in `.gitignore`.
- Use environment variables, a secrets manager (AWS Secrets Manager, SSM Parameter Store, GitHub Actions secrets), or your platform's secret store for production credentials.
- If a secret is accidentally committed, rotate/revoke it immediately and consider purging it from git history (git-filter-repo or BFG). Contact collaborators before rewriting history.

How to use `.env.example`

1. Copy `.env.example` to `.env` locally:

```bash
cp .env.example .env
# edit .env and fill in real values (do not commit)
```

2. For CI/CD and deployments, set the environment variables in the deployment environment or configure a secrets manager rather than storing secrets in files inside the repo.

3. After rotating keys, update the deployment configuration to use the new keys and delete local copies of `.env` if not needed.
