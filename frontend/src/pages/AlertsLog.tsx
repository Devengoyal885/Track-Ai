/**
 * TrackAI — Law Enforcement Alerts & Real-Time Incident Triage
 */

import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Eye,
  PlusCircle,
  X,
  Radio,
  Send,
  Check,
} from 'lucide-react';
import { useAlertStore, type AlertItem } from '../stores/alertStore';
import { useSimulationStore } from '../stores/simulationStore';
import { apiFetch } from '../lib/api';

export default function AlertsLog() {
  const { alerts, setAlerts } = useAlertStore();
  const { triggerEmergencyAlert } = useSimulationStore();
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<AlertItem[]>('/alerts?limit=50')
      .then((data) => {
        if (data && data.length > 0) setAlerts(data);
      })
      .catch((e) => console.warn(e));
  }, [setAlerts]);

  const updateStatus = async (alertId: number, newStatus: string) => {
    try {
      await apiFetch(`/alerts/${alertId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      // Update local store
      setAlerts(
        alerts.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
      );
      if (selectedAlert?.id === alertId) {
        setSelectedAlert({ ...selectedAlert, status: newStatus });
      }
    } catch (e) {
      console.warn('Status update error:', e);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSev = severityFilter === 'ALL' || a.severity.toUpperCase() === severityFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.plate_number && a.plate_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.camera_name && a.camera_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSev && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner & Trigger Controls */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-danger)', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            <Radio size={14} className="animate-pulse" />
            INCIDENT RESPONSE & VIOLATIONS DISPATCH
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: 2 }}>
            Real-Time Law Enforcement Alerts Console
          </h2>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => triggerEmergencyAlert('Blacklisted Plate Detected: DL 04 EF 9876')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)',
            }}
          >
            <PlusCircle size={15} />
            Simulate Wanted Hit
          </button>

          <button
            onClick={() => triggerEmergencyAlert('High-Speed Corridor Breach Clocked: 94 km/h')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--color-warning)',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={15} />
            Simulate Speed Violation
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 24px',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border:
                  severityFilter === s
                    ? s === 'CRITICAL'
                      ? '1px solid var(--color-danger)'
                      : '1px solid var(--color-primary)'
                    : '1px solid rgba(148, 163, 184, 0.15)',
                background:
                  severityFilter === s
                    ? s === 'CRITICAL'
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(56, 189, 248, 0.2)'
                    : 'transparent',
                color:
                  severityFilter === s
                    ? s === 'CRITICAL'
                      ? 'var(--color-danger)'
                      : 'var(--color-primary)'
                    : 'var(--color-text-secondary)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(11, 17, 32, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            width: 280,
          }}
        >
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search alerts or plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Main Alerts Table */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr
              style={{
                borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                textAlign: 'left',
                color: 'var(--color-text-muted)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                background: 'rgba(11, 17, 32, 0.6)',
              }}
            >
              <th style={{ padding: '14px 20px' }}>SEVERITY</th>
              <th style={{ padding: '14px 20px' }}>INCIDENT DETAILS</th>
              <th style={{ padding: '14px 20px' }}>TARGET PLATE</th>
              <th style={{ padding: '14px 20px' }}>CAMERA NODE</th>
              <th style={{ padding: '14px 20px' }}>TIMESTAMP</th>
              <th style={{ padding: '14px 20px' }}>STATUS</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No incident alerts matching selected criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr
                  key={alert.id || Math.random()}
                  style={{
                    borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                    background: alert.status === 'new' ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background:
                          alert.severity === 'critical'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : alert.severity === 'high'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(56, 189, 248, 0.2)',
                        color:
                          alert.severity === 'critical'
                            ? 'var(--color-danger)'
                            : alert.severity === 'high'
                            ? 'var(--color-warning)'
                            : 'var(--color-primary)',
                        border:
                          alert.severity === 'critical'
                            ? '1px solid rgba(239, 68, 68, 0.4)'
                            : alert.severity === 'high'
                            ? '1px solid rgba(245, 158, 11, 0.4)'
                            : '1px solid rgba(56, 189, 248, 0.4)',
                      }}
                    >
                      {alert.status === 'new' && <span className="status-online" style={{ background: 'var(--color-danger)' }} />}
                      {alert.severity}
                    </span>
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{alert.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{alert.description}</div>
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    {alert.plate_number ? (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: 12,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {alert.plate_number}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>N/A</span>
                    )}
                  </td>

                  <td style={{ padding: '14px 20px', color: 'var(--color-text-secondary)', fontSize: 12 }}>
                    {alert.camera_name || 'CAM-HQ-01'}
                  </td>

                  <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: 12 }}>
                    {new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour12: false })} · {new Date(alert.timestamp).toLocaleDateString('en-IN')}
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background:
                          alert.status === 'resolved'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : alert.status === 'reviewed'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        color:
                          alert.status === 'resolved'
                            ? 'var(--color-success)'
                            : alert.status === 'reviewed'
                            ? 'var(--color-warning)'
                            : 'var(--color-danger)',
                      }}
                    >
                      {alert.status}
                    </span>
                  </td>

                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setDispatchStatus(null);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        background: 'rgba(56, 189, 248, 0.1)',
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={12} />
                      Triage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Incident Triage Action Drawer Modal */}
      {selectedAlert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(16px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 640,
              background: 'rgba(15, 23, 42, 0.96)',
              border: selectedAlert.severity === 'critical' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={20} style={{ color: selectedAlert.severity === 'critical' ? 'var(--color-danger)' : 'var(--color-warning)' }} />
                <div style={{ fontSize: 18, fontWeight: 700 }}>Incident Triage Briefing #{selectedAlert.id}</div>
              </div>

              <button
                onClick={() => setSelectedAlert(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>VIOLATION TITLE</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
                  {selectedAlert.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                  {selectedAlert.description}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                  background: 'rgba(11, 17, 32, 0.7)',
                  padding: 16,
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>TARGET PLATE: </span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{selectedAlert.plate_number || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>CAMERA: </span>
                  <span>{selectedAlert.camera_name || 'CAM-CP-01'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>TIMESTAMP: </span>
                  <span>{new Date(selectedAlert.timestamp).toLocaleTimeString()}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>CURRENT STATUS: </span>
                  <span style={{ fontWeight: 700, textTransform: 'uppercase', color: selectedAlert.status === 'resolved' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {selectedAlert.status}
                  </span>
                </div>
              </div>

              {/* Interceptor Dispatch Alert Confirmation */}
              {dispatchStatus && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '12px 16px',
                    borderRadius: 8,
                    color: 'var(--color-success)',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={16} />
                  {dispatchStatus}
                </div>
              )}

              {/* Triage Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => {
                    setDispatchStatus(`Police Patrol Interceptor Unit dispatched to ${selectedAlert.camera_name || 'target location'}.`);
                    updateStatus(selectedAlert.id, 'reviewed');
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: '#fff',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Send size={15} />
                  Dispatch Police Patrol
                </button>

                <button
                  onClick={() => {
                    updateStatus(selectedAlert.id, 'resolved');
                    setDispatchStatus('Alert marked as resolved and logged in police forensics registry.');
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px',
                    borderRadius: 8,
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--color-success)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Check size={15} />
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
