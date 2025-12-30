/**
 * Z-Index System - Centralized layer management
 *
 * All z-index values in the app should use these constants.
 * Import with: import { Z_INDEX } from '../constants/zIndex';
 *
 * Layer Groups (from lowest to highest):
 * - Base (0-99): Background, content, dropdowns
 * - Overlays (100-499): Sticky elements, sidebars, floating buttons
 * - Modals (500-599): Modal backdrops and content
 * - Feedback (600-699): Toasts, tooltips, notifications
 * - Tutorial (700-899): Onboarding overlays and highlights
 * - Critical (1000+): System alerts, errors
 */
export const Z_INDEX = {
  // Base layers (0-99)
  background: 0,
  content: 10,
  dropdown: 100,

  // Interactive elements (100-299)
  navbar: 200,
  stickyHeader: 200,
  sidebar: 250,
  floatingButton: 300,

  // Overlays - escalating (500-599)
  modalBackdrop: 500,
  modalOverlay: 500,  // Alias for backward compatibility
  modal: 510,
  modalNested: 520,
  modalActions: 530,

  // Feedback (600-699)
  toast: 600,
  tooltip: 650,
  notification: 650,

  // Tutorial - highest non-critical (700-899)
  tutorialBackdrop: 800,
  tutorialOverlay: 800,  // Alias for backward compatibility
  tutorialHighlight: 850,
  tutorial: 900,
  tutorialTooltip: 900,

  // Critical system alerts (1000+)
  criticalAlert: 1000,
  systemError: 1100,
  max: 9999,

  // Legacy aliases (for backward compatibility)
  base: 0,
  sticky: 200,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;
