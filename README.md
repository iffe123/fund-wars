
# Fund Wars OS v9.2

A satirical Private Equity career simulator.

## Product & Development Guide

- [`docs/FUND_WARS_DEVELOPMENT_GUIDE.md`](./docs/FUND_WARS_DEVELOPMENT_GUIDE.md)
- [`docs/README.md`](./docs/README.md) (documentation index)

## 🚀 Quick Start (Guest Mode)

You can run the app immediately in "Guest Mode" without any API keys.

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the App:**
   ```bash
   npm run dev
   ```
   *Note: In Guest Mode, Cloud Saves and AI Chat features will be simulated or disabled.*

---

## 🛠️ Full Configuration (Production)

To enable Cloud Saves (Firebase) and AI Chat (Gemini), you need to configure environment variables.

1. **Create a `.env` file** in the root directory. **DO NOT COMMIT THIS FILE.**
   
   ```env
   # Gemini AI (Required for Chat/NPCs)
   VITE_API_KEY=your_gemini_api_key_here

   # Firebase Configuration (Required for Cloud Saves/Auth)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

---

## ☁️ Vercel Deployment Guide

To deploy this securely without exposing keys in the repo:

1. **Push to GitHub**: Ensure `.gitignore` includes `.env`.
2. **Import to Vercel**: Connect your GitHub repo.
3. **Environment Variables**: In the Vercel Dashboard (Settings > Environment Variables), add the keys above.
   
   ⚠️ **CRITICAL:** You MUST prefix variables with `VITE_` for them to be visible to the browser application.

---

## 🔥 Firebase Setup & Security

1. **Authorized Domains**:
   If you see `auth/unauthorized-domain` errors in production:
   - Go to **Firebase Console** > **Authentication** > **Settings**.
   - Click **Authorized Domains**.
   - Add your Vercel domain (e.g., `fund-wars.vercel.app`).

2. **Database Rules (Security)**:
   To ensure users can only access their own save files, go to **Firestore Database** > **Rules** and paste the following:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

## 🛡️ Legal & Compliance

*   **Simulation Only:** This is a work of fiction.
*   **Data:** Telemetry is anonymous.
*   **Disclaimer:** No financial advice is given.

## 🔀 Resolving GitHub merge conflicts with Codex

If GitHub shows a greyed out **Merge pull request** button and lists files with conflicts, reconcile your branch locally in Codex and push a clean history back to GitHub:

1. **Add and sync the remote** (only needed once):
   ```bash
   git remote add origin <your-repo-url>
   git fetch origin
   git checkout work
   git pull --rebase origin work
   ```
   Replace `<your-repo-url>` with the HTTPS URL of this repository.

2. **Bring in the latest base branch** (often `main` or `master`) so you can resolve conflicts locally:
   ```bash
   git fetch origin
   git merge origin/main   # or: git rebase origin/main
   ```

3. **Resolve conflicts in the listed files** (for example, `components/CommsTerminal.tsx`, `context/GameContext.tsx`, `services/geminiService.ts`, `types.ts`):
   - Open each file and decide whether to keep your changes, the base changes, or a blend.
   - Remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
   - Use the existing `npm run check-conflicts` script to verify no markers remain.

4. **Verify the app builds** before pushing:
   ```bash
   npm run build
   ```

5. **Commit and push from Codex** to trigger Vercel and update the PR:
   ```bash
   git add .
   git commit -m "Resolve merge conflicts"
   git push origin work
   ```

For a concise conflict checklist that you can run through every time the merge button is greyed out, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Once the push completes and Vercel reports a successful deployment, GitHub should allow the PR to be merged.

### 🧠 Why the **Merge pull request** button is grey (and how to fix it)

If GitHub shows the button disabled even after Vercel deploys your branch, it almost always means the PR has merge
conflicts with the base branch:

1. **Confirm you have the base branch locally** (e.g., `main`). If you cannot fetch because of network restrictions,
   paste the exact error into Codex so we can troubleshoot; otherwise run `git fetch origin` followed by
   `git checkout main` and `git pull` to ensure it is current.
2. **Rebase or merge the base branch into your work branch** to surface conflicts locally:
   ```bash
   git checkout work
   git fetch origin
   git rebase origin/main   # or: git merge origin/main
   ```
3. **Resolve conflicts in the files GitHub lists** (e.g., `components/CommsTerminal.tsx`, `constants.ts`,
   `context/GameContext.tsx`, `types.ts`). Remove all `<<<<<<<`, `=======`, `>>>>>>>` markers, then run
   `npm run check-conflicts` to verify none remain.
4. **Build and push from Codex** so GitHub/Vercel see a clean branch with conflicts resolved:
   ```bash
   npm run build
   git add .
   git commit -m "Resolve merge conflicts"
   git push origin work
   ```
5. **Retry the merge button.** If it’s still grey, ensure the PR targets the correct base branch and that all required
   checks are green. Share any GitHub/Vercel error snippets in Codex so we can address them.

### 🤔 Which merge option should you pick?
GitHub will only let you choose a merge strategy *after* conflicts are resolved and checks are green. The three buttons
do the following:

- **Create a merge commit**: Keeps the entire branch history and adds a single merge commit on the base branch. Use this
  if you want a visible integration point or if the branch has multiple meaningful commits.
- **Squash and merge**: Combines all commits from the branch into one commit on the base branch. Use this when the branch
  is a focused change and you want a clean history.
- **Rebase and merge**: Replays your branch commits onto the tip of the base branch. Use this only if the branch is
  already conflict-free and you prefer linear history.

If the merge button is still disabled, it means conflicts remain unresolved; choose a strategy only after you’ve rebased
or merged the latest base branch locally, cleared all conflict markers, and pushed the updated branch from Codex.
