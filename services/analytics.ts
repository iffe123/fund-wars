import { logEvent as firebaseLogEvent } from "firebase/analytics";
import { analytics } from "./firebase";

type AnalyticsEvent =
  | 'tutorial_start'
  | 'tutorial_complete'
  | 'deal_signed'
  | 'game_over'
  | 'game_reset'
  | 'user_stuck'
  | 'login_success'
  | 'app_init'
  | 'scenario_triggered';

interface EventParams {
  [key: string]: string | number | boolean;
}

export const logEvent = (eventName: AnalyticsEvent, params?: EventParams) => {
  // 1. Log to Console (for debugging)
  const isDev = (import.meta as any).env?.DEV;
  if (isDev) {
      console.log(`[ANALYTICS] ${eventName}`, params || {});
  }

  // 2. Log to Firebase (Production)
  if (analytics) {
      try {
        firebaseLogEvent(analytics, eventName, params);
      } catch (e) {
          if (isDev) console.warn("Analytics logging failed", e);
      }
  }
};