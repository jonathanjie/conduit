import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useMappings, useCreateMapping, useDeleteMapping, type Mapping } from '../hooks/use-mappings';
import { useStudents } from '../hooks/use-students';
import { useUsers } from '../hooks/use-users';
import { DataTable, type Column } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, ConfirmDialog } from '../components/ui/dialog';
import { useToast } from '../components/ui/toast';
import { getErrorMessage, formatDate } from '../lib/utils';

export default function MappingsPage() {
  const { success, error: showError } = useToast();
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteMapping, setDeleteMapping] = useState<Mapping | null>(null);

  const { data, isLoading } = useMappings({ page });
  const createMut = useCreateMapping();
  const deleteMut = useDeleteMapping();

  const columns: Column<Mapping>[] = [
    {
      key: 'student',
      header: 'Student',
      accessor: (m) => (
        <span className="font-medium text-gray-900">{m.studentName}</span>
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      accessor: (m) => m.teacherName ?? <span className="text-gray-400">—</span>,
    },
    {
      key: 'parent',
      header: 'Parent',
      accessor: (m) => m.parentName ?? <span className="text-gray-400">Unassigned</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (m) =>
        m.isActive ? (
          <Badge variant="active" dot>Active</Badge>
        ) : (
          <Badge variant="inactive" dot>Inactive</Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      accessor: (m) => formatDate(m.createdAt),
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      align: 'right',
      accessor: (m) => (
        <button
          onClick={() => setDeleteMapping(m)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Remove mapping"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Mappings</h2>
          <p className="text-sm text-gray-500">Teacher-student-parent relationships</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          Create Mapping
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(m) => m.id}
        loading={isLoading}
        pagination={
          data?.pagination
            ? {
                page: data.pagination.page,
                limit: data.pagination.limit,
                total: data.pagination.total,
                totalPages: data.pagination.totalPages,
              }
            : undefined
        }
        onPageChange={setPage}
        emptyMessage="No mappings configured yet."
      />

      {/* Create Mapping Dialog */}
      <CreateMappingDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (studentId, teacherUserId) => {
          await createMut.mutateAsync({ studentId, teacherUserId });
          success('Mapping created');
          setAddOpen(false);
        }}
        loading={createMut.isPending}
        error={createMut.error ? getErrorMessage(createMut.error) : undefined}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteMapping !== null}
        onClose={() => setDeleteMapping(null)}
        onConfirm={async () => {
          if (!deleteMapping) return;
          try {
            await deleteMut.mutateAsync(deleteMapping.id);
            success('Mapping removed');
            setDeleteMapping(null);
          } catch (err) {
            showError(getErrorMessage(err));
          }
        }}
        title="Remove Mapping"
        description={`Remove the mapping for ${deleteMapping?.studentName}? Messages between the linked teacher and parent will stop routing.`}
        confirmLabel="Remove"
        destructive
        loading={deleteMut.isPending}
      />
    </div>
  );
}

function CreateMappingDialog({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (studentId: number, teacherUserId: number) => Promise<void>;
  loading: boolean;
  error?: string;
}) {
  const [studentId, setStudentId] = useState('');
  const [teacherUserId, setTeacherUserId] = useState('');

  const { data: studentsData } = useStudents({ limit: 100 });
  const { data: usersData } = useUsers({ role: 'teacher', active: true });

  const studentOptions = (studentsData?.data ?? []).map((s) => ({
    value: String(s.id),
    label: s.grade ? `${s.name} (${s.grade})` : s.name,
  }));

  const teacherOptions = (usersData?.data ?? []).map((u) => ({
    value: String(u.id),
    label: u.displayName,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !teacherUserId) return;
    await onSubmit(Number(studentId), Number(teacherUserId));
    setStudentId('');
    setTeacherUserId('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create Mapping"
      description="Link a student to a teacher."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button form="create-mapping-form" type="submit" loading={loading}>Create</Button>
        </>
      }
    >
      <form id="create-mapping-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        <Select
          label="Student"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          options={studentOptions}
          placeholder="Select a student"
          required
        />
        <Select
          label="Teacher"
          value={teacherUserId}
          onChange={(e) => setTeacherUserId(e.target.value)}
          options={teacherOptions}
          placeholder="Select a teacher"
          required
        />
      </form>
    </Dialog>
  );
}
