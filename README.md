
# Fund Wars OS v9.2

A satirical Private Equity career simulator.

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
