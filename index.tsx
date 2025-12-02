
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Speed Insights
injectSpeedInsights();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AudioProvider>
          <GameProvider>
            <App />
          </GameProvider>
      </AudioProvider>
    </AuthProvider>
  </React.StrictMode>
);
