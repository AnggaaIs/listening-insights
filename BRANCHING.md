# Branching Strategy

Solo-maintainer flow with branch protection: all changes go through pull requests.

## Branches

- `main`: source code, docs, CI, release tags. Protected — no direct pushes.
- `dist`: generated Marketplace build, published automatically by GitHub Actions.

Do not edit `dist` manually. The release workflow force-publishes it from `main` when a tag is pushed.

## One-Time Local Setup

```bash
pnpm install
pnpm hooks:install
```

Hooks:

- `pre-commit`: typecheck, release check, build `dist`, stage generated release files.
- `pre-push`: typecheck and release check only. It does not mutate files.

## Daily Work

Create a feature/fix branch, push, and open a PR:

```bash
git checkout main
git pull origin main
git checkout -b feat/your-change
# edit files
git add .
git commit -m "feat: describe change"
git push -u origin feat/your-change
```

Open PR: `feat/your-change -> main`

After merge via GitHub:

```bash
git checkout main
git pull origin main
```

Delete the temporary branch if GitHub did not auto-delete it.

## Hotfix

Same flow — no direct pushes allowed:

```bash
git checkout main
git pull origin main
git checkout -b fix/urgent-issue
# fix files
git add .
git commit -m "fix: urgent issue"
git push -u origin fix/urgent-issue
```

Open PR: `fix/urgent-issue -> main`

After merge, tag from `main`:

```bash
git checkout main
git pull origin main
git tag v1.0.1
git push origin v1.0.1
```

## Release

1. Update version and changelog if needed:
   - `package.json`
   - `package-lock.json`
   - `CHANGELOG.md`
2. Commit via PR to `main`.
3. Tag from `main`:

```bash
git checkout main
git pull origin main
git tag v1.0.0
git push origin v1.0.0
```

The release workflow will:

- build production `dist`
- publish GitHub release artifacts
- force-publish the Marketplace-ready `dist` branch

## GitHub Rulesets

Protect `main`:

- Require PRs for all changes.
- Require CI to pass.
- Block force pushes.
- Restrict deletions.
- No merge commits (squash merge only).

Protect tags:

- Target: `v*`
- Restrict deletions.
- Block force pushes.

Do not protect `dist` with force-push blocking. Release workflow needs to overwrite it.
