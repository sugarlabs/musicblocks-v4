# musicblocks.js

The core of the new [Music Blocks 2.0](https://github.com/sugarlabs/musicblocks-2) application.

## Tech Stack

This core of Music Blocks 2.0 uses `TypeScript 4`. In addition, `ts-jest` shall be used for testing.
`Webpack` has been configured to transpile and bundle the source code, for deployment on a web
browser.

## Contributing

Programmers, please follow these general
[guidelines for contributions](https://github.com/sugarlabs/sugar-docs/blob/master/src/contributing.md).

### New Contributors

Use the [discussions](https://github.com/sugarlabs/musicblocks/discussions) tab at the top of the
repository to:

- Ask questions you’re wondering about.
- Share ideas.
- Engage with other community members.

Feel free. But, please don't spam :p.

### Keep in Mind

1. Your contributions need not necessarily have to address any discovered issue. If you encounter
any, feel free to add a fix through a PR, or create a new issue ticket.

2. Use [labels](https://github.com/sugarlabs/musicblocks/labels) on your issues and PRs.

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
    git clone https://github.com/sugarlabs/musicblocks-2.git
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

7. To shut down the _docker network_, run (in the terminal where you ran `docker-compose up -d`)

    ```bash
    docker-compose down
    ```

8. To install all the dependencies (in `package.json`), run

    ```bash
    npm ci
    ```

9. To spawn a _HTTP Server_ (uses _Python 3_'s `http.server`), run

    ```bash
    npm run serve
    ```

    This is spawned on `0.0.0.0:80` inside the container, but mapped to `localhost:5001` on host.
    Visit `localhost:5001` in a browser to view the webpage served.

10. Run _React scripts_.

    - For unoptimized development serving, run

        ```bash
        npm start
        ```

        This is spawned on `127.0.0.1:3000` inside the container, but mapped to `localhost:5000` on
        host. Visit `localhost:5000` in a browser to view the webpage served.

    - For testing, run

        ```bash
        npm run test
        ```

    - For generating a production build, run

        ```bash
        npm run build
        ```

    _**Note:**_ If you're running using _Docker Desktop_ on _Windows_ or _Mac_, you might experience
    longer execution times for these scripts. This happens due to cross-file-system communication.
    Duration varies across machines; duration primarily depends on hard drive read/write speed.

11. Miscellaneous commands.

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
