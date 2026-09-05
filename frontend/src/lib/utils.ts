/**
 * TrackAI — Utility functions
 */

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPlate(plate: string): string {
  return plate.toUpperCase().trim();
}

export function formatTimestamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTimestamp(date)}`;
}

export function formatSpeed(speed: number | null): string {
  if (speed === null || speed === undefined) return '—';
  return `${Math.round(speed)} km/h`;
}

export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'var(--color-danger)';
    case 'medium':
      return 'var(--color-warning)';
    case 'low':
      return 'var(--color-secondary)';
    default:
      return 'var(--color-text-muted)';
  }
}

export function getAlertTypeIcon(type: string): string {
  switch (type) {
    case 'blacklist_hit':
      return '🚨';
    case 'congestion':
      return '🚗';
    case 'anomaly':
      return '⚠️';
    case 'speeding':
      return '💨';
    default:
      return '📋';
  }
}
