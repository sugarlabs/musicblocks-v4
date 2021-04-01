# Core (engine) of musicblocks-v4

The core of the new [Music Blocks (v4)](https://github.com/sugarlabs/musicblocks-v4) application.

## Tech Stack

This core of Music Blocks v4 uses `TypeScript 4`. In addition, `Jest` shall be used for testing.
`Webpack` has been configured to transpile and bundle the source code, for deployment on a web
browser.

## Contributing

Programmers, please follow these general
[guidelines for contributions](https://github.com/sugarlabs/sugar-docs/blob/master/src/contributing.md).

### New Contributors

Use the [discussions](https://github.com/sugarlabs/musicblocks-v4-lib/discussions) tab at the top of
the repository to:

- Ask questions you’re wondering about.
- Share ideas.
- Engage with other community members.

Feel free. But, please don't spam :p.

### Keep in Mind

1. Your contributions need not necessarily have to address any discovered issue. If you encounter
any, feel free to add a fix through a PR, or create a new issue ticket.

2. Use [labels](https://github.com/sugarlabs/musicblocks-v4-lib/labels) on your issues and PRs.

3. Do not spam with lots of PRs with little changes.

4. If you are addressing a bulk change, divide your commits across multiple PRs, and send them one
at a time. The fewer the number of files addressed per PR, the better.

5. Communicate effectively. Go straight to the point. You don't need to address anyone using
'_sir_'. Don't write unnecessary comments; don't be over-apologetic. There is no superiority
hierarchy. Every single contribution is welcome, as long as it doesn't spam or distract the flow.

6. Write useful, brief commit messages. Add commit descriptions if necessary. PR name should speak
about what it is addressing and not the issue. In case a PR fixes an issue, use `fixes #ticketno` or
`closes #ticketno` in the PR's comment. Briefly explain what your PR is doing.

7. Always test your changes extensively before creating a PR. There's no sense in merging broken
code. If a PR is a _work in progress (WIP)_, convert it to draft. It'll let the maintainers know it
isn't ready for merging.

8. Read and revise the concepts about programming constructs you're dealing with. You must be clear
about the behavior of the language or compiler/transpiler. See
[JavaScript docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript) and
[TypeScript docs](https://www.typescriptlang.org/docs/).

9. If you have a question, do a _web search_ first. If you don't find any satisfactory answer, then
ask it in a comment. If it is a general question about Music Blocks, please use the new
[discussions](https://github.com/sugarlabs/musicblocks/discussions) tab on top the the repository,
or the _Sugar-dev Devel <[sugar-devel@lists.sugarlabs.org](mailto:sugar-devel@lists.sugarlabs.org)>_
mailing list. Don't ask silly questions (unless you don't know it is silly ;p) before searching it
on the web.

### Code Quality Notes

1. Sticking to _TypeScript_ conventions, use _camelCase_ for filenames, _CAPITALCASE_ for
constants, _camelCase_ for identifiers, and _PascalCase for classes_. Linting has been strictly
configured. A `super-linter` is configured to lint check the files on a pull request. In fact, the
_TypeScript_ watcher or build will throw errors/warnings if there are linting problems. This has
been done to maintain code quality.

2. If a PR is addressing an issue, prefix the branch name with the issue number. For example, say a
PR is addressing issue `100`, a branch name could be `100-patch-foobar`.

3. Meaningfully separate code across commits. Don't create arbitrary commits. In case it gets
dirty, please do an _interactive rebase_ with _squash_ and _reword_ to improve.

4. Follow
[conventional commit messages specification](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)
to help issue tracking. More often than not, take time to add meaningful commit descriptions.

5. At any point, when new components are created or existing components are modified, unit tests
(passing) reflecting the changes need to be part of the PR before being reviewed.

6. Two workflows &mdash; a _Continuous Integration_ (_CI_) and a _Linter_ (_Super Linter_) has been
configured. Each PR must pass the checks before being reviewed.

7. For any new functions/methods or classes, add extensive [TSDoc](https://tsdoc.org/) documentation.

8. Each PR needs to have supporting unit tests covering all (or as much practical) use cases to
qualify for review. In case testing is done via some non-standard method, adequate description of
the method/s need/s to be specified in the PR body.

_Please note there is no need to ask permission to work on an issue. You should check for pull
requests linked to an issue you are addressing; if there are none, then assume nobody has done
anything. Begin to fix the problem, test, make your commits, push your commits, then make a pull
request. Mention an issue number in the pull request, but not the commit message. These practices
allow the competition of ideas (Sugar Labs is a meritocracy)._

## Setup Development Environment

_This project is containerized using [**docker**](https://www.docker.com/). Therefore, it requires
**docker** to be installed on the development machine._

1. Setup _docker_.

    - For _Linux_, [install _Docker Engine_](https://docs.docker.com/engine/install/).
    - For _Windows_ or _Mac_ (_x86_64 / amd64_),
    [install _Docker Desktop_](https://www.docker.com/products/docker-desktop).

2. Open a teminal and navigate to working directory (where the source code will reside).

3. _Git Clone_ (additional [installation](https://git-scm.com/downloads) of _Git_ required on
Windows) this repository using

    ```bash
    git clone https://github.com/sugarlabs/musicblocks-v4-lib.git
    ```

4. Build _docker image_ and launch _docker network_.

    _**Note:**_ A
    [built initial development image](https://github.com/orgs/sugarlabs/packages/container/musicblocks/531083)
    has been published to
    [_Sugar Labs GitHub Container Registry_ (_GHCR_)](https://github.com/orgs/sugarlabs/packages?ecosystem=container),
    which can be pulled directly, so you don't have to build it again. Pull using

    ```bash
    docker pull ghcr.io/sugarlabs/musicblocks:initial
    ```

    Nagivate inside the project directory and launch the _docker network_ using

    ```bash
    docker-compose up -d
    ```

    or (for _Docker v1.28_ and above)

    ```bash
    docker compose up -d
    ```

    If you haven't pulled the image from the _GitHub Container Registry_ (_GHCR_), it'll first build
    the image using the `Dockerfile`, then launch the _docker network_. If an image already exists
    locally, it'll not be rebuilt. To force a rebuild from the `Dockerfile` before launching the
    _docker network_, add the `--build` flag.

5. In another terminal, run

    ```bash
    docker attach musicblocks
    ```

6. The _Linux Debian 10.7_ (_buster_) _shell_ in the _docker container_ named _musicblocks_ is
spawned and standard input/output is connected to the terminal.

    _**Node**_ (_Node.js Runtime_), _**npm**_ (_Node Package Manager_), _**tsc**_ (_TypeScript
    Compiler_), and _**ts-node**_ (_Node executable for TypeScript_) should be installed. Check
    using

    ```bash
    node --version && npm --version && tsc --version && ts-node --version
    ```

    Output should look like

    ```bash
    v14.15.3
    6.14.10
    Version 4.1.3
    v9.1.1
    ```

7. To shut down the _docker network_, run (in the terminal where you ran `docker-compose up -d` or
`docker compose up -d`)

    ```bash
    docker-compose down
    ```

    or (for _Docker v1.28_ and above)

    ```bash
    docker compose down
    ```

8. To install all the dependencies (in `package.json`), run

    ```bash
    npm ci
    ```

9. Miscellaneous commands.

    - To launch the _Node runtime_, run

        ```bash
        node
        ```

    - To run a _JavaScript_ file, say `file.js`, run

        ```bash
        node file.js
        ```

    - To transpile a _TypeScipt_ file, say `file.ts`, to _JavaScript_, run

        ```bash
        tsc file.ts
        ```

        This transpilation produces `file.js`.

    - To run a _TypeScript_ file directly, say `file.ts`, run

        ```bash
        ts-node file.ts
        ```

10. Configured scripts.

    - For testing, run

        ```bash
        npm run test
        ```

        To run a specific path

        ```bash
        npm run test -- "test/path"
        ```

        To run in watch mode

        ```bash
        npm run test -- "test/path" --watch
        ```

    - For generating a production build, run

        ```bash
        npm run build
        ```

    - For checking linting problems

        ```bash
        npm run lint
        ```

        To autofix fixable problems

        ```bash
        npm run lint -- --fix
        ```

    _**Note:**_ If you're running using _Docker Desktop_ on _Windows_ or _Mac_, you might experience
    longer execution times for these scripts. This happens due to cross-file-system communication.
    Duration varies across machines; duration primarily depends on hard drive read/write speed.

## Editor

_All code is just plain text, so it doesn't really matter what you use to edit them._ However,
using modern, feature-rich IDEs/text-editors like [_**Atom**_](https://atom.io/),
[_**Brackets**_](http://brackets.io/), [_**WebStorm**_](https://www.jetbrains.com/webstorm/),
[_**Sublime Text**_](https://www.sublimetext.com/),
[_**Visual Studio Code**_](https://code.visualstudio.com/), etc. makes life way easier. These come
with a directory-tree explorer, and an integrated terminal, at the very least, while having support
for plugins/extensions to expand their functionality.

Some (non-exhaustive) benefits of using these are _syntax highlighting_,
_warning/error annotations_, _formatting_, _auto-refactoring_, tons of customizable
_keyboard shortcuts_, etc.

_**Visual Studio Code**_ (_**VSCode**_) is currently the most-popular code editor for reasons like
being _lightweight_, _cleaner_, large marketplace of _extensions_, integrated _Source Control_
features, _debugger_, _remote explorer_ support, _Regular Expression_ (_regex_) based find/replace,
etc.

In fact, a workspace configuration file for _vscode_`.vscode/settings.json` has already been added.
Recommended extensions for this project are `Babel JavaScript`, `Docker`, `ESLint`, `Git Graph`,
`GitLens`, `markdownlint`, `Prettier`, `SCSS IntelliSense`, and `SVG`.

All that, however, shouldn't necessarily stop you from using _**Emacs**_, _**Nano**_, or _**Vim**_,
if that's your poison :D. Happy coding!
