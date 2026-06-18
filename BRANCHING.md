# Branching Strategy

Solo-maintainer flow: keep it simple.

## Branches

- `main`: source code, docs, CI, release tags.
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

Work directly on `main`:

```bash
git checkout main
git pull origin main
# edit files
git add .
git commit -m "feat: describe change"
git push origin main
```

## Bigger Changes

Use a temporary branch:

```bash
git checkout main
git pull origin main
git checkout -b feature/name
# edit files
git add .
git commit -m "feat: name"
git push -u origin feature/name
```

Open PR:

```text
feature/name -> main
```

After merge:

```bash
git checkout main
git pull origin main
```

Delete the temporary branch if GitHub did not auto-delete it.

## Release

1. Update version and changelog if needed:
   - `package.json`
   - `package-lock.json`
   - `CHANGELOG.md`
2. Commit to `main`.
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

## Hotfix

Small urgent fix:

```bash
git checkout main
git pull origin main
# fix files
git add .
git commit -m "fix: urgent issue"
git push origin main
git tag v1.0.1
git push origin v1.0.1
```

## GitHub Rulesets

Protect `main`:

- Require CI to pass.
- Block force pushes.
- Restrict deletions.
- Optional: require PRs for bigger changes.

Protect tags:

- Target: `v*`
- Restrict deletions.
- Block force pushes.

Do not protect `dist` with force-push blocking. Release workflow needs to overwrite it.
