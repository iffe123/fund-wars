// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuctionModal from '../components/AuctionModal';

vi.mock('../hooks/useHaptic', () => ({
  useHaptic: () => ({
    triggerImpact: vi.fn(),
  }),
}));

interface RenderResult {
  container: HTMLDivElement;
  unmount: () => void;
}

const renderAuction = (onComplete = vi.fn()): RenderResult & { onComplete: ReturnType<typeof vi.fn> } => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <AuctionModal
        companyName="PackFancy Inc."
        initialBid={55_500_000}
        rivalName="Marcus"
        onComplete={onComplete}
        onClose={vi.fn()}
      />
    );
  });

  return {
    container,
    onComplete,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const clickButton = (container: HTMLElement, label: string) => {
  const button = findButton(container, label);

  act(() => {
    button.click();
  });
};

const findButton = (container: HTMLElement, label: string): HTMLButtonElement => {
  const button = Array.from(container.querySelectorAll('button')).find((candidate) =>
    candidate.textContent?.includes(label)
  ) as HTMLButtonElement | undefined;

  if (!button) {
    throw new Error(`Button not found: ${label}`);
  }

  return button;
};

describe('AuctionModal', () => {
  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    document.body.innerHTML = '';
  });

  it('keeps the auction as a forced choice instead of auto-losing on timer expiry', () => {
    const { container, onComplete, unmount } = renderAuction();

    act(() => {
      vi.advanceTimersByTime(2_100);
    });

    expect(container.textContent).toContain('YOUR TURN');
    expect(container.textContent).toContain('Auction reaction. This forced choice does not spend AP.');

    act(() => {
      vi.advanceTimersByTime(35_000);
    });

    expect(onComplete).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Decision paused. Choose Match, Bully, or Fold to continue.');

    clickButton(container, 'MATCH');
    expect(container.textContent).toContain('YOU BID');

    unmount();
  });

  it('completes only once when a loss action is triggered repeatedly', () => {
    const { container, onComplete, unmount } = renderAuction();

    act(() => {
      vi.advanceTimersByTime(2_100);
    });

    const foldButton = findButton(container, 'FOLD');
    act(() => {
      foldButton.click();
      foldButton.click();
    });

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(false, expect.any(Number));

    unmount();
  });
});
