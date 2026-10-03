# AGENTS.md

Instructions for agents and developers working in this repository.

## Read the docs first

Before doing any dev work — setup, running, linting, testing, Docker, or deploying —
**read the relevant file in `docs/dev/` first, follow it, and update it when you change
how things work.** Keep the docs in sync with reality; they are the source of truth.

| Doc | Read it when… |
| --- | --- |
| [`docs/dev/getting-started.md`](docs/dev/getting-started.md) | Setting up a machine: installing Node, pnpm, just, direnv, Docker; creating `.env`; first run. |
| [`docs/dev/devtools.md`](docs/dev/devtools.md) | You need a tool reference — just recipes, pnpm scripts, direnv, Prisma, Docker, Komodo. |
| [`docs/dev/deployment.md`](docs/dev/deployment.md) | Deploying to Komodo: prerequisites, flow, service-user permissions, troubleshooting. |
| [`docs/dev/workflow.md`](docs/dev/workflow.md) | Tracking and shipping work: one feature per branch, PR, and Linear task. |
| [`docs/dev/testing.md`](docs/dev/testing.md) | Writing or running unit tests: the runner, `just test*` recipes, what is/isn't covered, conventions. |

## Workflow rule (one feature per branch/PR/task) — binding

Every feature gets its own Linear task, its own branch, and its own pull request — no
bundling. Branches follow `jeremyviengarriola/phasm-NN-slug`, PRs link their Linear task
and target `master`, never push directly to `master`, never force-push shared branches,
and keep diffs small. Agents never merge the PR; a human reviews and merges. Canonical
rule: [`.kiro/steering/git-linear-workflow.md`](.kiro/steering/git-linear-workflow.md)
(always on); human summary: [`docs/dev/workflow.md`](docs/dev/workflow.md).

## Task runner

Use `just` as the single entry point (`just` lists all recipes). Recipes wrap the real
`pnpm` scripts; don't duplicate commands.

## Testing — binding

Run `just test` before opening any PR, and add or update unit tests in the same PR as any
behavior change. Tests use the Node built-in runner (`node:test` + `tsx`); the canonical
reference (what is/isn't covered, blood-pressure rule caveats, spec-vs-code gaps,
conventions, how to add a test) is [`docs/dev/testing.md`](docs/dev/testing.md). Never take
expected values from the code's own output, and never weaken a test or silently fix a bug
inside a test change — report the bug and fix it as its own task/PR.

## Deploy rule (Komodo) — binding

Deploying is guarded by `.kiro/steering/komodo-deploy.md` (always on). In short: only the
one named project stack, **confirm with a human before any deploy/redeploy/destroy**, never
create/delete/modify Komodo resources or permissions, read credentials from `.env` only and
never print/commit the secret, and report status + logs after. Full flow:
[`docs/dev/deployment.md`](docs/dev/deployment.md).

## Docker

Container build/compose files live at the repo root. For the checklist and how to review
them, use the **`docker-best-practices`** skill
(`.kiro/skills/docker-best-practices/SKILL.md`; a pointer copy is under
`.agents/skills/docker-best-practices/`). See also the Docker section of
[`docs/dev/devtools.md`](docs/dev/devtools.md).

## Secrets

Never read out, echo, log, commit, or paste secrets (e.g. `KOMODO_API_KEY`,
`KOMODO_API_SECRET`). Refer to them by name. `.env` is gitignored and excluded from the
Docker image.
