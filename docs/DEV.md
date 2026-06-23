# Developer Guide

## Setup Development Environment

### Without Docker

This is a _**TypeScript**_ project that uses _**React**_. You'll need Node.js v24+ and npm v11+ installed on your development machine.
Although, this is sufficient to run, build, and test the project as a whole, you might need some
extra tools for other development tasks.

You'll need _**tsc**_ (_TypeScript Compiler_) to manually compile `.ts` files. You'll need
_**ts-node**_ (_Node.js executable for TypeScript_) to manually execute `.ts` scripts directly. Finally,
you'll need an _HTTP_ server like _**http-server**_ (_a HTTP server program_), if you want to serve
files manually.

Once _**npm**_ is installed, to install the above, run

```bash
npm i -g http-server
npm i -g typescript
npm i -g ts-node
```

_**Note:**_ Users on _Linux_ and _MacOS_ are required to add a `sudo` before these commands.

```bash
v16.14.0
8.3.1
Version 4.6.2
v10.6.0
v14.1.0
```

Output should look like

```bash
v16.14.0
8.3.1
Version 4.6.2
v10.6.0
v14.1.0
```

### With Docker

This project development tools have been containerized using [**Docker**](https://www.docker.com/).
Therefore, to use an execution sandbox, it requires **Docker** to be installed on the development
machine.

1. Setup _Docker_.

    - For _Linux_, [install _Docker Engine_](https://docs.docker.com/engine/install/). You'll also
    need to [install _Docker Compose_](https://docs.docker.com/compose/install/).

    - For _Windows_ or _Mac_, [install _Docker Desktop_](https://www.docker.com/products/docker-desktop/).

2. Open a terminal and navigate to working directory (where the source code will reside).

3. _Git Clone_ (additional [installation](https://git-scm.com/downloads/) of _Git_ required on
Windows) this repository using

    ```bash
    git clone https://github.com/sugarlabs/musicblocks-v4.git
    ```

4. Build _Docker image_ and launch _Docker network_.

    _**Note:**_ A
    [built initial development image](https://github.com/sugarlabs/musicblocks-v4/pkgs/container/musicblocks/16217005?tag=4-dev)
    has been published to
    [_Sugar Labs GitHub Container Registry_ (_GHCR_)](https://github.com/orgs/sugarlabs/packages?ecosystem=container),
    which can be pulled directly, so you don't have to build it again. Pull using

    ```bash
    docker pull ghcr.io/sugarlabs/musicblocks:4-dev
    ```

    Nagivate inside the project directory and launch the _Docker network_ using

    ```bash
    docker-compose up -d
    ```

    or (for _Docker v1.28_ and above)

    ```bash
    docker compose up -d
    ```

    If you haven't pulled the image from the _GitHub Container Registry_ (_GHCR_), it'll first build
    the image using the `Dockerfile`, then launch the _Docker network_. If an image already exists
    locally, it'll not be rebuilt. To force a rebuild from the `Dockerfile` before launching the
    _Docker network_, add the `--build` flag.

5. In a second terminal, run

    ```bash
    docker attach musicblocks-4-dev
    ```

    The _Alpine shell_ in the _Docker container_ named _musicblocks-4-dev_ is spawned and standard
    input/output is connected to the terminal.

6. _**Node.js**_ (_Node.js Runtime_), _**npm**_ (_Node.js Package Manager_), _**tsc**_ (_TypeScript
    Compiler_), _**ts-node**_ (_Node.js executable for TypeScript_), and _**http-server**_ (_a HTTP
    server program_) should be installed. Check using

    ```bash
    node -v && npm -v && tsc -v && ts-node -v && http-server -v
    ```

    Output should look like

    ```bash
    v16.14.0
    8.3.1
    Version 4.6.2
    v10.6.0
    v14.1.0
    ```

7. To shut down the _Docker network_, run (in the terminal where you ran `docker-compose up -d` or
`docker compose up -d`)

    ```bash
    docker-compose down
    ```

    or (for _Docker v1.28_ and above)

    ```bash
    docker compose down
    ```

---

### 🪟 Windows Setup Notes (Important)

This project works on Windows, but some commands and tools behave differently compared to Linux/macOS terminals. Follow the notes below to avoid common issues.

---

### Use PowerShell 7 (Recommended)

Older versions of PowerShell (v5 or below) may not support some commands properly (like `&&` chaining).

Check your PowerShell version:

```powershell
$PSVersionTable.PSVersion
```

If your version is below 7, install PowerShell 7:

[Learn Powershell 7](https://learn.microsoft.com/powershell/)

### Command Separator Issue (&&)

In some Windows terminals (especially older CMD or PowerShell versions), `&&` may not work consistently.

Instead of running:

```bash
node -v && npm -v && tsc -v && ts-node -v && http-server -v
```

Run each command separately:

```bash
node -v
npm -v
tsc -v
ts-node -v
http-server -v
```

### Script Execution Policy Error (tsc / ts-node)

If you see an error like:

```error
tsc : File ... cannot be loaded because running scripts is disabled on this system
```

This is due to PowerShell execution policy.

To fix it (optional), run PowerShell as Administrator and execute:

```Powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Note: Only change execution policy if you understand the security implications.**

### Node.js Version Recommendation

This project is tested with Node.js v16.

Check your version:

```bash
node -v
```

If needed, install Node.js from:
[Node.js](https://nodejs.org/)

### npm Global Packages (Optional Tools)

The following tools are optional and not required for the app itself, but may help in development:

```bash
npm i -g http-server
npm i -g typescript
npm i -g ts-node
```

**Note: On Windows, you may need to run the terminal as Administrator.**

## Commands

**Note: This repository uses `sugarlabs/musicblocks-v4-lib` as an _npm_ package which is published to
the _GitHub npm Registry_ of Sugar Labs. Before you install the dependencies you need to make sure that
your _GitHub Personal Access Token_ (_PAT_) is stored in your local system's _npm_ configuration file
`.npmrc`.**

**Note: Be sure to request permission for ```read: packages```**

Learn
[how to create a _PAT_](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-token).

Add your _PAT_ to `.npmrc` using

```bash
echo "//npm.pkg.github.com/:_authToken=[YOUR_GITHUB_PERSONAL_ACCESS_TOKEN]" >> ~/.npmrc
```

After you are set-up, the steps you take depend on what you want to do:

- **Run a development server and test suites**

    1. To install all the dependencies (in `package.json`), run

        ```bash
        npm ci
        ```

    2. Run _React scripts_.

        - For unoptimized development serving, run

            ```bash
            npm run serve
            ```

            Visit `localhost:5173` in a browser to view the web page served.

        - For generating a generic production build, run

            ```bash
            npm run build
            ```

        - For generating a production build under the subdirectory `/musicblocks-v4/`, run

            ```bash
            npm run build:gh
            ```

        - For serving the last production build (`dist` folder), run

            ```bash
            npm run preview
            ```

            Visit `localhost:4173` in a browser to view the web page served.

        - For running unit tests, run

            ```bash
            npm run test:unit
            ```

        - For running end-to-end tests, run

            ```bash
            ## In terminal 1
            npm run build
            npm run preview

            ## In terminal 2
            npm run test:e2e
            ```

        _**Note:**_ If you're running using _Docker Desktop_ on _Windows_ or _Mac_, you might experience
        longer execution times for these scripts. This happens due to cross-file-system communication.
        Duration varies across machines; duration primarily depends on hard drive read/write speed.

- **Miscellaneous commands**

  _**Note:**_ This requires _**Node.js**_ (_Node.js Runtime_), _**tsc**_ (_TypeScript Compiler_), and
  _**ts-node**_ (_Node.js executable for TypeScript_) to be installed. If you are using _Docker_, they'll
  be pre-installed in the container.

  - To launch the _Node.js runtime_, run

    ```bash
    node
    ```

  - To run a _JavaScript_ file, say `file.js`, run

    ```bash
    node file.js
    ```

  - To transpile a _TypeScript_ file, say `file.ts`, to _JavaScript_, run

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
using modern, feature-rich IDEs/text-editors like [_**Atom**_](https://github.blog/news-insights/product-news/sunsetting-atom/),
[_**Brackets**_](https://brackets.io), [_**WebStorm**_](https://www.jetbrains.com/webstorm/),
[_**Sublime Text**_](https://www.sublimetext.com/),
[_**Visual Studio Code**_](https://code.visualstudio.com/), etc. makes life way easier. These come
with a directory-tree explorer, and an integrated terminal, at the very least, while having support
for plugins/extensions to expand their functionality.

Some (non-exhaustive) benefits of using these are _syntax highlighting_,
_warning/error annotations_, _formatting_, _auto-refactoring_, tons of customizable
_keyboard shortcuts_, etc.

_**Visual Studio Code**_ (_**Visual Studio Code**_) is currently the most-popular code editor for
reasons like being _lightweight_, _cleaner_, large marketplace of _extensions_, integrated _source control_
features, _debugger_, _remote explorer_ support, _regular expression_ based find/replace, etc.

In fact, a workspace configuration file for _Visual Studio Code_`.vscode/settings.json` has already
been added. Recommended extensions for this project are `Babel JavaScript`, `Docker`, `ESLint`,
`Git Graph`, `GitLens`, `markdownlint`, `Prettier`, `SCSS IntelliSense`, and `SVG`.

All that, however, shouldn't necessarily stop you from using _**Emacs**_, _**Nano**_, or _**Vim**_,
if that's your poison :D. Happy coding!
