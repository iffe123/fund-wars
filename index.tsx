// MIGRATION IN PROGRESS: Switching default from StoryApp to App.tsx (sandbox PE-simulator)
// See docs/MIGRATION_PLAN.md for details

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import HybridApp from './HybridApp';
import ErrorBoundary from './components/ErrorBoundary';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from '@vercel/analytics';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
const shouldLoadVercelTelemetry =
  typeof window !== 'undefined' &&
  !LOCAL_HOSTNAMES.has(window.location.hostname);

if (shouldLoadVercelTelemetry) {
  injectSpeedInsights();
  inject();
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// HybridApp: defaults to SIMULATION mode, with STORY_CLASSIC as optional
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HybridApp />
    </ErrorBoundary>
  </React.StrictMode>
);
