import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: number;
  actorId: number | null;
  actorType: string | null;
  action: string;
  targetType: string | null;
  targetId: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditListResponse {
  data: AuditEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AuditParams {
  page?: number;
  limit?: number;
  action?: string;
  actorId?: number;
  after?: string;
  before?: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuditLog(params?: AuditParams) {
  return useQuery({
    queryKey: ['audit', params],
    queryFn: () =>
      get<AuditListResponse>('/audit', {
        page: params?.page ?? 1,
        limit: params?.limit ?? 25,
        action: params?.action,
        actorId: params?.actorId,
        after: params?.after,
        before: params?.before,
      }),
  });
}
