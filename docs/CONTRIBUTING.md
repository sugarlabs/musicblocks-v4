# Contributing Guide

## New Contributors

Use the [discussions](https://github.com/sugarlabs/musicblocks-v4/discussions) tab at the top of
the repository to:

- Ask questions you're wondering about.
- Share ideas.
- Engage with other community members.

Feel free. But, please don't spam :p.

## Keep in Mind

1. Your contributions need not necessarily have to address any discovered issue. If you encounter any,
feel free to add a fix through a PR, or create a new issue ticket.

2. Use [labels](https://github.com/sugarlabs/musicblocks-v4/labels) on your issues and PRs.

3. Do not spam with lots of PRs with little changes.

4. If you are addressing a bulk change, divide your commits across multiple PRs, and send them one at
a time. The fewer the number of files addressed per PR, the better.

5. Communicate effectively. Go straight to the point. Don't write unnecessary comments; don't be
over-apologetic. Every single contribution is welcome, as long as it doesn't spam or distract the flow.

6. Write useful, brief commit messages. Add commit descriptions if necessary. PR name should speak
about what it is addressing and not the issue. In case a PR fixes an issue, use `fixes #ticketno` or
`closes #ticketno` in the PR's comment. Briefly explain what your PR is doing.

7. Always test your changes extensively before creating a PR. There's no sense in merging broken code.
If a PR is a _work in progress (WIP)_, convert it to draft. It'll let the maintainers know it isn't
ready for merging.

8. Read and revise the concepts about programming constructs you're dealing with. You must be clear
about the behavior of the language or compiler/transpiler. See
[JavaScript docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript) and [TypeScript docs](https://www.typescriptlang.org/docs/).

9. If you have a question, do a _web search_ first. If you don't find any satisfactory answer, then
ask it in a comment. If it is a general question about Music Blocks, please use the new
[discussions](https://github.com/sugarlabs/musicblocks/discussions) tab on top the the repository, or
the _Sugar-dev Devel <[sugar-devel@lists.sugarlabs.org](mailto:sugar-devel@lists.sugarlabs.org)>_ mailing
list. Don't ask silly questions (unless you don't know it is silly ;p) before searching it on the web.

## Code Quality Notes

1. Sticking to _TypeScript_ conventions, use _camelCase_ for filenames (_PascalCase_ for _class_ files),
_CAPITALCASE_ for constants, _camelCase_ for identifiers, and _PascalCase_ for _classes_. Linting has
been strictly configured. A `super-linter` is configured to lint check the files on a pull request.
In fact, the _TypeScript_ watcher or build will throw errors/warnings if there are linting problems.
This has been done to maintain code quality.

2. If a PR is addressing an issue, prefix the branch name with the issue number. For example, say a
PR is addressing issue `100`, a branch name could be `100-patch-foobar`.

3. Meaningfully separate code across commits. Don't create arbitrary commits. In case it gets dirty,
please do an _interactive rebase_ with _squash_ and _reword_ to improve.

4. Follow [conventional commit messages specification](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)
to help issue tracking. More often than not, take time to add meaningful commit descriptions. However,
add specificity by mentioning the component; prefer `feat(mycomponent): [UI] add button` over
`feat: add button`, `fix(mycomponent): use try-catch` over `fix: use try-catch`, etc.

5. At any point, when new components are created or existing components are modified, unit tests (passing)
reflecting the changes need to be part of the PR before being reviewed.

6. Two workflows -- a _Continuous Integration_ (_CI_) and a _Linter_ (_Super Linter_), have been configured.
Each PR must pass the checks before being reviewed.

7. For any new functions/methods or classes, add extensive [TSDoc](https://tsdoc.org/) documentation.

8. Each PR needs to have supporting unit tests covering all (or as much practical) use cases to qualify
for review. In case testing is done via some non-standard method, adequate description of the method/s
need/s to be specified in the PR body.

## Checklist before Commits

- Make sure there are no _TypeScript_ warnings/errors. Run `npm run check` to verify.

- Make sure there are no linting errors. Run `npm run lint` to verify.

- Format code you've modified. Run `npx prettier -w <file 1> <file 2> ...`.

- Make sure the application builds successfully. Run `npm run build` to verify.

- Add meaningful documentation to every new function/method/class/type added.

- One commit must address only one concept. Do not add multiple unrelated changes in one commit.
