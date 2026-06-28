# Programming framework of musicblocks-v4

This repository contains the source code for the programming framework of the new
[Music Blocks (v4)](https://github.com/sugarlabs/musicblocks-v4) application.

## Architecture

![Architecture](docs/images/architecture.jpg)

### Syntax Representation

- **Element API** represents *syntax elements* — the atomic constructs for building programs. There
are 2 kinds of *syntax elements*:

  - **Arguments** which return values. These are of 2 types:

    - **Data** which return a value inherently and without operating on other provided values

    - **Expression** which return a value after operating on other provided values

  - **Instructions** which perform a task. These are of 2 types:

    - **Statements** perform a single task

    - **Blocks** encapsulate *statements* and generally set some states or control the flow to them

- **Specification** maintains a table of actual *syntax elements* which can be used to build programs.

- **Warehouse** maintains a table of instances of *syntax elements* registered in the *specification*.
It can also generate statistics about the instances.

- **Tree** represents the *syntax tree* (*abstract syntax tree* or *AST*) by maintaining interconnections
between *syntax elements*.

### Execution

- **Symbol Table** maintains tables of dynamic variables and states which the *syntax elements* can
use during execution.

- **Parser** parses the *syntax tree* in a postorder sequence, and maintains *call frame stacks* and
the *program counter*.

- **Interpreter** fetches elements from the parser and executes them.

- **Scheduler** manages the concurrent orchestration of the execution process.

**Monitor** proxies information about the execution states and statictics.

There are 2 special constructs: **Process** and **Routine**. These are special *block* elements.
**Routines** encapsulate *instructions* that can be executed by multiple **processes**. **Processes**
encapsulate independent set of instructions, and multiple **processes** can run concurrently.

There is an additional terminology called **crumbs** which are sets of connected *syntax elements*
not part of any *process* or *routine*.

### Plugins

The core framework doesn't define any special *syntax elements* other than *process* and *routine*.
All concrete *syntax elements* are plugins which extend the *syntax element API* and are registered
in the *syntax specification*.

A set of programming specific *syntax elements* are bundled as a library, which use nothing beyond
the set of constructs exposed by the *syntax element API*.
