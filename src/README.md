# src (directory for all source code)

This project aims at building a frontend application based on the
[_Model-View-Controller_ (_MVC_)](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
architecture. Therefore, it shall have 3 top-level components:

- _**Model**_ (or _**engine**_) that shall be responsible for all the state management and data
processing algorithms. We plan to primarily use _TypeScript_ and some _Dart_, both of which shall be
transpiled to _JavaScript_ (by a transpiler set up by a bundler).

- _**View**_ (or _**client**_) that shall be reponsible for the user-end functionality by outputting
media to the user, and handling interactions. We plan to use different clients for different devices
— possibly one for desktop/laptop like devices, and one for handheld mobile devices. We plan to use
_React v17_ for constructing the UI components.

- _**Controller**_ (or _**broker**_) that shall be responsible for the cross-component
communication. This component shall include a _pool_ (or shared memory) which both of the components
mentioned prior would be able to access. The primary activity of this component shall be to act as a
messenger between the _Model_ and the _View_, thereby virtually separating the two components.

## Libraries

At the moment, the identified libraries are:

- [Tone.js](https://tonejs.github.io/) for _Audio Synthesis_ and _Scheduling_.
- [p5.js](https://p5js.org/) for _Graphics_.
- [wheelnav.js](http://wheelnavjs.softwaretailoring.net/) for UI _Pie Menus_.

More libraries might be required down the development pipeline. We shall prefer the use of _npm_ for
managing libraries.

## Files

The _docker container_ environment is based on a slimmed version of _Debian 10.7_ (_buster_). By our
requirements, it comes with _Python 3_, and has been further configured with _Node_, _npm_,
_TypeScript_, and _Dart-SDK_. A _React v17_ project has been set up using `create-react-app` with a
_TypeScript_ template. A _node-sass_ plugin has been installed, to work with `.scss` files. Finally,
`eslint` and `prettier` configurations have been added for maintaining code-standards and
formatting, respectively.

`create-react-app` has installed a bundler (_Webpack_) which can bundle up all the files and
generate an optimized _production build_. It has also installed _Jest_, which we shall use for
_unit testing_, _integration testing_, and _e2e_ (_end-to-end_) _testing_.

- **`../public` directory** contains static files for the _React_ application.

  - `index.html`: Initial home page (we shall create a _React Single-Page-Application_ or _SPA_ so
  it shall be the only `.html` file; all _DOM_ elements will be populated by _React_ and bundled).

  - `manifest`: Required for creating a _Progressive Web App_ (_PWA_).

  - `robots.txt`: For _Web Crawlers_.

  - _Rest are static assets, e.g. images, logos, etc._.

- `react-app-env.d.ts`: References the types of _react-scripts_, and helps with things like allowing
for _SVG_ imports.

- `reportWebVitals.ts`: Utilities for measuring application performance.

- `setupTests.ts`: Sets up _Jest_.

- `index.tsx`: Entry point for the application.

- `index.scss`: Global _SASS_ (for _CSS_) properties.

- `App.tsx`: Top-level _React_ component.

- `App.scss`: _SASS_ for `App.tsx`.

- `App.test.tsx`: Testing utilities for `App` component.

- **`view` directory** contains all the significant _React_ components.

  - **`web`**: Component definitons for a big-screen web-client.
  - **`mobile`** (_not created yet_): Component definitions for small-screen devices like
  smartphones.

- **`model` directory** (_not created yet_) shall contain all the "stuff" for the _engine_.

- **`controller` directory** (_not created yet_) shall contain all the utilities required for
communication between `view` and `model`.

- **`.sample` directory** contains test scripts to check the compilers/runtime.

  - `dart/test.dart`: A sample `.dart` file to test the _Dart_ compiler.
  - `js/test.js`: A sample `.js` file to test the _Node_ runtime.
  - `ts/test.ts`: A sample `.ts` file to test the _TypeScript_ compiler (transpiler).
