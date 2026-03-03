import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DashboardRole = 'admin' | 'superadmin';

export interface DashboardUser {
  id: number;
  email: string;
  role: DashboardRole;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface CreateDashboardUserInput {
  email: string;
  password: string;
  role: DashboardRole;
  displayName: string;
}

interface UpdateDashboardUserInput {
  role: DashboardRole;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useDashboardUsers() {
  return useQuery({
    queryKey: ['dashboard-users'],
    queryFn: () => get<DashboardUser[]>('/dashboard-users'),
  });
}

export function useCreateDashboardUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDashboardUserInput) =>
      post<DashboardUser>('/dashboard-users', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard-users'] });
    },
  });
}

export function useUpdateDashboardUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateDashboardUserInput & { id: number }) =>
      patch<DashboardUser>(`/dashboard-users/${id}`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard-users'] });
    },
  });
}

export function useDeleteDashboardUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del<{ message: string }>(`/dashboard-users/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard-users'] });
    },
  });
}
