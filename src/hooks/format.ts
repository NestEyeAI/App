/**
 * Small presentation helpers shared across screens.
 */
import { AlertType, BarnStatus } from '@/types';

export function gramsToKg(g: number): string {
  return (g / 1000).toFixed(2);
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.round(hr / 24);
  return `${days}d ago`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const ALERT_LABELS: Record<AlertType, string> = {
  piling: 'Piling Detected',
  mortality: 'Possible Mortality',
  high_temperature: 'High Temperature',
  low_activity: 'Low Activity',
  weight_anomaly: 'Weight Anomaly',
  camera_offline: 'Camera Offline',
  system_health: 'System Health',
};

export const ALERT_ICONS: Record<AlertType, string> = {
  piling: 'layers',
  mortality: 'alert-octagon',
  high_temperature: 'thermometer',
  low_activity: 'trending-down',
  weight_anomaly: 'bar-chart-2',
  camera_offline: 'video-off',
  system_health: 'check-circle',
};

export const STATUS_LABELS: Record<BarnStatus, string> = {
  healthy: 'Healthy',
  watch: 'Watch',
  alert: 'Alert',
};
