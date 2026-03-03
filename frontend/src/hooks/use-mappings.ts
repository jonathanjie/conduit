import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Mapping {
  id: number;
  studentId: number;
  studentName: string;
  teacherUserId: number;
  teacherName: string;
  parentUserId: number | null;
  parentName: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface MappingListResponse {
  data: Mapping[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateMappingInput {
  studentId: number;
  teacherUserId: number;
  parentUserId?: number;
}

interface UpdateMappingInput {
  teacherUserId?: number;
  parentUserId?: number | null;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useMappings(params?: { page?: number; studentId?: number; teacherId?: number }) {
  return useQuery({
    queryKey: ['mappings', params],
    queryFn: () =>
      get<MappingListResponse>('/mappings', {
        page: params?.page ?? 1,
        studentId: params?.studentId,
        teacherId: params?.teacherId,
      }),
  });
}

export function useCreateMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMappingInput) => post<Mapping>('/mappings', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mappings'] });
    },
  });
}

export function useUpdateMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateMappingInput & { id: number }) =>
      patch<Mapping>(`/mappings/${id}`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mappings'] });
    },
  });
}

export function useDeleteMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del<{ message: string }>(`/mappings/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mappings'] });
    },
  });
}
