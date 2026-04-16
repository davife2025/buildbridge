# Contributing to BuildBridge

## Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Production — auto-deploys to Vercel + Railway |
| `develop` | Integration branch — PRs merge here first |
| `session/N-description` | Feature branches for each build session |

## Workflow

```bash
# 1. Create a session branch
git checkout develop
git pull
git checkout -b session/2-auth-layer

# 2. Make your changes

# 3. Commit using conventional commits
git commit -m "feat: add Freighter wallet connect flow"
git commit -m "fix: handle Freighter not installed error"
git commit -m "test: add wallet signature verification tests"

# 4. Push and open a PR to develop
git push origin session/2-auth-layer
```

## Commit message format

```
type(scope): subject

Types: feat | fix | docs | refactor | test | chore | ci | build
Scope: web | api | ai | stellar | ui | contracts | docs
```

Examples:
- `feat(api): add /pitch/refine endpoint with Claude streaming`
- `fix(stellar): handle unfunded Stellar accounts gracefully`
- `test(contracts): add milestone isolation test`

## Running checks locally

```bash
npm run lint          # ESLint across all packages
npm run type-check    # TypeScript across all packages
npm run test          # Jest across all packages
npm run build         # Full production build
```

## Adding environment variables

1. Add to `.env.example` with a placeholder value and comment
2. Add to the relevant app's `.env.local` (not committed)
3. Add to GitHub repo secrets if needed for CI

## Code style

- **TypeScript strict mode** — no `any` without a comment explaining why
- **Named exports** — avoid default exports except for Next.js pages and layouts
- **Zod for validation** — all API request bodies validated with Zod schemas
- **Error handling** — use `createError(message, statusCode)` from `middleware/error-handler`
