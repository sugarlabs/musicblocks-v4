# Music Blocks (v4)

A complete overhaul of [Music Blocks](https://github.com/sugarlabs/musicblocks).

## Tech Stack

Music Blocks (v4) is a client-side web application written in _TypeScript_. _React_ is used to render
UI components, however, the project is set up to independently use any _JavaScript_ UI library/framework
or the _JS DOM API_ directly. It is bundled using _Webpack_.

- Application
  - TypeScript 4
  - React 17
  - SCSS

- Tooling
  - Node.js
  - Webpack 5
  - ESLint
  - Docker

- Testing
  - Jest
  - Cypress

## Development

See [**full development guide**](./docs/DEV.md).

## Contributing

There is a [Music Blocks (v4)](https://github.com/orgs/sugarlabs/projects/9) _GitHub project_ which
is used for task management. You can visit it from the
[projects](https://github.com/sugarlabs/musicblocks-v4/projects?query=is%3Aopen) tab at the top of
the repository. In addition, please visit the
[discussions](https://github.com/sugarlabs/musicblocks-v4/discussions) tab at the top of the repository
to follow and/or discuss about the planning progress.

Parallel development of the programming framework will be done in the
[**musicblocks-v4-lib**](https://github.com/sugarlabs/musicblocks-v4-lib) repository as mentioned
above. For updates, follow the `develop` branch and the feature branches that branch out of it.
Please look out for _Issues_ tab of both repositories.

**Note:** There is no need to ask permission to work on an issue. You should check for pull requests
linked to an issue you are addressing; if there are none, then assume nobody has done anything. Begin
to fix the problem, test, make your commits, push your commits, then make a pull request. Mention an
issue number in the pull request, but not the commit message. These practices allow the competition
of ideas (Sugar Labs is a meritocracy).

See [**full contributing guide**](./docs/CONTRIBUTING.md).
