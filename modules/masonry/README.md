# Masonry

## Overview

Masonry is the graphical project builder for Music Blocks v4. It manages the visual
programming interface, allowing users to build logic using drag & drop code bricks.
It manages the workspace state, visual brick rendering, collision detection,
brick dragging, and the hierarchical block interconnections (such as stacks and towers).

## Development Setup

The Masonry code resides entirely within `modules/masonry`. To run any of the module-specific
scripts, you should typically enter the directory first:

```sh
cd modules/masonry
```

## Playground

The playgrounds are standalone Vite + React development harnesses used for manually testing
masonry components and behaviors without running the full Music Blocks v4 application.

There are two playground environments configured:

- **Playground 1:** Runs on **port 5601**.

    ```sh
    npm run playground
    ```

- **Playground 2 (Harness):** Runs on **port 5602**.

    ```sh
    npm run playground2
    ```

    This serves the newer harness located at `src/playground/`. It includes a built-in
    catalog layout (with a top bar and routing) where contributors can easily register
    new pages to test specific component variants.

## Storybook

Storybook is used for developing and documenting the isolated UI components within the module.

- **Start Storybook:**

    ```sh
    npm run storybook
    ```

- **Port:** Storybook runs on **port 6006**.
- **Location:** Storybook is configured to automatically discover stories inside the `src/`
  directory matching `*.stories.tsx`, `*.stories.ts`, `*.stories.jsx`, `*.stories.js`,
  or `*.mdx` files. The configuration is stored in `.storybook/main.ts`.

## Testing

Masonry uses **Vitest** for unit testing.

- **Run all tests:**

    ```sh
    npm run test
    ```

- **Run tests with coverage:**

    ```sh
    npm run coverage
    ```

    Test files are generally colocated with their source files in the `src/` directory
    (e.g., `*.test.ts`, `*.spec.ts`).

## Linting / Type Checking

- **Linting:** You can lint the Masonry module specifically by running:

    ```sh
    npm run lint
    ```

    This runs ESLint strictly over the `src/` directory.

- **Type Checking & Building:** There is no module-specific `npm run check` or `npm run build`
  command within Masonry. The root `npm run check` does **not** type-check Masonry; the root
  `npm run build` only builds `@sugarlabs/mb4-app`. The root `npm run lint` handles
  repository-wide Markdown/text linting.

## Project Structure

This directory separates the active source codebase from documentation and historical reference
files (as specified in #636).

### Active Directories

- **`src/`**: Contains all the active application logic, components, state management (hooks
  and stores), collision detection, and test specifications for the Masonry module.
- **`src/playground/`**: The modern development harness containing test pages to render
  isolated components in different scenarios (served by `playground2`).
- **`playground/`**: Contains the entry points and HTML for the original test playground
  (served by `playground`).
- **`docs/`**: Relevant internal module documentation.
- **`.storybook/`**: Configuration files for Storybook.

### Reference / Legacy Directories

- **`src.old/`**: This directory contains the older implementation of Masonry. It is retained
  strictly for **reference and legacy purposes** and should not be modified, imported,
  or used in the active codebase.

## Contributing to Masonry

When working on the Masonry module, the standard workflow is:

1. Request assignment to the relevant issue before starting work (see #879).
2. Make targeted changes in `src/`.
3. Boot up `npm run playground2` to visualize and manually verify the interactive behavior
   of the bricks and the workspace.
4. Write or update colocated tests in `src/` and run `npm run test` to verify them.
5. If you created a new UI component, write a story for it and view it using
   `npm run storybook`.
6. Run `npm run lint` within the `modules/masonry` directory.
7. Verify your changes via `git diff` before committing.
