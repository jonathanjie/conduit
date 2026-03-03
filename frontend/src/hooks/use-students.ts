import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Student {
  id: number;
  name: string;
  grade: string | null;
  enrolledAt: string;
  isActive: boolean;
}

export interface StudentListResponse {
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface StudentsParams {
  page?: number;
  search?: string;
  grade?: string;
  teacherId?: number;
  limit?: number;
}

interface CreateStudentInput {
  name: string;
  grade?: string;
}

interface UpdateStudentInput {
  name?: string;
  grade?: string | null;
}

interface ImportStudentsInput {
  csv: string;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useStudents(params?: StudentsParams) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () =>
      get<StudentListResponse>('/students', {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        search: params?.search,
        grade: params?.grade,
        teacherId: params?.teacherId,
      }),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentInput) => post<Student>('/students', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateStudentInput & { id: number }) =>
      patch<Student>(`/students/${id}`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del<{ message: string }>(`/students/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useImportStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImportStudentsInput) =>
      post<{ imported: number; failed: number; students: Student[]; errors: { line: number; error: string }[] }>(
        '/students/import',
        data,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
