# Music Blocks (v4)

[![Lint](https://github.com/sugarlabs/musicblocks-v4/actions/workflows/lint.yml/badge.svg?branch=develop)](https://github.com/sugarlabs/musicblocks-v4/actions/workflows/lint.yml)
[![Continuous Integration](https://github.com/sugarlabs/musicblocks-v4/actions/workflows/CI.yml/badge.svg?branch=develop)](https://github.com/sugarlabs/musicblocks-v4/actions/workflows/CI.yml)
[![Continuous Deployment](https://github.com/sugarlabs/musicblocks-v4/actions/workflows/CD.yml/badge.svg?branch=develop)](https://github.com/sugarlabs/musicblocks-v4/actions/workflows/CD.yml)

A complete overhaul of [Music Blocks](https://github.com/sugarlabs/musicblocks) — a visual,
interactive programming environment for exploring music, art, and logic, designed for learners
of all ages.

## Tech Stack

Music Blocks (v4) is a client-side rendered web application written in _TypeScript_ and _React_.
It is structured as a monorepo using _npm workspaces_, managed by _Lerna_.

### Stack

![TypeScript 6](https://img.shields.io/badge/-TypeScript%206-000?&logo=TypeScript)
![React 19](https://img.shields.io/badge/-React%2019-000?&logo=React)
![SCSS](https://img.shields.io/badge/-SCSS-000?&logo=Sass)
![Tailwind CSS 4](https://img.shields.io/badge/-Tailwind%20CSS%204-000?&logo=TailwindCSS)

### Tooling

![Node.js 24](https://img.shields.io/badge/-Node.js%2024-000?&logo=nodedotjs)
![npm 11](https://img.shields.io/badge/-npm%2011-000?&logo=npm)
![Vite 8](https://img.shields.io/badge/-Vite%208-000?&logo=Vite)
![Lerna](https://img.shields.io/badge/-Lerna-000?&logo=Lerna)

### Quality

![Vitest](https://img.shields.io/badge/-Vitest-000?&logo=Vitest)
![Storybook](https://img.shields.io/badge/-Storybook-000?&logo=Storybook)
![ESLint](https://img.shields.io/badge/-ESLint-000?&logo=ESLint)
![Prettier](https://img.shields.io/badge/-Prettier-000?&logo=Prettier)

## Project Status

This project stalled for an extended period. Most of the code written during that phase has
reached a dead end, and the effort is being restarted from a cleaner foundation.

### Active

| Package | Notes |
| --- | --- |
| `modules/masonry` | Graphical project builder — brick geometry, layout, and rendering |

### Archived

All other packages (`modules/engine.old`, `modules/program`, `modules/runtime`,
`modules/code-builder`, `modules/editor`, `modules/singer`, `modules/painter`, `modules/menu`,
`lib/*`) are remnants of the previous effort and are not being carried forward.

## Development

### Monorepo Structure

This repository is a monorepo using _npm workspaces_, managed by _Lerna_. It is organized into
three layers:

- **`app/`** — the main application package
- **`modules/`** — feature modules (e.g. `editor`, `painter`, `singer`, `masonry`)
- **`lib/`** — shared libraries used across modules (e.g. `events`, `transport`, `components`)

The **root** of the repository is not a runnable package. It holds global configuration:
workspace definitions, shared `tsconfig`, ESLint and Prettier config, and shared dev
dependencies.

- **Dev dependencies** should generally be installed at the root level, unless they are
  specific to a single sub-package.
- **Production dependencies** belong in the individual sub-package that uses them.

When working on a specific feature or fix, navigate to the relevant sub-package directory.
Changes to shared tooling, config, or anything cross-cutting belong at the root level.

### Setup

You will need [**Node.js**](https://nodejs.org/en) **v24** or later and **npm 11** or later.
All other dependencies (TypeScript, tsx, etc.) are installed locally as part of the project
via `npm ci` — no global installs are required.

[**nvm**](https://github.com/nvm-sh/nvm) (Node Version Manager) is recommended for managing
Node.js and npm versions. It lets you install and switch between versions easily, and ensures
you are running the version this project expects.

Verify your environment:

```bash
node -v
npm -v
```

Expected output (or later):

```bash
v24.0.0
11.0.0
```

### Commands

Install all dependencies from the repository root first:

```bash
npm ci
```

If you are working within a specific sub-package, you can run the scripts directly from that
package's directory instead.

The commands below are run from the root and delegate to the relevant sub-package scripts via
Lerna.

| Command | Description |
| --- | --- |
| `npm run serve` | Start development server at `localhost:5173` |
| `npm run build` | Generate a production build |
| `npm run build:gh` | Production build for GitHub Pages (base: `/musicblocks-v4/`) |
| `npm run preview` | Serve the last production build at `localhost:4173` |
| `npm run test` | Run all tests |
| `npm run check` | TypeScript type-check across all packages |
| `npm run lint` | Lint all files |

### Editor

**Visual Studio Code** is recommended, or any VS Code-based editor such as **Cursor** or
**Antigravity IDE**.

Recommended extensions: `ESLint`, `Prettier`, `markdownlint`, `SVG`, and `Tailwind CSS`.

## Contributing

All skill levels are welcome. Browse issues labeled
[`good first issue`](https://github.com/sugarlabs/musicblocks-v4/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
to find a beginner-friendly starting point, or follow the
[project board](https://github.com/orgs/sugarlabs/projects/9) to track ongoing work and see
what is being planned. Unassigned issues are free to pick up; if an issue has an assignee,
comment to check whether it is still active. Feel free to ask for clarification directly on
the issue before starting.

For general questions and discussion, visit the
[discussions](https://github.com/sugarlabs/musicblocks-v4/discussions) tab.

See [**full contributing guide**](CONTRIBUTING.md) for code standards, commit format,
and the pre-submit checklist.
