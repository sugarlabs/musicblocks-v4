# Developer Guide

## Setup up the Development Environment

### 1. Without Docker

This is a _**TypeScript**_ project that uses _**React**_. You'll just need
_[**Node.js**](https://nodejs.org/en) v16_ or higher and _**npm**_ installed on your development machine.
Although, this is sufficient to run, build, and test the project as a whole, you might need some
extra tools for other development tasks.

You'll need _**tsc**_ (_TypeScript Compiler_) to manually compile `.ts` files. You'll need
_**ts-node**_ (_Node.js executable for TypeScript_) to manually execute `.ts` scripts directly. Finally,
you'll need an _HTTP_ server like _**http-server**_ (_a HTTP server program_), if you want to serve
files manually.

1. After setting up npm, install the above with:

```bash
npm i -g http-server
npm i -g typescript
npm i -g ts-node
```

_**Note:**_ Users on _Linux_ and _MacOS_ are required to add a `sudo` before these commands.

2. Verify the installation with:

```bash
node -v && npm -v && tsc -v && ts-node -v && http-server -v
```

Output should look like:

```bash
v16.14.0
8.3.1
Version 4.6.2
v10.6.0
v14.1.0
```

3. Clone the repo using:

```bash
git clone https://github.com/sugarlabs/musicblocks-v4.git
```

### 2. With Docker

This project development tools have been containerized using [**docker**](https://www.docker.com/).
Therefore, to use an execution sandbox, it requires **docker** to be installed on the development
machine.

1. Setup _docker_:

    - For _Linux_, [install _Docker Engine_](https://docs.docker.com/engine/install/). You'll also
    need to [install _Docker Compose_](https://docs.docker.com/compose/install/).

    - For _Windows_ or _Mac_, [install _Docker Desktop_](https://www.docker.com/products/docker-desktop/).

2. Open a terminal and navigate to working directory (where the source code will reside).

3. _Clone_ (additional [installation](https://git-scm.com/downloads) of _Git_ required on
Windows) this repository using:

    ```bash
    git clone https://github.com/sugarlabs/musicblocks-v4.git
    ```

4. Build _docker image_ and launch _docker network_.

    _**Note:**_ A
    [built initial development image](https://github.com/sugarlabs/musicblocks-v4/pkgs/container/musicblocks/16217005?tag=4-dev)
    has been published to
    [_Sugar Labs GitHub Container Registry_ (_GHCR_)](https://github.com/orgs/sugarlabs/packages?ecosystem=container),
    which can be pulled directly, so you don't have to build it again. Pull using:

    ```bash
    docker pull ghcr.io/sugarlabs/musicblocks:4-dev
    ```

    Nagivate inside the project directory and launch the _docker network_ using:

    ```bash
    docker-compose up -d
    ```

    or (for _Docker v1.28_ and above):

    ```bash
    docker compose up -d
    ```

    If you haven't pulled the image from the _GitHub Container Registry_ (_GHCR_), it'll first build
    the image using the `Dockerfile`, then launch the _docker network_. If an image already exists
    locally, it'll not be rebuilt. To force a rebuild from the `Dockerfile` before launching the
    _docker network_, add the `--build` flag.

5. In a second terminal, run:

    ```bash
    docker attach musicblocks-4-dev
    ```

    The _Alpine shell_ in the _docker container_ named _musicblocks-4-dev_ is spawned and standard
    input/output is connected to the terminal.

6. _**Node.js**_ (_Node.js Runtime_), _**npm**_ (_Node.js Package Manager_), _**tsc**_ (_TypeScript
    Compiler_), _**ts-node**_ (_Node.js executable for TypeScript_), and _**http-server**_ (_a HTTP
    server program_) should be installed. Check using:

    ```bash
    node -v && npm -v && tsc -v && ts-node -v && http-server -v
    ```

    Output should look like this:

    ```bash
    v16.14.0
    8.3.1
    Version 4.6.2
    v10.6.0
    v14.1.0
    ```

7. To shut down the _docker network_, run (in the same terminal where you ran `docker-compose up -d` or
`docker compose up -d`)

    ```bash
    docker-compose down
    ```

    or (for _Docker v1.28_ and above)

    ```bash
    docker compose down
    ```
## Adding your Personal Access Token (PAT)

**Note: This repository uses `sugarlabs/musicblocks-v4-lib` as an _npm_ package which is published to
the _GitHub npm Registry_ of Sugar Labs. Before you install the dependencies you need to make sure that
your _GitHub Personal Access Token_ (_PAT_) is stored in your local system's _npm_ configuration file
`.npmrc`.**

Learn
[how to create a _PAT_](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-token).

**Note: Ensure to mark the checkbox labeled ```read: packages```**

Add your _PAT_ to `.npmrc` using:

```bash
echo "//npm.pkg.github.com/:_authToken=[YOUR_GITHUB_PERSONAL_ACCESS_TOKEN]" >> ~/.npmrc
```
## Run a development server and test suites



After you are set-up, the steps you take depend on what you want to do:



1. To install the dependencies (in `package.json`), run:

    ```bash
    npm ci
    ```

2. Run _React scripts_.

    - For unoptimized development serving, run:

        ```bash
        npm run serve
        ```

    Visit `localhost:5173` in a browser to view the web page served.

    - For generating a generic production build, run:

        ```bash
        npm run build
        ```

    - For generating a production build under the subdirectory `/musicblocks-v4/`, run:

        ```bash
        npm run build:gh
        ```

    - For serving the last production build (`dist` folder), run:

        ```bash
        npm run preview
        ```

        Visit `localhost:4173` in a browser to view the web page served.

     - For running unit tests, run:

        ```bash
        npm run test:unit
        ```

    - For running E2E tests, run:

        ```bash
        ## In 1 terminal
        npm run build
        npm run preview
        ## In another terminal
        npm run test:e2e
        ```

_**Note:**_ If you're running using _Docker Desktop_ on _Windows_ or _Mac_, you might experience longer execution times for these scripts. This happens due to cross-file-system communication. Duration varies across machines; duration primarily depends on hard drive read/write speed.

## Miscellaneous commands

  _**Note:**_ This requires _**Node.js**_ (_Node.js Runtime_), _**tsc**_ (_TypeScript Compiler_), and
  _**ts-node**_ (_Node.js executable for TypeScript_) to be installed. If you are using _Docker_, they'll
  be pre-installed in the container.

  - To launch the _Node.js runtime_, run:

    ```bash
    node
    ```

  - To run a _JavaScript_ file, say `file.js`, run:

    ```bash
    node file.js
    ```

  - To transpile a _TypeScipt_ file, say `file.ts`, to _JavaScript_, run:

    ```bash
    tsc file.ts
    ```

    This transpilation produces `file.js`.

  - To run a _TypeScript_ file directly, say `file.ts`, run:

    ```bash
    ts-node file.ts
    ```

## Editor

_All code is just plain text, so it doesn't really matter what you use to edit them._ However,
using modern, feature-rich IDEs/text-editors like [_**Atom**_](https://github.blog/2022-06-08-sunsetting-atom/),
[_**Brackets**_](https://brackets.io), [_**WebStorm**_](https://www.jetbrains.com/webstorm/),
[_**Sublime Text**_](https://www.sublimetext.com/),
[_**Visual Studio Code**_](https://code.visualstudio.com/), etc. makes life way easier. These come
with a directory-tree explorer, and an integrated terminal, at the very least, while having support
for plugins/extensions to expand their functionality.

Some (non-exhaustive) benefits of using these are _syntax highlighting_,
_warning/error annotations_, _formatting_, _auto-refactoring_, tons of customizable
_keyboard shortcuts_, etc.

_**Visual Studio Code**_ (_**VSCode**_) is currently the most-popular code editor for reasons like
being _lightweight_, _cleaner_, large marketplace of _extensions_, integrated _source control_
features, _debugger_, _remote explorer_ support, _regular expression_ based find/replace, etc.
