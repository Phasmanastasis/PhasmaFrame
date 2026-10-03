---
inclusion: always
---

# Read the dev docs before doing dev work

This repository keeps its developer documentation in `docs/dev/`. Before any setup,
running, linting, testing, Docker, or deploy work, **read the relevant doc first, follow
it, and update it when behavior changes.** Do not duplicate doc content here — link to it.

| Doc | Read it when… |
| --- | --- |
| [`docs/dev/getting-started.md`](../../docs/dev/getting-started.md) | Installing Node, pnpm, just, direnv, Docker; creating `.env`; first run. |
| [`docs/dev/devtools.md`](../../docs/dev/devtools.md) | Tool reference: just recipes, pnpm scripts, direnv, Prisma, Docker, Komodo. |
| [`docs/dev/deployment.md`](../../docs/dev/deployment.md) | Deploying to Komodo: prerequisites, flow, service-user permissions, troubleshooting. |
| [`docs/dev/workflow.md`](../../docs/dev/workflow.md) | Tracking and shipping work: one feature per branch, PR, and Linear task. |
| [`docs/dev/testing.md`](../../docs/dev/testing.md) | Writing or running unit tests: the runner, `just test*` recipes, coverage, gaps. |

- **Task runner:** use `just` (`just` lists recipes); recipes wrap `pnpm` scripts.
- **Testing:** run `just test` before any PR; add/update unit tests with every behavior
  change. Runner is `node:test` + `tsx`; canonical reference is
  [`docs/dev/testing.md`](../../docs/dev/testing.md). Never copy expected values from the
  code's output; never weaken a test or hide a bug in a test change — report it.
- **Workflow rule:** one feature per branch/PR/Linear task — no bundling. Branches follow
  `jeremyviengarriola/phasm-NN-slug`, PRs link their task and target `master`, never push
  to `master` directly, never force-push shared branches. Canonical:
  [`git-linear-workflow.md`](./git-linear-workflow.md) (always on); summary:
  [`docs/dev/workflow.md`](../../docs/dev/workflow.md).
- **Deploy rule:** Komodo deploys are bound by [`komodo-deploy.md`](./komodo-deploy.md)
  (always on) — one named stack, confirm before deploy/redeploy/destroy, no resource or
  permission changes, credentials from `.env` only, report status + logs.
- **Docker:** use the `docker-best-practices` skill
  (`.kiro/skills/docker-best-practices/SKILL.md`) when writing or reviewing the Dockerfile
  or compose file.
- **Secrets:** never read out, echo, log, or commit secrets; refer to them by name only.
