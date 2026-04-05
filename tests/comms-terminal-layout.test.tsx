// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CommsTerminal from '../components/CommsTerminal';
import type { ChatMessage, NPC } from '../types';

const mockGameState = {
  tutorialStep: 0,
  setTutorialStep: vi.fn(),
  playerStats: {
    portfolio: [],
    currentDayType: 'WEEKDAY',
    currentTimeSlot: 'MORNING',
    loanBalance: 0,
  },
  activeScenario: null,
};

vi.mock('../contexts/GameContext', () => ({
  useGame: () => mockGameState,
}));

vi.mock('../services/geminiService', () => ({
  isGeminiApiConfigured: () => false,
}));

const npcList: NPC[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'Senior Analyst',
    avatar: 'fa-user',
    relationship: 60,
    mood: 65,
    trust: 62,
    traits: [],
    memories: [],
    isRival: false,
    dialogueHistory: [],
    schedule: {
      weekday: ['MORNING', 'AFTERNOON'],
      weekend: ['MORNING'],
    },
  },
  {
    id: 'chad',
    name: 'Chad (MD)',
    role: 'Managing Director',
    avatar: 'fa-user-tie',
    relationship: 45,
    mood: 55,
    trust: 48,
    traits: [],
    memories: [],
    isRival: false,
    dialogueHistory: [],
    schedule: {
      weekday: ['MORNING'],
      weekend: [],
    },
  },
];

const buildMessages = (count: number): ChatMessage[] =>
  Array.from({ length: count }, (_, index) => ({
    sender: index % 2 === 0 ? 'advisor' : 'player',
    text: `Message ${index + 1}: ${'Pressure test the thesis. '.repeat(8)}`,
    timestamp: Date.now() + index,
  }));

interface RenderResult {
  container: HTMLDivElement;
  rerender: (messages: ChatMessage[]) => void;
  unmount: () => void;
}

const renderTerminal = (advisorMessages: ChatMessage[]): RenderResult => {
  const container = document.createElement('div');
  container.style.height = '900px';
  document.body.appendChild(container);
  const root = createRoot(container);

  const render = (messages: ChatMessage[]) => {
    act(() => {
      root.render(
        <CommsTerminal
          npcList={npcList}
          advisorMessages={messages}
          onSendMessageToAdvisor={vi.fn()}
          onSendMessageToNPC={vi.fn(async () => {})}
          isLoadingAdvisor={false}
          predefinedQuestions={[
            'Should I take this deal?',
            'Roast my strategy and fix it',
            'Ask me one investment-committee trap question',
          ]}
          isOpen={true}
          mode="MOBILE_EMBED"
        />
      );
    });
  };

  render(advisorMessages);

  return {
    container,
    rerender: render,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

describe('CommsTerminal layout regression', () => {
  const scrollToMock = vi.fn();

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    scrollToMock.mockReset();
    mockGameState.setTutorialStep.mockReset();
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollToMock,
    });
  });

  afterEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    document.body.innerHTML = '';
  });

  it('keeps the chat viewport as the scrollable flex region in mobile embed mode', () => {
    const { container, unmount } = renderTerminal(buildMessages(20));

    const root = container.querySelector('[data-testid="comms-root"]') as HTMLElement;
    const layout = container.querySelector('[data-testid="comms-layout"]') as HTMLElement;
    const sidebar = container.querySelector('[data-testid="comms-sidebar"]') as HTMLElement;
    const chatArea = container.querySelector('[data-testid="comms-chat-area"]') as HTMLElement;
    const header = container.querySelector('[data-testid="comms-header"]') as HTMLElement;
    const messages = container.querySelector('[data-testid="comms-messages"]') as HTMLElement;
    const composer = container.querySelector('[data-testid="comms-composer"]') as HTMLElement;

    expect(root.className).toContain('min-h-0');
    expect(layout.className).toContain('min-h-0');
    expect(sidebar.className).toContain('min-h-0');
    expect(chatArea.className).toContain('min-h-0');
    expect(messages.className).toContain('min-h-0');
    expect(messages.className).toContain('overflow-y-auto');
    expect(header.className).not.toContain('absolute');
    expect(composer.className).not.toContain('absolute');
    expect(container.querySelector('input[placeholder="Type message..."]')).not.toBeNull();

    unmount();
  });

  it('scrolls the message viewport when the conversation grows', () => {
    const { rerender, unmount } = renderTerminal(buildMessages(2));

    scrollToMock.mockClear();
    rerender(buildMessages(8));

    expect(scrollToMock).toHaveBeenCalled();
    expect(scrollToMock).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' })
    );

    unmount();
  });
});
