import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { GameState, GameAction } from '../reducers/types';
import { gameReducer, initialState } from '../reducers/gameReducer';

const GameStateContext = createContext<GameState>(initialState);
const GameDispatchContext = createContext<Dispatch<GameAction>>(() => null);

export const GameStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

export const useGameDispatch = () => {
  const context = useContext(GameDispatchContext);
  if (context === undefined) {
    throw new Error('useGameDispatch must be used within a GameStateProvider');
  }
  return context;
};
