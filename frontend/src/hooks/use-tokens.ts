import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Token {
  id: number;
  token: string;
  role: 'parent' | 'teacher';
  studentId: number | null;
  teacherUserId: number | null;
  createdBy: number;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  usedBy: number | null;
  isUsed: boolean;
  isExpired: boolean;
}

export interface TokenListResponse {
  data: Token[];
  pagination: {
    page: number;
    limit: number;
  };
}

interface TokensParams {
  page?: number;
  role?: 'parent' | 'teacher';
  studentId?: number;
  teacherUserId?: number;
  unusedOnly?: boolean;
}

interface GenerateTokenInput {
  role: 'parent' | 'teacher';
  studentId?: number;
  teacherUserId?: number;
  expiresInHours?: number;
}

interface GenerateTokenResult {
  token: string;
  deepLink: string;
  role: 'parent' | 'teacher';
  studentId: number | null;
  teacherUserId: number | null;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useTokens(params?: TokensParams) {
  return useQuery({
    queryKey: ['tokens', params],
    queryFn: () =>
      get<TokenListResponse>('/tokens', {
        page: params?.page ?? 1,
        role: params?.role,
        studentId: params?.studentId,
        teacherUserId: params?.teacherUserId,
        unusedOnly: params?.unusedOnly,
      }),
  });
}

export function useGenerateToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateTokenInput) =>
      post<GenerateTokenResult>('/tokens', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
}
