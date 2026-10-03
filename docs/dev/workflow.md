# Development workflow — one feature per branch, PR, and Linear task

This is the human-readable entry point for how we track and ship work. The binding,
always-included rule lives in
[`.kiro/steering/git-linear-workflow.md`](../../.kiro/steering/git-linear-workflow.md),
and the agent-facing mirror is
[`.agents/skills/git-linear-workflow/SKILL.md`](../../.agents/skills/git-linear-workflow/SKILL.md).
That steering file is the single source of truth. If anything here and there ever
disagree, the steering file wins — fix this page to match rather than diverging.

## The rule in one line

**Every feature gets its own Linear task, its own branch, and its own pull request. No
bundling.**

## What that means in practice

- **One feature per task/branch/PR.** Split a multi-feature request into separate Linear
  tasks, branches, and PRs. Note any dependencies between them.
- **Branch naming.** Follow Linear's convention: `jeremyviengarriola/phasm-NN-slug`
  (for example `jeremyviengarriola/phasm-32-workflow-rule`). One branch serves exactly
  one issue.
- **Link the task.** The PR title references the Linear identifier, and the PR
  description links back to the issue.
- **PR target.** Open PRs against `master` unless the requester names another base branch.
- **Never push directly to `master`.** Changes land only through a reviewed PR.
- **Never force-push a shared branch.** Force-pushing is only ever acceptable on your own
  unshared feature branch, and even then prefer new commits.
- **Keep diffs small and focused.** Ship a feature's docs in the same PR as the feature.
- **Agents never merge.** The PR is left open for a human to review and merge.

For the full workflow — ensuring a Linear issue exists first, implementation steps,
reporting back, and the repository's defaults — read the canonical steering file linked
above.
