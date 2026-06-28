# Contributing Guide

Contributions of all kinds are welcome — whether this is your first open source PR or you are
a seasoned developer. This guide walks you through everything you need to get started.

## Finding Something to Work On

- Browse issues labeled [**`good first issue`**](https://github.com/sugarlabs/musicblocks-v4/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
  for beginner-friendly starting points.
- Check the [**project board**](https://github.com/orgs/sugarlabs/projects/9) for a broader
  view of ongoing work.
- No permission is needed. Unassigned issues are free to pick up. If an issue has an assignee,
  leave a comment to check whether work is still in progress before starting.
- If anything about an issue is unclear, leave a comment asking for clarification before you
  start — it's always better to ask upfront than to head in the wrong direction.

## Workflow

1. **Pick an issue** and confirm no open PR is already addressing it.
2. **Create a branch** prefixed with the issue number — e.g. `#100-patch-foobar`.
3. **Make your changes**, keeping each commit focused on one concept.
4. **Test thoroughly** before opening a PR. Run through the checklist below.
5. **Open a pull request** against the `develop` branch.
   - The title should describe what the PR does, not the issue.
   - Reference the issue with `fixes #N` or `closes #N` in the PR body.
   - If the PR is not ready for review, open it as a draft.
6. **Respond to review feedback** promptly and keep the discussion focused.

## Before You Submit

- [ ] No TypeScript errors or warnings — `npm run check`
- [ ] No linting errors — `npm run lint`
- [ ] Code is formatted — `npx prettier -w <files>`
- [ ] Application builds successfully — `npm run build`
- [ ] New functions, methods, classes, and types have [TSDoc](https://tsdoc.org/) documentation
- [ ] Tests are added or updated to cover your changes
- [ ] Each commit addresses exactly one concept

## Code Standards

### Naming and style

Use TypeScript conventions throughout: `camelCase` for filenames and identifiers,
`PascalCase` for classes and class files, `UPPER_CASE` for constants. ESLint and Prettier
are configured strictly — the build will surface violations.

### Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)
specification. Include the component in the scope:

- `#123 | feat(scope): add toolbar button` — not `feat: add button`
- `#123 | fix(scope): handle null state` — not `fix: handle null`

Add a commit description when the one-line summary is not enough. If a branch gets messy,
use `git rebase -i` to squash or reword before opening a PR.

### Pull requests

- Keep PRs small and focused. Avoid bundling unrelated changes.
- For bulk changes, split across multiple PRs and send them one at a time.
- Every PR must pass the CI and linter checks before it will be reviewed.
- Unit tests covering your changes are required for a PR to qualify for review.

## Community

Use the [discussions](https://github.com/sugarlabs/musicblocks-v4/discussions) tab to ask
questions, share ideas, or follow planning progress. Before asking a question, do a quick
web search first — most TypeScript and JavaScript questions are well covered on
[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript) and the
[TypeScript docs](https://www.typescriptlang.org/docs/).

Communicate concisely and directly. Every contribution is welcome as long as it keeps the
project moving forward.
