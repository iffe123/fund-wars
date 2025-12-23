import { useState, useCallback } from 'react';

export type ActiveTab = 'WORKSPACE' | 'ASSETS' | 'FOUNDER' | 'DEALS';
export type MobileTab = 'COMMS' | 'DESK' | 'NEWS' | 'MENU';

interface AppUIState {
  // Tab State
  activeTab: ActiveTab;
  activeMobileTab: MobileTab;

  // Panel State
  showActivityFeed: boolean;
  showPortfolioDashboard: boolean;

  // Modal State
  showStatsModal: boolean;
  showPostTutorialGuide: boolean;
  showTransparencyModal: boolean;

  // Tutorial State
  hasSeenStatsTutorial: boolean;
}

interface AppUIActions {
  setActiveTab: (tab: ActiveTab) => void;
  setActiveMobileTab: (tab: MobileTab) => void;
  setShowActivityFeed: (show: boolean) => void;
  setShowPortfolioDashboard: (show: boolean) => void;
  setShowStatsModal: (show: boolean) => void;
  setShowPostTutorialGuide: (show: boolean) => void;
  setShowTransparencyModal: (show: boolean) => void;

  // Compound actions
  handleStatsClick: () => void;
  handleStatsModalClose: () => void;
  navigateToAssets: () => void;
  navigateToDesk: () => void;
}

export interface UseAppUIStateReturn extends AppUIState, AppUIActions {}

export const useAppUIState = (): UseAppUIStateReturn => {
  // Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('WORKSPACE');
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('DESK');

  // Panel State
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [showPortfolioDashboard, setShowPortfolioDashboard] = useState(false);

  // Modal State
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPostTutorialGuide, setShowPostTutorialGuide] = useState(false);
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);

  // Tutorial State (persisted)
  const [hasSeenStatsTutorial, setHasSeenStatsTutorial] = useState(() => {
    return localStorage.getItem('HAS_SEEN_STATS_TUTORIAL') === 'true';
  });

  // Compound Actions
  const handleStatsClick = useCallback(() => {
    setShowStatsModal(true);
  }, []);

  const handleStatsModalClose = useCallback(() => {
    setShowStatsModal(false);
    if (!hasSeenStatsTutorial) {
      setHasSeenStatsTutorial(true);
      localStorage.setItem('HAS_SEEN_STATS_TUTORIAL', 'true');
    }
  }, [hasSeenStatsTutorial]);

  const navigateToAssets = useCallback(() => {
    setActiveTab('ASSETS');
    if (window.innerWidth < 768) {
      setActiveMobileTab('DESK');
    }
  }, []);

  const navigateToDesk = useCallback(() => {
    setActiveTab('WORKSPACE');
    if (window.innerWidth < 768) {
      setActiveMobileTab('DESK');
    }
  }, []);

  return {
    // State
    activeTab,
    activeMobileTab,
    showActivityFeed,
    showPortfolioDashboard,
    showStatsModal,
    showPostTutorialGuide,
    showTransparencyModal,
    hasSeenStatsTutorial,

    // Actions
    setActiveTab,
    setActiveMobileTab,
    setShowActivityFeed,
    setShowPortfolioDashboard,
    setShowStatsModal,
    setShowPostTutorialGuide,
    setShowTransparencyModal,
    handleStatsClick,
    handleStatsModalClose,
    navigateToAssets,
    navigateToDesk,
  };
};

export default useAppUIState;
