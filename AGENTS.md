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

## Task runner

Use `just` as the single entry point (`just` lists all recipes). Recipes wrap the real
`pnpm` scripts; don't duplicate commands.

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
