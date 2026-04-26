/**
 * Run a list of side-effect callbacks in sequence with a small gap between
 * each, so user-visible toasts/chat lines feel like the terminal chattering
 * out a result rather than blasting it all in one frame. Respects the user's
 * prefers-reduced-motion preference by collapsing the gap to zero.
 */
export const paceBeats = (
  beats: Array<() => void>,
  options: { gapMs?: number } = {},
): void => {
  if (beats.length === 0) return;

  const gapMs = options.gapMs ?? 220;
  const reducedMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || gapMs <= 0) {
    beats.forEach(beat => beat());
    return;
  }

  beats.forEach((beat, i) => {
    setTimeout(beat, i * gapMs);
  });
};
