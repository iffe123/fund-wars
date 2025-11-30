# Codex-Only Workflow

These steps keep development fully inside Codex and avoid the "cannot update PR" banner that appears when a PR is edited directly in GitHub.

## 1) Sync the local branch with GitHub
1. Add the remote for your repo:
   ```bash
   git remote add origin <your-repo-url>
   ```
2. Fetch the latest branches:
   ```bash
   git fetch origin
   ```
3. Update the `work` branch so it matches GitHub:
   ```bash
   git checkout work
   git pull --rebase origin work
   ```

## 2) Make all edits in Codex
1. Do all file changes locally in Codex.
2. Stage and commit them:
   ```bash
   git add <files>
   git commit -m "<summary>"
   ```

## 3) Push and open a fresh PR from Codex
1. Push the branch (reusing `work` or a new branch name):
   ```bash
   git push origin work
   ```
2. Use Codex to generate the PR title/body instead of editing GitHub’s UI. If an older PR exists, close it or let the new PR supersede it.

## 4) Verify deployment
After pushing, check the latest Vercel deployment logs for the pushed commit. If a build fails, copy the error back into Codex for debugging.

## 5) Re-check the agreed feature list (Items 1–7)
Use this table as a quick regression pass after each push. Replace the placeholders with your Item names/owners.

| Item | What to verify | Status | Notes |
| --- | --- | --- | --- |
| 1 | <feature or fix> | ☐/☑ | |
| 2 | <feature or fix> | ☐/☑ | |
| 3 | <feature or fix> | ☐/☑ | |
| 4 | <feature or fix> | ☐/☑ | |
| 5 | <feature or fix> | ☐/☑ | |
| 6 | <feature or fix> | ☐/☑ | |
| 7 | <feature or fix> | ☐/☑ | |

Filling this after each commit keeps the “Item 1–7” scope explicit and makes it easy to confirm nothing was dropped between PRs.
