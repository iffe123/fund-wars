
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import ErrorBoundary from './components/ErrorBoundary';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from '@vercel/analytics';

// Initialize Vercel Speed Insights
injectSpeedInsights();

// Initialize Vercel Web Analytics
inject();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AudioProvider>
            <GameProvider>
              <App />
            </GameProvider>
        </AudioProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
