declare const google: {
  accounts?: unknown;
} | undefined;

const GOOGLE_GSI_URL = 'https://accounts.google.com/gsi/client';

let loadPromise: Promise<void> | null = null;

/**
 * Dynamically loads the Google Sign-In SDK.
 * Returns a Promise that resolves when the SDK is ready, or rejects on error.
 * Caches the promise so multiple calls won't reload the script.
 */
export function loadGoogleSignIn(): Promise<void> {
  // Return existing promise if already loading/loaded
  if (loadPromise) {
    return loadPromise;
  }

  // Check if already loaded
  if (typeof google !== 'undefined' && google.accounts) {
    return Promise.resolve();
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GOOGLE_GSI_URL;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Verify the SDK loaded correctly
      if (typeof google !== 'undefined' && google.accounts) {
        resolve();
      } else {
        reject(new Error('Google Sign-In SDK loaded but google.accounts is not available'));
      }
    };

    script.onerror = () => {
      loadPromise = null; // Reset so it can be retried
      reject(new Error('Failed to load Google Sign-In SDK'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Checks if the Google Sign-In SDK is currently loaded.
 */
export function isGoogleSignInLoaded(): boolean {
  return typeof google !== 'undefined' && !!google.accounts;
}
