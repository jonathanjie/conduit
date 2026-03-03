import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Broadcast {
  id: number;
  adminUserId: number;
  scope: string;
  messagePreview: string | null;
  targetCount: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: string;
  completedAt: string | null;
}

export interface BroadcastListResponse {
  data: Broadcast[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateBroadcastInput {
  scope: string;
  messageText: string;
  adminTelegramUserId?: number;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useBroadcasts(params?: { page?: number }) {
  return useQuery({
    queryKey: ['broadcasts', params],
    queryFn: () =>
      get<BroadcastListResponse>('/broadcasts', {
        page: params?.page ?? 1,
      }),
  });
}

export function useBroadcast(id: number) {
  return useQuery({
    queryKey: ['broadcasts', id],
    queryFn: () => get<Broadcast>(`/broadcasts/${id}`),
    enabled: id > 0,
  });
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBroadcastInput) =>
      post<{ broadcastId: number; queued: number; message: string }>('/broadcasts', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    },
  });
}
