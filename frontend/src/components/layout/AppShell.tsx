/**
 * TrackAI — App Shell (Layout wrapper & Real-Time Socket Connection)
 */

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { getSocket } from '../../lib/socket';
import { useSimulationStore, type TelemetryDetection } from '../../stores/simulationStore';
import { useAlertStore, type AlertItem } from '../../stores/alertStore';
import { apiFetch } from '../../lib/api';
import { ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppShell() {
  const { setSimulationTick, addTelemetryDetection, setStats } = useSimulationStore();
  const { addAlert, setAlerts } = useAlertStore();
  const [activeToast, setActiveToast] = useState<AlertItem | null>(null);

  useEffect(() => {
    // Initial fetch of alerts & stats
    apiFetch<AlertItem[]>('/alerts?limit=30')
      .then((data) => setAlerts(data))
      .catch((err) => console.warn('Initial alerts fetch error:', err));

    apiFetch<any>('/analytics/stats')
      .then((data) => setStats(data))
      .catch((err) => console.warn('Initial stats fetch error:', err));

    // Connect Socket.IO
    const socket = getSocket();

    socket.on('simulation_tick', (data: any) => {
      setSimulationTick(data);
    });

    socket.on('telemetry', (det: TelemetryDetection) => {
      addTelemetryDetection(det);
    });

    socket.on('detection_new', (det: TelemetryDetection) => {
      addTelemetryDetection(det);
    });

    socket.on('alert_new', (alert: AlertItem) => {
      addAlert(alert);
      setActiveToast(alert);
      setTimeout(() => {
        setActiveToast((current) => (current?.id === alert.id ? null : current));
      }, 6000);
    });

    return () => {
      socket.off('simulation_tick');
      socket.off('telemetry');
      socket.off('detection_new');
      socket.off('alert_new');
    };
  }, [setSimulationTick, addTelemetryDetection, addAlert, setAlerts, setStats]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-deep)' }}>
      {/* Ambient background grid */}
      <div className="animated-grid-bg" />

      {/* Cyberpunk ambient glow spots */}
      <div
        style={{
          position: 'fixed',
          top: '-10%',
          right: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-10%',
          left: '20%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <TopBar />
        <main
          style={{
            flex: 1,
            padding: '24px 32px',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Real-time Alert Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 9999,
              maxWidth: 420,
              background: 'rgba(15, 23, 42, 0.95)',
              border: activeToast.severity === 'critical' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              backdropFilter: 'blur(20px)',
              boxShadow: activeToast.severity === 'critical' ? '0 12px 36px rgba(239, 68, 68, 0.25)' : '0 12px 36px rgba(245, 158, 11, 0.25)',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: activeToast.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeToast.severity === 'critical' ? 'var(--color-danger)' : 'var(--color-warning)',
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={20} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: activeToast.severity === 'critical' ? 'var(--color-danger)' : 'var(--color-warning)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {activeToast.severity} ALERT · {activeToast.type}
                </span>
                <button
                  onClick={() => setActiveToast(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                {activeToast.title}
              </div>

              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                {activeToast.description}
              </div>

              {activeToast.plate_number && (
                <div
                  style={{
                    marginTop: 8,
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {activeToast.plate_number}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
