/**
 * TrackAI — Application Router
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppShell from './components/layout/AppShell';

// Lazy-loaded pages
const Landing = lazy(() => import('./pages/Landing'));
const CommandCenter = lazy(() => import('./pages/CommandCenter'));
const Investigation = lazy(() => import('./pages/Investigation'));
const CameraNetwork = lazy(() => import('./pages/CameraNetwork'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AlertsLog = lazy(() => import('./pages/AlertsLog'));
const TryItYourself = lazy(() => import('./pages/TryItYourself'));
const About = lazy(() => import('./pages/About'));

function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        gap: '12px',
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          border: '2px solid var(--color-primary-subtle)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      Loading module...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Landing page — full screen, no shell */}
          <Route path="/" element={<Landing />} />

          {/* App pages — within the shell */}
          <Route element={<AppShell />}>
            <Route path="/command-center" element={<CommandCenter />} />
            <Route path="/investigation" element={<Investigation />} />
            <Route path="/cameras" element={<CameraNetwork />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<AlertsLog />} />
            <Route path="/try-it" element={<TryItYourself />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
