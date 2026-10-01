# Music Blocks (v4)

[![Contributors](https://img.shields.io/github/contributors/sugarlabs/musicblocks-v4)](https://github.com/sugarlabs/musicblocks-v4/graphs/contributors)
[![License](https://img.shields.io/github/license/sugarlabs/musicblocks-v4)](LICENSE)
[![CI](https://github.com/sugarlabs/musicblocks-v4/actions/workflows/CI.yml/badge.svg?branch=develop)](https://github.com/sugarlabs/musicblocks-v4/actions/workflows/CI.yml)

Music Blocks is a playful way to learn. You snap colorful bricks together and they turn into
music, drawings, and ideas, with no syntax to memorize and no wrong notes. Just something to
build, and then hear.

Version 4 is that idea rebuilt from the ground up, taking shape in the open.

Curious why music and programming belong in the same place? The thinking behind that pairing is
laid out in [Why Music Blocks](https://github.com/sugarlabs/musicblocks/blob/master/WhyMusicBlocks.md).

## Tech Stack

A client-side web application written in TypeScript and React, bundled by Vite, and organized
as an npm workspaces monorepo managed by Lerna.

![TypeScript](https://img.shields.io/badge/-TypeScript%206-000?&logo=TypeScript)
![React](https://img.shields.io/badge/-React%2019-000?&logo=React)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS%204-000?&logo=TailwindCSS)
![SCSS](https://img.shields.io/badge/-SCSS-000?&logo=Sass)
![Vite](https://img.shields.io/badge/-Vite%208-000?&logo=Vite)
![Node.js](https://img.shields.io/badge/-Node.js%2024-000?&logo=nodedotjs)
![npm](https://img.shields.io/badge/-npm%2011-000?&logo=npm)
![Lerna](https://img.shields.io/badge/-Lerna-000?&logo=Lerna)
![Vitest](https://img.shields.io/badge/-Vitest-000?&logo=Vitest)
![Storybook](https://img.shields.io/badge/-Storybook-000?&logo=Storybook)
![ESLint](https://img.shields.io/badge/-ESLint-000?&logo=ESLint)
![Prettier](https://img.shields.io/badge/-Prettier-000?&logo=Prettier)

## How to Set up a Local Server

You will need [Node.js](https://nodejs.org/en) 24 or later and npm 11 or later. Everything else
is installed with the project, so nothing has to be set up globally.

```bash
git clone https://github.com/sugarlabs/musicblocks-v4.git
cd musicblocks-v4
npm ci
npm run serve
```

The application is then served at `localhost:5173` and reloads as you edit. To check a
production build instead, run `npm run build` followed by `npm run preview`, which serves it
at `localhost:4173`.

Most active work happens in the masonry module, which runs on its own:

```bash
cd modules/masonry
npm run playground2
```

That opens the brick workspace at `localhost:5602`.

## Code of Conduct

Music Blocks is built for learners, and largely by them. Everyone taking part is expected to
help keep it a place where a first pull request is a safe thing to open.

- Be patient with beginners, and remember that everyone here was one.
- Keep feedback on the work rather than the person, and give reasons alongside criticism.
- Assume good intent, and ask before you escalate.
- Harassment, personal attacks, gatekeeping, and mocking questions are not tolerated, in any
  space belonging to this project.

Read the full [Code of Conduct](CODE_OF_CONDUCT.md) for the standards in detail, what happens
when they are broken, and how to report a problem. Reports are handled privately and are never
held against the person raising them.

## Contributing

Contributions are welcome from developers at every level, junior, mid, or senior. A good part
of this codebase began as somebody's first pull request.

- **Wait for the issue to be assigned to you before you start.** Comment on the issue to ask
  for it, and wait for a maintainer to assign it. This is what keeps two people from building
  the same thing twice.
- **Talk first when something is significant.** Open a
  [discussion](https://github.com/sugarlabs/musicblocks-v4/discussions) for anything touching
  design, structure, or scope, or drop into our
  [Element channel](https://matrix.to/#/!DEkxujYDjfCQImeMBM:matrix.org?via=matrix.org) for the
  quicker back and forth. A five minute conversation can save a weekend of rework.
- **Keep pull requests under roughly 200 lines changed.** Small pull requests get reviewed in
  hours, large ones sit for days. If the work is bigger than that, split it into a series and
  say so in the description.
- **One pull request, one concern.** Unrelated fixes, formatting sweeps, and refactors belong
  in their own pull requests, not bundled into a feature.
- **Branch from `develop` and open the pull request against `develop`.** Name the branch after
  the issue, reference it with `closes #N`, and open it as a draft while work is in progress.
- **Run `npm run lint`, `npm run check`, and `npm run test` before you push.** The same checks
  run in CI, so catching them locally saves a round trip. Add tests for what you change.
- **Describe what you did and how you checked it.** Screenshots or a short clip for anything
  visual. A reviewer should not have to guess at intent.
- **Stay decent.** Review comments are about the code, never the person. Assume good intent,
  disagree with reasons, and give reviewers time to respond before following up.

The [contributing guide](CONTRIBUTING.md) has the details: branch naming, commit format, and
the checklist to run through before you submit.

## Credits

Music Blocks exists because of [Walter Bender](https://github.com/walterbender), who started
Sugar Labs and has guided this work from the beginning, and
[Devin Ulibarri](https://github.com/pikurasa), whose teaching and advocacy shaped what Music
Blocks is for. Version 4 was architected and largely written by
[Anindya Kundu](https://github.com/meganindya), whose groundwork the current rebuild still
stands on.

The rebuild is currently maintained by [Parth Dagia](https://github.com/parthdagia05) and
[Syed Khubayb Ur Rahman](https://github.com/kh-ub-ayb), who triage issues, review pull
requests, and keep the roadmap moving. Tag either of them if a pull request has been waiting
on a review.

Thanks also to every contributor who has filed an issue, reviewed a pull request, or shipped
a fix here. The full list lives on the
[contributors graph](https://github.com/sugarlabs/musicblocks-v4/graphs/contributors).
