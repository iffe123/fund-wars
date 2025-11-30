# Contributing and resolving conflicts via Codex

Follow this checklist whenever GitHub shows merge conflicts or the merge button is disabled. These steps avoid editing in GitHub directly and keep Codex in control of the branch and PR.

1. **Sync the branch locally**
   - `git fetch origin`
   - `git checkout work` (or the feature branch you are merging)
   - `git pull --rebase origin work`

2. **Identify conflicts**
   - Run `npm run check-conflicts` to list files with `<<<<<<<` markers.
   - Open each file locally and choose the correct code (pick one side or blend them). Delete the `<<<<<<<`, `=======`, and `>>>>>>>` lines.

3. **Rebuild to validate**
   - `npm run build` to ensure the project still compiles.

4. **Continue the rebase**
   - `git add <fixed files>`
   - `git rebase --continue` (repeat edits if Git reports more conflicts).

5. **Push from Codex (triggers Vercel)**
   - `git push origin work` (or your feature branch). This updates the PR and starts a Vercel deployment.

6. **Retry the merge**
   - Once CI is green and the branch is up to date, the merge button should re-enable. Keep using Codex for any follow-up edits; avoid editing the PR in GitHub’s UI.

If you ever need to abandon remote edits made in GitHub, run `git fetch origin` followed by `git reset --hard origin/work` to realign your local branch before continuing (warning: this discards local changes).
