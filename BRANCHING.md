# Branching Strategy

Listening Insights uses a small release-focused Git flow.

## Long-Lived Branches

- `main`: production-ready code only. Every tag is cut from this branch.
- `dev`: integration branch for completed features and fixes before release.

## Short-Lived Branches

- `feature/<name>`: new feature work.
- `fix/<name>`: normal bug fixes.
- `release/vX.Y.Z`: final release stabilization.
- `hotfix/vX.Y.Z`: urgent production fixes branched from `main`.

## Normal Feature Flow

Install local Git hooks once after cloning:

```bash
pnpm hooks:install
```

The pre-commit hook runs release checks, rebuilds `dist`, and stages generated release files. The pre-push hook only validates typecheck and release metadata so it does not mutate files during push.

1. Branch from `dev`:
   ```bash
   git checkout dev
   git pull
   git checkout -b feature/my-feature
   ```
2. Open a PR into `dev`.
3. CI must pass.
4. Squash or merge into `dev`.

## Release Flow

1. Create release branch from `dev`:
   ```bash
   git checkout dev
   git pull
   git checkout -b release/v1.1.0
   ```
2. Update `package.json`, `package-lock.json`, and `CHANGELOG.md`.
3. Run:
   ```bash
   pnpm install
   pnpm typecheck
   pnpm release:check
   pnpm build-local
   ```
4. Open PR from `release/v1.1.0` to `main`.
5. Merge after CI passes.
6. Tag release:
   ```bash
   git checkout main
   git pull
   git tag v1.1.0
   git push origin v1.1.0
   ```
7. Merge `main` back into `dev`.

## Hotfix Flow

1. Branch from `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b hotfix/v1.0.1
   ```
2. Fix, test, and open PR to `main`.
3. Tag patch release after merge.
4. Merge `main` back into `dev`.

## Branch Protection Recommendation

Protect `main` and `dev`:

- Require pull requests.
- Require CI to pass.
- Require up-to-date branches before merge.
- Block force pushes.
- Block direct pushes to `main`.
