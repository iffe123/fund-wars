// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import IntroSequence from '../components/intro/IntroSequence';

interface RenderResult {
  container: HTMLDivElement;
  unmount: () => void;
}

const renderIntro = (onComplete: ReturnType<typeof vi.fn>, quickStart = false): RenderResult => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<IntroSequence onComplete={onComplete} quickStart={quickStart} />);
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const clickButton = (container: HTMLElement, label: string) => {
  const button = Array.from(container.querySelectorAll('button')).find((candidate) =>
    candidate.textContent?.includes(label)
  ) as HTMLButtonElement | undefined;

  if (!button) {
    throw new Error(`Button not found: ${label}`);
  }

  act(() => {
    button.click();
  });
};

const setInputValue = (input: HTMLInputElement, value: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  descriptor?.set?.call(input, value);

  act(() => {
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

describe('IntroSequence difficulty flow', () => {
  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('passes player name into game start with Normal difficulty', () => {
    const onComplete = vi.fn();
    const { container, unmount } = renderIntro(onComplete);

    // Walk through the streamlined 3-slide intro: Step Inside → Get Started →
    // Enter Sterling Partners (which opens the name-entry overlay).
    for (const label of ['Step Inside', 'Get Started', 'Enter Sterling Partners']) {
      clickButton(container, label);
      act(() => {
        vi.advanceTimersByTime(450);
      });
    }

    const input = container.querySelector('input[placeholder="Enter your name..."]') as HTMLInputElement;
    setInputValue(input, 'Alex');

    const startButton = container.querySelector('[data-testid="intro-start"]') as HTMLButtonElement;
    act(() => {
      startButton.click();
    });

    expect(onComplete).toHaveBeenCalledWith(5, 'Alex', 'Normal');

    unmount();
  });

  it('uses Normal difficulty when quick start is enabled', () => {
    const onComplete = vi.fn();
    const { unmount } = renderIntro(onComplete, true);

    expect(onComplete).toHaveBeenCalledWith(5, undefined, 'Normal');

    unmount();
  });

  it('shows Chad Worthington III consistently in the assignment slide', () => {
    const onComplete = vi.fn();
    const { container, unmount } = renderIntro(onComplete);

    // Slide 1 → slide 2 (the Assignment slide where Chad appears).
    clickButton(container, 'Step Inside');
    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(container.textContent).toContain('Chad Worthington III');

    unmount();
  });
});
