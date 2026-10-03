# Getting started

This guide takes a new contributor from an empty machine to a running dev server.
Install the prerequisites in order, then follow the project setup steps.

The project targets **Node.js 20.19+ or 22.12+** and **pnpm 10+** (see the root
[`README`](../../README.md) and the `packageManager` field in `package.json`, currently
`pnpm@10.33.0`). For what each tool is used for, see [devtools.md](./devtools.md).

## 1. Node.js

Install an LTS release that satisfies the version requirement (Node 22 LTS is a safe
choice; Node 20.19+ also works).

- **All platforms:** download the installer from <https://nodejs.org/>.
- **macOS (Homebrew):** `brew install node@22`
- **Linux:** use [nvm](https://github.com/nvm-sh/nvm) to match versions easily:
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  nvm install 22
  nvm use 22
  ```
- **Windows:** use the [official installer](https://nodejs.org/) or
  [nvm-windows](https://github.com/coreybutler/nvm-windows).

`npm` and `npx` ship **with** Node.js — you do not need to install them separately; just
verify them below.

Verify:
```bash
node -v   # v20.19+ or v22.12+
npm -v
npx -v
```

## 2. pnpm

This repo uses pnpm as its package manager, pinned via `packageManager` in `package.json`.
Match that major version (pnpm 10+).

- **Corepack (recommended; bundled with Node):**
  ```bash
  corepack enable
  corepack prepare pnpm@10.33.0 --activate
  ```
  Running any `pnpm` command inside the repo will then use the pinned version automatically.
- **Standalone installer (alternative):**
  - macOS/Linux: `curl -fsSL https://get.pnpm.io/install.sh | sh -`
  - Windows (PowerShell): `iwr https://get.pnpm.io/install.ps1 -useb | iex`
  - or via npm: `npm install -g pnpm`

Verify:
```bash
pnpm -v   # 10.x
```

## 3. just

[`just`](https://github.com/casey/just) runs the project's task recipes (see
[devtools.md](./devtools.md)).

- **macOS (Homebrew):** `brew install just`
- **Linux:**
  - Debian/Ubuntu (recent): `apt install just`
  - Arch: `pacman -S just`
  - Any distro (prebuilt binary):
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/.local/bin
    ```
    (ensure `~/.local/bin` is on your `PATH`)
  - via Cargo (if you have Rust): `cargo install just`
- **Windows:** `winget install --id Casey.Just`, `scoop install just`, or `choco install just`

Verify:
```bash
just --version
```

## 4. direnv (optional)

[`direnv`](https://direnv.net/) auto-loads environment variables from the project's `.env`
files when you enter the directory. It is **optional**: `just` already loads `.env` on its
own via `set dotenv-load`, so you only need direnv if you want those variables in your
interactive shell too.

### Install

- **macOS (Homebrew):** `brew install direnv`
- **Linux:** `apt install direnv` / `pacman -S direnv` / `dnf install direnv`, or see
  <https://direnv.net/docs/installation.html>
- **Windows:** use WSL (recommended) and install via your Linux distro, or `scoop install direnv`

### Hook it into your shell

direnv only works once hooked into your shell. Add the matching line to your shell config,
then restart the shell:

- **bash** (`~/.bashrc`):
  ```bash
  eval "$(direnv hook bash)"
  ```
- **zsh** (`~/.zshrc`):
  ```zsh
  eval "$(direnv hook zsh)"
  ```
- **fish** (`~/.config/fish/config.fish`):
  ```fish
  direnv hook fish | source
  ```

### Allow the repo's `.envrc`

`.envrc` is executable shell code, so direnv refuses to run it until you explicitly trust
it. From the repo root:

```bash
direnv allow
```

You must re-run `direnv allow` after any change to `.envrc` (direnv blocks it again on
every edit, by design). Check the current state with `direnv status`.

The repo's `.envrc` loads a root `.env` (if present) and `apps/api/.env`, and watches those
plus `apps/api/.env.example` so the environment reloads when they change.

## 5. Docker (for building/running the container and deploying)

Needed to build the image, run `docker compose`, and deploy to Komodo.

- **macOS / Windows:** install [Docker Desktop](https://docs.docker.com/get-docker/)
  (on Windows, enable the WSL 2 backend).
- **Linux:** install [Docker Engine](https://docs.docker.com/engine/install/) +
  the Compose plugin (`docker compose`, not the legacy `docker-compose`).

Verify:
```bash
docker --version
docker compose version
```

## 6. Project setup

```bash
# 1. Clone
git clone https://github.com/Phasmanastasis/PhasmaFrame.git
cd PhasmaFrame

# 2. (optional) trust the .envrc if you installed direnv
direnv allow

# 3. See the available tasks
just

# 4. Install dependencies
just install            # → pnpm install

# 5. Create the API env file (the API reads apps/api/.env)
cp apps/api/.env.example apps/api/.env

# 5b. (deploy only) Create the root env for deploy tooling and add Komodo creds
cp .env.example .env
#    then edit .env and fill KOMODO_API_KEY / KOMODO_API_SECRET from the Komodo UI.
#    KOMODO_URL already has a default. NEVER commit .env.

# 6. Create the local SQLite database
just db-migrate         # → pnpm run db:migrate

# 7. Start the dev servers (API + web, hot reload)
just dev
```

Then open the web app at <http://localhost:4321>. The API runs at
<http://localhost:3000>.

> Tip: `just dev-api` and `just dev-web` run a single side if you only need one.

> The dev web server does not proxy `/api/*` to the API. If you need the dev web app to call
> the dev API, set `PUBLIC_API_URL=http://localhost:3000` for the web app (for example
> `PUBLIC_API_URL=http://localhost:3000 just dev-web`). In production the two are same-origin,
> so `PUBLIC_API_URL` is left unset. See [RUNNING.md](../../RUNNING.md#running-in-development).

### Komodo deploy credentials & permissions

Deploying is optional for local dev. If you will deploy:

- Put `KOMODO_URL`, `KOMODO_API_KEY`, `KOMODO_API_SECRET` in the root `.env` (the key/secret
  come from the Komodo UI → *Settings → Profile → API Keys* for the **service user**).
- The service user is **non-admin by design**: it may deploy the one project stack but
  cannot create/delete resources or change permissions. Run `just komodo-probe` to see
  exactly what it can access. Full flow and troubleshooting: [deployment.md](./deployment.md).

### Cloudflare deploy (alternative target)

Also optional. To deploy to Cloudflare (Workers + D1 API, Pages web):

- Authenticate Wrangler with `npx wrangler login` (or a `CLOUDFLARE_API_TOKEN` — a secret,
  never committed). Wrangler is already a dev dependency; no global install needed.
- Validate without an account using `just cf-check`, run locally with `just cf-dev-api` /
  `just cf-dev-web`. Full flow and live URLs: [deployment-cloudflare.md](./deployment-cloudflare.md).

## Verify your setup

Work through this checklist; everything should succeed before you start coding.

- [ ] `node -v` prints v20.19+ or v22.12+
- [ ] `npm -v` and `npx -v` print versions
- [ ] `pnpm -v` prints 10.x
- [ ] `just --version` prints a version
- [ ] (if using direnv) `direnv status` shows the `.envrc` is allowed
- [ ] `just install` completes without errors
- [ ] `apps/api/.env` exists (copied from `apps/api/.env.example`)
- [ ] `just db-migrate` creates the local SQLite DB
- [ ] `just check` passes (type-checks every workspace)
- [ ] `just dev` serves the web app at <http://localhost:4321>

## Troubleshooting

**Wrong Node version** — `node -v` is below 20.19 (or you need 22.12+). Switch with
`nvm use 22` (nvm / nvm-windows), or reinstall Node. Delete `node_modules` and re-run
`just install` after switching, since native modules are version-specific.

**`pnpm: command not found`** — pnpm is not installed or not on `PATH`. Run
`corepack enable` (bundled with Node), then retry inside the repo. If you used the
standalone installer, open a new terminal so the updated `PATH` takes effect.

**`just: command not found`** — `just` is not installed or not on `PATH`. Reinstall via
the method for your OS above. If you used the prebuilt-binary script, confirm the install
dir (e.g. `~/.local/bin`) is on your `PATH`.

**`direnv: error .envrc is blocked`** — direnv found the `.envrc` but you have not trusted
it (or it changed since you last did). Run `direnv allow` from the repo root. This is
expected after editing `.envrc`.

**direnv does nothing when you `cd` in** — the shell hook is not installed. Add
`eval "$(direnv hook <shell>)"` (or the fish form) to your shell config and restart the
shell. Confirm with `direnv status`. Remember direnv is optional — `just` still loads
`.env` without it.

**PATH issues after a standalone/global install** — the shell caches command locations.
Open a new terminal, or re-source your shell profile (`source ~/.bashrc`,
`source ~/.zshrc`). On Windows, sign out/in if a freshly installed tool is still not found.

**`pnpm install` fails on native builds (Prisma, esbuild, sharp)** — these are
allow-listed under `pnpm.onlyBuiltDependencies` in `package.json`. If a build is skipped,
run `pnpm rebuild` or delete `node_modules` and run `just install` again.

**Prisma / database errors** — ensure `apps/api/.env` exists and `DATABASE_URL` is set
(the example uses `file:./dev.db`). Re-run `just db-generate` then `just db-migrate`.

**Port already in use** — the API uses `PORT` (default 3000) and the web app uses 4321.
Stop whatever is using the port, or override `PORT` / `WEB_ORIGIN` in `apps/api/.env`.
