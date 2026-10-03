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

## Stack merge guide (dependent PRs)

Some features ship as a **stack**: a chain of PRs where each PR's base branch is the PR
below it instead of `master` (for example the Android app work, GitHub #18–#25). Merge a
stack carefully so you don't create conflicts or orphan a branch.

- **Merge bottom-up.** Merge the lowest PR (the one whose base is `master`) first, then
  the next one up, and so on. Never merge a higher PR before the one it depends on.
- **After a squash-merge, retarget + rebase the next PR.** If the team squash-merges, the
  merged commit on `master` has a different hash than the branch history, so the next PR
  up will show conflicts against its now-merged base. Fix it by retargeting that PR to
  `master` and rebasing it onto `master`, dropping the already-merged commits:

  ```bash
  # <old-base> = the branch that was just squash-merged
  # <branch>   = the next PR up in the stack
  git rebase --onto master <old-base> <branch>
  git push --force-with-lease origin <branch>
  ```

  Then change that PR's base to `master` in the GitHub UI (or it may update
  automatically once its base branch is deleted). Repeat for each PR as you climb the
  stack. A plain `git merge` is **not** the fix here — it reintroduces the already-merged
  changes.
- **Don't delete a base branch while a PR above still uses it.** Deleting a branch that is
  another open PR's base will auto-close or re-target that PR unexpectedly. Only delete a
  branch after everything stacked on top of it has been retargeted or merged.

With GitHub's native stacked PRs (`gh stack`), merging the bottom PR and running
`gh stack submit` again can re-sync the remaining bases for you, but the rules above still
hold — review the retargeted PRs before merging the next one.
