# Music Blocks (v4)

A complete overhaul of [Music Blocks](https://github.com/sugarlabs/musicblocks).

## Proposed Architecture

The aim of the new architecture is modularity and extensibility. The idea is to create a core visual
programming platform, and extend it with other features.

- The source code for the components specific to the application resides in this
[**musicblocks-v4**](https://github.com/sugarlabs/musicblocks-v4/) repository.

- The source code for the programming framework resides in the
[**musicblocks-v4-lib**](https://github.com/sugarlabs/musicblocks-v4-lib/) repository.

- **musicblocks-v4-lib** is bundled as an _npm_ package and imported as a dependency in
**musicblocks-v4**.

### Components

![Component Architecture](docs/images/architecture/components.png)

**Note:** The greyed out components haven't been built yet.

This is a highly pluggable architecture — except for application level functionality, anything related
to project building and execution are features which shall be dynamically pluggable (they may or may
not be configured to load).

Components can be strictly or partially dependent on other components. In case of strict dependency,
a depending component needs to be loaded for a dependent component to be loaded. In case of partial
dependency, a dependent component adds extra functionality to the depending component if it is loaded.

#### Programming Framework

This is reponsible for defining the _syntax constructs_ (_syntax elements_, _syntax tree_) and
utilities (_syntax specification_, _syntax warehouse_), and contains the _execution engine_
(_scheduler_, _interpreter_, _parser_, _symbol table_) for running the program represented by the
_syntax tree_. See
[`musicblocks-v4-lib/README.md`](https://github.com/sugarlabs/musicblocks-v4-lib/blob/develop/README.md)
for details.

The components in `musicblocks-v4` shall use the constructs exposed by `musicblocks-v4-lib`.

#### View Framework

This is responsible for creating the skeleton of the UI — components that have a view shall request
component wrappers from the _view framework_ and encapsule their DOM inside the wrappers.

#### Integration

This is responsible for adding general application-wide functionalities like _internationalisation_,
_project management_, and _activity history_.

#### Plugin - UI

This contains UI components for application-wide interactive/informative functionality.

#### Plugin - Art

This is responsible for artwork generation. It shall contain a set of _syntax elements_ of
instructions and arguments related to artwork generation and artboard (artwork canvas) states.

#### Plugin - Music

This is responsible for music generation. It shall contain a set of _syntax elements_ of
instructions and arguments related to music generation, composition, and music states.

#### Plugin - Bricks

This is responsible for building Music Blocks programs using graphical bricks (blocks).

#### Config

This is responsible for conditionally loading the pluggable components dynamically and sharing instance
references between them.

### Wireframe

![Wireframe](docs/images/wireframe.jpg)

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

## Development

See [**full development guide**](./docs/DEV.md).

### Tech Stack

Music Blocks (v4) is a client-side web application written in _TypeScript_. _React_ is used to render
UI components, however, the project is set up to independently use any _JavaScript_ UI library/framework
or the _JS DOM API_ directly. It is bundled using _Webpack_.

- Application
  - TypeScript 4
  - React 17
  - SCSS

- Tooling
  - Node.js
  - Webpack
  - ESLint
  - Docker

- Testing
  - Jest
  - Cypress
