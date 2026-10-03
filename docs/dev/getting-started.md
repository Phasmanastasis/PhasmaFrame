# Getting started

This guide takes a new contributor from an empty machine to a running dev server.
Install the prerequisites in order, then follow the project setup steps.

The project targets **Node.js 20.19+ or 22.12+** and **pnpm 10+** (see the root
[`README`](../../README.md) and the `packageManager` field in `package.json`, currently
`pnpm@10.33.0`).

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

`npm` and `npx` ship **with** Node.js — you do not need to install them separately.

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
[`devtools.md`](./devtools.md)).

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
- **Windows:**
  - `winget install --id Casey.Just`
  - or `scoop install just`
  - or `choco install just`

Verify:
```bash
just --version
```

## 4. Project setup

```bash
# 1. Clone
git clone https://github.com/Phasmanastasis/PhasmaFrame.git
cd PhasmaFrame

# 2. See the available tasks
just

# 3. Install dependencies
just install            # → pnpm install

# 4. Create the API env file (the API reads apps/api/.env)
cp apps/api/.env.example apps/api/.env

# 5. Create the local SQLite database
just db-migrate         # → pnpm db:migrate

# 6. Start the dev servers (API + web, hot reload)
just dev
```

Then open the web app at <http://localhost:4321>. The API runs at
<http://localhost:3000>.

> Tip: `just dev-api` and `just dev-web` run a single side if you only need one.

## Verify your setup

Work through this checklist; everything should succeed before you start coding.

- [ ] `node -v` prints v20.19+ or v22.12+
- [ ] `npm -v` and `npx -v` print versions
- [ ] `pnpm -v` prints 10.x
- [ ] `just --version` prints a version
- [ ] `just install` completes without errors
- [ ] `apps/api/.env` exists (copied from `apps/api/.env.example`)
- [ ] `just db-migrate` creates the local SQLite DB
- [ ] `just check` passes (type-checks every workspace)
- [ ] `just dev` serves the web app at <http://localhost:4321>

## Troubleshooting

**Wrong Node version** — `node -v` is below 20.19 (or you need 22.12+). Switch with
`nvm use 22` (nvm) / `nvm use 22` (nvm-windows), or reinstall Node. Delete `node_modules`
and re-run `just install` after switching, since native modules are version-specific.

**`pnpm: command not found`** — pnpm is not installed or not on `PATH`. Run
`corepack enable` (bundled with Node), then retry inside the repo. If you used the
standalone installer, open a new terminal so the updated `PATH` takes effect.

**`just: command not found`** — `just` is not installed or not on `PATH`. Reinstall via
the method for your OS above. If you used the prebuilt-binary script, confirm the install
dir (e.g. `~/.local/bin`) is on your `PATH`.

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
