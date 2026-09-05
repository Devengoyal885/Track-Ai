/**
 * TrackAI — Mission Control Sidebar Navigation
 */

import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crosshair,
  Search,
  Cctv,
  BarChart3,
  BellRing,
  FlaskConical,
  Info,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useAlertStore } from '../../stores/alertStore';
import { useSimulationStore } from '../../stores/simulationStore';

const navItems = [
  { path: '/command-center', label: 'Command Center', icon: Crosshair, badge: 'LIVE' },
  { path: '/investigation', label: 'Investigation', icon: Search },
  { path: '/cameras', label: 'Camera Network', icon: Cctv },
  { path: '/analytics', label: 'Traffic Analytics', icon: BarChart3 },
  { path: '/alerts', label: 'Alerts & Incidents', icon: BellRing, showCount: true },
  { path: '/try-it', label: 'ANPR Playground', icon: FlaskConical, badge: 'AI' },
  { path: '/about', label: 'Architecture & SIH', icon: Info },
];

export default function Sidebar() {
  const location = useLocation();
  const alerts = useAlertStore((s) => s.alerts);
  const unreadAlerts = alerts.filter((a) => a.status === 'new').length;
  const isRunning = useSimulationStore((s) => s.isRunning);
  const activeVehicleCount = useSimulationStore((s) => s.activeVehicles.length);

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'rgba(11, 17, 32, 0.92)',
        borderRight: '1px solid rgba(148, 163, 184, 0.1)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 200,
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Brand Header */}
      <NavLink
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '22px 24px',
          textDecoration: 'none',
          borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
          background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.04) 0%, transparent 100%)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
            flexShrink: 0,
          }}
        >
          <Radio size={22} className="animate-pulse" />
        </div>
        <div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Track<span style={{ color: 'var(--color-primary)' }}>AI</span>
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isRunning ? 'var(--color-success)' : 'var(--color-warning)',
                boxShadow: isRunning ? '0 0 6px var(--color-success-glow)' : 'none',
              }}
            />
            {isRunning ? 'SURVEILLANCE LIVE' : 'STANDBY'}
          </div>
        </div>
      </NavLink>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.1em',
            padding: '4px 12px 8px',
            fontWeight: 600,
          }}
        >
          Mission Navigation
        </div>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'var(--color-text-secondary)',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0.04) 100%)'
                  : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.06)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon
                  size={18}
                  style={{
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    transition: 'color var(--transition-fast)',
                  }}
                />
                <span>{item.label}</span>
              </div>

              {/* Badges */}
              {item.badge && (
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    background: item.badge === 'LIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    color: item.badge === 'LIVE' ? 'var(--color-success)' : 'var(--color-primary)',
                    border: `1px solid ${item.badge === 'LIVE' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
                  }}
                >
                  {item.badge}
                </span>
              )}

              {item.showCount && unreadAlerts > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(239, 68, 68, 0.25)',
                    color: 'var(--color-danger)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                  }}
                >
                  {unreadAlerts}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    bottom: '20%',
                    width: 3,
                    borderRadius: '0 4px 4px 0',
                    background: 'var(--color-primary)',
                    boxShadow: '0 0 10px var(--color-primary-glow)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Fleet Live Status Mini Widget */}
      <div
        style={{
          margin: '0 14px 16px',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            ACTIVE FLEET
          </span>
          <span
            style={{
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--color-primary)',
            }}
          >
            {activeVehicleCount || 18} tracked
          </span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: 'rgba(148, 163, 184, 0.15)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '85%',
              borderRadius: 2,
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(148, 163, 184, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'rgba(7, 13, 26, 0.5)',
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Sparkles size={12} style={{ color: 'var(--color-primary)' }} />
          Smart India Hackathon 2024
        </div>
        <div
          style={{
            fontSize: 9,
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Problem Statement: SIH26127
        </div>
      </div>
    </aside>
  );
}
