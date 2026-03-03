import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SystemStatus {
  status: 'ok' | 'degraded' | 'down';
  database: { connected: boolean; latencyMs: number };
  redis: { connected: boolean; latencyMs: number };
  bot: { running: boolean; webhookSet: boolean };
  uptime: number;
  version: string;
}

export interface SystemStats {
  users: {
    total: number;
    parents: number;
    teachers: number;
    active: number;
  };
  students: {
    total: number;
    active: number;
  };
  messages: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  broadcasts: {
    total: number;
    thisMonth: number;
  };
  tokens: {
    pending: number;
    usedToday: number;
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSystemStatus() {
  return useQuery({
    queryKey: ['system', 'status'],
    queryFn: () => get<SystemStatus>('/system/status'),
    refetchInterval: 30_000,
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: ['system', 'stats'],
    queryFn: () => get<SystemStats>('/system/stats'),
    staleTime: 60_000,
  });
}
