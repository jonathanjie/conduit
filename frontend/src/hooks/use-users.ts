import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TelegramUserRole = 'parent' | 'teacher' | 'admin' | 'superadmin';

export interface TelegramUser {
  id: number;
  displayName: string;
  role: TelegramUserRole;
  isActive: boolean;
  registeredAt: string;
  deactivatedAt: string | null;
}

export interface UserListResponse {
  data: TelegramUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UsersParams {
  page?: number;
  role?: TelegramUserRole;
  active?: boolean;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useUsers(params?: UsersParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () =>
      get<UserListResponse>('/users', {
        page: params?.page ?? 1,
        role: params?.role,
        active: params?.active !== undefined ? String(params.active) : undefined,
      }),
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      patch<{ message: string; userId: number }>(`/users/${id}/activate`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      patch<{ message: string; userId: number }>(`/users/${id}/deactivate`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
