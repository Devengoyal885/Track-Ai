/**
 * TrackAI — Mission Control Top Bar
 */

import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  AlertTriangle,
  Radio,
  PlusCircle,
} from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useSimulationStore } from '../../stores/simulationStore';

export default function TopBar() {
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const {
    isRunning,
    speedMultiplier,
    startSimulation,
    pauseSimulation,
    setSpeedMultiplier,
    triggerEmergencyAlert,
    spawnSuspectVehicle,
    audioAlertsEnabled,
    toggleAudioAlerts,
  } = useSimulationStore();

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        background: 'rgba(11, 17, 32, 0.85)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 150,
      }}
    >
      {/* Left: System Live Telemetry Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: isRunning ? 'var(--color-success)' : 'var(--color-warning)',
              boxShadow: isRunning ? '0 0 8px var(--color-success-glow)' : 'none',
              display: 'inline-block',
            }}
            className={isRunning ? 'status-online' : ''}
          />
          <span
            style={{
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: isRunning ? 'var(--color-success)' : 'var(--color-warning)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isRunning ? 'SURVEILLANCE ENGINE LIVE' : 'ENGINE PAUSED'}
          </span>
        </div>

        <div style={{ width: 1, height: 18, background: 'rgba(148, 163, 184, 0.15)' }} />

        {/* Real-time Clock */}
        <div
          style={{
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Radio size={13} style={{ color: 'var(--color-primary)' }} />
          <LiveClock />
        </div>
      </div>

      {/* Center: Live Simulation Control Dock */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
        }}
      >
        <button
          onClick={() => (isRunning ? pauseSimulation() : startSimulation())}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: isRunning ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: isRunning ? 'var(--color-warning)' : 'var(--color-success)',
            cursor: 'pointer',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            transition: 'all var(--transition-fast)',
          }}
          title={isRunning ? 'Pause Simulation' : 'Start Simulation'}
        >
          {isRunning ? <Pause size={12} /> : <Play size={12} />}
          {isRunning ? 'PAUSE' : 'RESUME'}
        </button>

        {/* Speed selectors */}
        <div style={{ display: 'flex', gap: 2 }}>
          {[1.0, 2.0, 5.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeedMultiplier(spd)}
              style={{
                padding: '3px 7px',
                borderRadius: 4,
                border: 'none',
                background: speedMultiplier === spd ? 'var(--color-primary)' : 'transparent',
                color: speedMultiplier === spd ? '#0F172A' : 'var(--color-text-muted)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {spd}x
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 14, background: 'rgba(148, 163, 184, 0.2)' }} />

        {/* Quick Actions */}
        <button
          onClick={() => spawnSuspectVehicle()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 9px',
            borderRadius: 6,
            border: '1px solid rgba(56, 189, 248, 0.3)',
            background: 'rgba(56, 189, 248, 0.1)',
            color: 'var(--color-primary)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
          }}
          title="Spawn Blacklisted Suspect Vehicle"
        >
          <PlusCircle size={12} />
          + Suspect
        </button>

        <button
          onClick={() => triggerEmergencyAlert('High-Priority Police Alert: Red Light Grid Breach')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 9px',
            borderRadius: 6,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--color-danger)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
          }}
          title="Trigger Emergency Broadcast"
        >
          <AlertTriangle size={12} />
          Alert
        </button>
      </div>

      {/* Right: Controls & Operator Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Sound Toggle */}
        <button
          onClick={toggleAudioAlerts}
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            background: 'transparent',
            color: audioAlertsEnabled ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
          }}
          title={audioAlertsEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
        >
          {audioAlertsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
          }}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Operator Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            OP
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
              Control Room
            </div>
            <div style={{ fontSize: 9, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              LEVEL 4 SECURE
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span>
      {time.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })}
      {' IST · '}
      {time.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}
    </span>
  );
}
