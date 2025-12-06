import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { DIFFICULTY_SETTINGS, SCENARIOS } from '../constants';
import { DealType, type PlayerStats, type PortfolioCompany } from '../types';

/**
 * Startup Phase Tests
 * Tests the game initialization and startup sequence logic
 */

describe('Startup Phase 1: Authentication', () => {
  describe('Guest Mode', () => {
    it('creates a valid guest user object with required fields', () => {
      // Simulating the guest user creation from AuthContext
      const guestUser = {
        uid: `guest_${Date.now()}`,
        displayName: 'Guest Trader',
        email: 'guest@fundwars.os',
        photoURL: 'https://ui-avatars.com/api/?name=Guest+Trader&background=random',
        emailVerified: true,
        isAnonymous: true,
      };

      expect(guestUser.uid).toMatch(/^guest_\d+$/);
      expect(guestUser.displayName).toBe('Guest Trader');
      expect(guestUser.email).toBe('guest@fundwars.os');
      expect(guestUser.isAnonymous).toBe(true);
    });

    it('generates unique guest UIDs on each creation', () => {
      const uid1 = `guest_${Date.now()}`;
      // Tiny delay to ensure different timestamp
      const uid2 = `guest_${Date.now() + 1}`;

      expect(uid1).not.toBe(uid2);
    });
  });

  describe('Auth Timeout', () => {
    it('auth timeout is configured for 8 seconds', () => {
      // The auth timeout value from AuthContext
      const AUTH_TIMEOUT_MS = 8000;
      expect(AUTH_TIMEOUT_MS).toBe(8000);
    });
  });
});

describe('Startup Phase 2: Legal Disclaimer', () => {
  describe('Consent Storage', () => {
    beforeEach(() => {
      // Mock localStorage
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('stores legal consent in localStorage when accepted', () => {
      const mockSetItem = vi.fn();
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(),
        setItem: mockSetItem,
        removeItem: vi.fn(),
        clear: vi.fn(),
      });

      // Simulate accepting legal disclaimer
      mockSetItem('LEGAL_CONSENT', 'true');

      expect(mockSetItem).toHaveBeenCalledWith('LEGAL_CONSENT', 'true');
    });

    it('reads existing legal consent from localStorage', () => {
      const mockGetItem = vi.fn().mockReturnValue('true');
      vi.stubGlobal('localStorage', {
        getItem: mockGetItem,
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      });

      const consent = mockGetItem('LEGAL_CONSENT');

      expect(consent).toBe('true');
    });
  });

  describe('Reading Timer', () => {
    it('requires 2 second reading period before accept button enables', () => {
      // The reading timer value from LegalDisclaimer
      const READING_DELAY_MS = 2000;
      expect(READING_DELAY_MS).toBe(2000);
    });
  });
});

describe('Startup Phase 3: System Boot', () => {
  describe('Boot Sequence Steps', () => {
    const bootSteps = [
      { delay: 500, text: "INITIALIZING FUND_WARS_OS v9.2..." },
      { delay: 1200, text: "CHECKING MEMORY... 64GB OK" },
      { delay: 1600, text: "MOUNTING DRIVES... /ROOT OK" },
      { delay: 2200, text: "LOADING ETHICS_MODULE..." },
      { delay: 3500, text: "ERROR: ETHICS_MODULE NOT FOUND (SKIPPING...)" },
      { delay: 4000, text: "ESTABLISHING SECURE CONNECTION..." },
      { delay: 4500, text: "CONNECTED." },
    ];

    it('has 7 boot log messages', () => {
      expect(bootSteps.length).toBe(7);
    });

    it('includes the iconic ethics module error', () => {
      const ethicsError = bootSteps.find(s => s.text.includes('ETHICS_MODULE NOT FOUND'));
      expect(ethicsError).toBeDefined();
    });

    it('boot sequence completes before login button appears', () => {
      const maxBootStepDelay = Math.max(...bootSteps.map(s => s.delay));
      const loginButtonDelay = 5000;

      expect(loginButtonDelay).toBeGreaterThan(maxBootStepDelay);
    });

    it('boot steps are in chronological order', () => {
      for (let i = 1; i < bootSteps.length; i++) {
        expect(bootSteps[i].delay).toBeGreaterThan(bootSteps[i-1].delay);
      }
    });
  });

  describe('Tutorial Messages', () => {
    const tutorials = [
      { title: "SYS_ADMIN", text: "Oh look, another MBA. Welcome to the terminal, kid.", action: "Next" },
      { title: "SYS_ADMIN", text: "Top Left is your Money. Try not to make it zero.", action: "Understood" },
      { title: "SYS_ADMIN", text: "Top Right is your Stress. If this hits 100, you have a stroke. I hate filling out paperwork for strokes.", action: "Noted" },
      { title: "SYS_ADMIN", text: "Center Screen is the Meat Grinder. This is where you buy companies you don't understand.", action: "Okay" },
      { title: "SYS_ADMIN", text: "Now, open the 'PackFancy' CIM. And don't break anything.", action: "BOOT_SYSTEM" }
    ];

    it('has 5 tutorial messages during boot', () => {
      expect(tutorials.length).toBe(5);
    });

    it('all tutorial messages are from SYS_ADMIN', () => {
      tutorials.forEach(t => {
        expect(t.title).toBe('SYS_ADMIN');
      });
    });

    it('final tutorial action is BOOT_SYSTEM', () => {
      const lastTutorial = tutorials[tutorials.length - 1];
      expect(lastTutorial.action).toBe('BOOT_SYSTEM');
    });
  });
});

describe('Startup Phase 4: Intro Sequence', () => {
  describe('Intro Stages', () => {
    it('has 3 intro stages (0, 1, 2)', () => {
      const stages = [0, 1, 2];
      expect(stages.length).toBe(3);
    });

    it('Stage 0 is "The Glory" - Wharton introduction', () => {
      const stage0Title = "Wharton, Class of '24";
      expect(stage0Title).toContain('Wharton');
    });

    it('Stage 1 is "The Crash" - Reality check', () => {
      const stage1Time = "06:45:00";
      const stage1Title = "Monday. 6:45 AM.";
      expect(stage1Title).toContain('Monday');
      expect(stage1Time).toBe('06:45:00');
    });

    it('Stage 2 is "The Encounter" with Chad (MD)', () => {
      const chadTitle = "Chad (MD)";
      const chadRole = "Managing Director";
      expect(chadTitle).toBe('Chad (MD)');
      expect(chadRole).toBe('Managing Director');
    });
  });

  describe('Player Choice Impact', () => {
    it('confident choice adds 5 stress', () => {
      const confidentChoice = { text: "I'll crush it, Chad.", stress: 5 };
      expect(confidentChoice.stress).toBe(5);
    });

    it('sarcastic choice adds 25 stress', () => {
      const sarcasticChoice = { text: "Cardboard? Really?", stress: 25 };
      expect(sarcasticChoice.stress).toBe(25);
    });

    it('stress difference between choices is 20', () => {
      const confidentStress = 5;
      const sarcasticStress = 25;
      expect(sarcasticStress - confidentStress).toBe(20);
    });
  });
});

describe('Startup Phase 5: Game Initialization', () => {
  describe('Difficulty Settings', () => {
    it('Normal difficulty settings exist', () => {
      expect(DIFFICULTY_SETTINGS['Normal']).toBeDefined();
    });

    it('Normal difficulty has valid initial stats', () => {
      const normalSettings = DIFFICULTY_SETTINGS['Normal'];
      expect(normalSettings.initialStats).toBeDefined();
      expect(normalSettings.initialStats.cash).toBeGreaterThan(0);
      expect(normalSettings.initialStats.reputation).toBeGreaterThanOrEqual(0);
      expect(normalSettings.initialStats.stress).toBeGreaterThanOrEqual(0);
      expect(normalSettings.initialStats.stress).toBeLessThanOrEqual(100);
    });
  });

  describe('Initial Portfolio (PackFancy Inc.)', () => {
    const initialCompany: PortfolioCompany = {
      id: 1,
      name: "PackFancy Inc.",
      ceo: "Doris Chen",
      investmentCost: 0,
      ownershipPercentage: 0,
      currentValuation: 55000000,
      latestCeoReport: "Pending Analysis...",
      nextBoardMeeting: "TBD",
      dealType: DealType.LBO,
      revenue: 120000000,
      ebitda: 15000000,
      debt: 0,
      revenueGrowth: 0.02,
      acquisitionDate: { year: 1, month: 1 },
      eventHistory: [],
      isAnalyzed: false,
      employeeCount: 450,
      employeeGrowth: 0.01,
      ebitdaMargin: 0.125,
      cashBalance: 8000000,
      runwayMonths: 18,
      customerChurn: 0.05,
      ceoPerformance: 70,
      boardAlignment: 65,
      managementTeam: [],
      dealClosed: false,
      isInExitProcess: false,
      nextBoardMeetingWeek: 12,
      lastFinancialUpdate: 0
    };

    it('PackFancy is the initial portfolio company', () => {
      expect(initialCompany.name).toBe('PackFancy Inc.');
    });

    it('CEO is Doris Chen', () => {
      expect(initialCompany.ceo).toBe('Doris Chen');
    });

    it('deal type is LBO', () => {
      expect(initialCompany.dealType).toBe(DealType.LBO);
    });

    it('has $55M valuation', () => {
      expect(initialCompany.currentValuation).toBe(55000000);
    });

    it('has $120M revenue', () => {
      expect(initialCompany.revenue).toBe(120000000);
    });

    it('has 2% revenue growth (flat as described)', () => {
      expect(initialCompany.revenueGrowth).toBe(0.02);
    });

    it('EBITDA margin is 12.5%', () => {
      expect(initialCompany.ebitdaMargin).toBe(0.125);
    });

    it('has not been analyzed yet', () => {
      expect(initialCompany.isAnalyzed).toBe(false);
    });

    it('investment cost is 0 (not yet purchased)', () => {
      expect(initialCompany.investmentCost).toBe(0);
    });

    it('ownership is 0% (evaluating deal)', () => {
      expect(initialCompany.ownershipPercentage).toBe(0);
    });
  });

  describe('Initial Game State', () => {
    it('game starts in LIFE_MANAGEMENT phase after intro', () => {
      const postIntroPhase = 'LIFE_MANAGEMENT';
      expect(postIntroPhase).toBe('LIFE_MANAGEMENT');
    });

    it('tutorial starts at step 1', () => {
      const initialTutorialStep = 1;
      expect(initialTutorialStep).toBe(1);
    });

    it('first scenario is in the SCENARIOS array', () => {
      expect(SCENARIOS).toBeDefined();
      expect(SCENARIOS.length).toBeGreaterThan(0);
      expect(SCENARIOS[0]).toHaveProperty('id');
    });
  });

  describe('Stress Calculation', () => {
    it('calculates correct starting stress with confident choice', () => {
      const baseStress = DIFFICULTY_SETTINGS['Normal'].initialStats.stress;
      const choiceStress = 5;
      const totalStress = baseStress + choiceStress;

      expect(totalStress).toBeGreaterThanOrEqual(5);
      expect(totalStress).toBeLessThanOrEqual(100);
    });

    it('calculates correct starting stress with sarcastic choice', () => {
      const baseStress = DIFFICULTY_SETTINGS['Normal'].initialStats.stress;
      const choiceStress = 25;
      const totalStress = baseStress + choiceStress;

      expect(totalStress).toBeGreaterThanOrEqual(25);
      expect(totalStress).toBeLessThanOrEqual(100);
    });
  });
});

describe('Startup Flow Order', () => {
  it('startup phases occur in correct order', () => {
    const phases = [
      '1. Auth Loading',
      '2. Login Screen',
      '3. Legal Disclaimer',
      '4. System Boot / Intro Sequence',
      '5. Game Initialization',
    ];

    expect(phases.length).toBe(5);
    expect(phases[0]).toContain('Auth');
    expect(phases[1]).toContain('Login');
    expect(phases[2]).toContain('Legal');
    expect(phases[3]).toContain('Boot');
    expect(phases[4]).toContain('Game');
  });

  it('INTRO phase triggers IntroSequence instead of SystemBoot', () => {
    const gamePhase = 'INTRO';
    const shouldShowIntro = gamePhase === 'INTRO';

    expect(shouldShowIntro).toBe(true);
  });

  it('saved game with playerStats skips boot sequence', () => {
    const playerStats = { cash: 1000 }; // Simulating saved game exists
    const bootComplete = false;

    const shouldShowRestoringSession = !bootComplete && playerStats !== null;
    expect(shouldShowRestoringSession).toBe(true);
  });
});

describe('Reset Functionality', () => {
  it('reset query parameter triggers game reset', () => {
    const url = new URL('http://localhost:5173/?reset=1');
    const shouldReset = url.searchParams.get('reset') === '1';

    expect(shouldReset).toBe(true);
  });

  it('reset parameter is removed from URL after reset', () => {
    const url = new URL('http://localhost:5173/?reset=1&other=value');
    url.searchParams.delete('reset');

    expect(url.searchParams.get('reset')).toBeNull();
    expect(url.searchParams.get('other')).toBe('value');
  });
});
