import React, { useState } from 'react';
import { Plus, Upload, Search, Pencil, UserX } from 'lucide-react';
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useImportStudents,
  type Student,
} from '../hooks/use-students';
import { DataTable, type Column } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Input, Textarea } from '../components/ui/input';
import { Card, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, ConfirmDialog } from '../components/ui/dialog';
import { useToast } from '../components/ui/toast';
import { getErrorMessage, formatDate } from '../lib/utils';

export default function StudentsPage() {
  const { success, error: showError } = useToast();

  // Filters
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

  const { data, isLoading } = useStudents({ page, search, limit: 20 });
  const createMut = useCreateStudent();
  const updateMut = useUpdateStudent();
  const deleteMut = useDeleteStudent();
  const importMut = useImportStudents();

  // ─── Table columns ────────────────────────────────────────────────────────

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (s) => <span className="font-medium text-gray-900">{s.name}</span>,
    },
    {
      key: 'grade',
      header: 'Grade',
      accessor: (s) => s.grade ?? <span className="text-gray-400">—</span>,
    },
    {
      key: 'enrolledAt',
      header: 'Enrolled',
      accessor: (s) => formatDate(s.enrolledAt),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (s) =>
        s.isActive ? (
          <Badge variant="active" dot>Active</Badge>
        ) : (
          <Badge variant="inactive" dot>Inactive</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      align: 'right',
      accessor: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setEditStudent(s)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-conduit-700 hover:bg-conduit-50 transition-colors"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteStudent(s)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Deactivate"
          >
            <UserX size={14} />
          </button>
        </div>
      ),
    },
  ];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Students</h2>
          <p className="text-sm text-gray-500">Manage enrolled students</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={<Upload size={16} />}
            onClick={() => setImportOpen(true)}
          >
            Import CSV
          </Button>
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => setAddOpen(true)}
          >
            Add Student
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card padding="sm">
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name..."
            className="flex-1"
          />
          <Button type="submit" leftIcon={<Search size={16} />}>
            Search
          </Button>
          {search && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(s) => s.id}
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
        emptyMessage={search ? `No students match "${search}"` : 'No students enrolled yet.'}
      />

      {/* Add Student Dialog */}
      <AddStudentDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (name, grade) => {
          await createMut.mutateAsync({ name, grade });
          success('Student added successfully');
          setAddOpen(false);
        }}
        loading={createMut.isPending}
        error={createMut.error ? getErrorMessage(createMut.error) : undefined}
      />

      {/* Edit Student Dialog */}
      {editStudent && (
        <EditStudentDialog
          student={editStudent}
          open={editStudent !== null}
          onClose={() => setEditStudent(null)}
          onSubmit={async (name, grade) => {
            await updateMut.mutateAsync({ id: editStudent.id, name, grade });
            success('Student updated successfully');
            setEditStudent(null);
          }}
          loading={updateMut.isPending}
          error={updateMut.error ? getErrorMessage(updateMut.error) : undefined}
        />
      )}

      {/* Deactivate Confirm */}
      <ConfirmDialog
        open={deleteStudent !== null}
        onClose={() => setDeleteStudent(null)}
        onConfirm={async () => {
          if (!deleteStudent) return;
          try {
            await deleteMut.mutateAsync(deleteStudent.id);
            success('Student deactivated');
            setDeleteStudent(null);
          } catch (err) {
            showError(getErrorMessage(err));
          }
        }}
        title="Deactivate Student"
        description={`Are you sure you want to deactivate ${deleteStudent?.name}? This will remove them from all active mappings.`}
        confirmLabel="Deactivate"
        destructive
        loading={deleteMut.isPending}
      />

      {/* Import Dialog */}
      <ImportStudentsDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSubmit={async (csv) => {
          const result = await importMut.mutateAsync({ csv });
          success(`Imported ${result.imported} students${result.failed > 0 ? `, ${result.failed} failed` : ''}`);
          setImportOpen(false);
        }}
        loading={importMut.isPending}
        error={importMut.error ? getErrorMessage(importMut.error) : undefined}
      />
    </div>
  );
}

// ─── Sub-dialogs ──────────────────────────────────────────────────────────────

function AddStudentDialog({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, grade: string | undefined) => Promise<void>;
  loading: boolean;
  error?: string;
}) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name.trim(), grade.trim() || undefined);
    setName('');
    setGrade('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add Student"
      description="Enrol a new student in the system."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button form="add-student-form" type="submit" loading={loading}>Add Student</Button>
        </>
      }
    >
      <form id="add-student-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alice Tan"
          required
          autoFocus
        />
        <Input
          label="Grade / Class"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="e.g. P5, S3, K2"
          hint="Optional"
        />
      </form>
    </Dialog>
  );
}

function EditStudentDialog({
  student,
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  student: Student;
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, grade: string | undefined) => Promise<void>;
  loading: boolean;
  error?: string;
}) {
  const [name, setName] = useState(student.name);
  const [grade, setGrade] = useState(student.grade ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name.trim(), grade.trim() || undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit Student"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button form="edit-student-form" type="submit" loading={loading}>Save Changes</Button>
        </>
      }
    >
      <form id="edit-student-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <Input
          label="Grade / Class"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          hint="Leave blank to clear"
        />
      </form>
    </Dialog>
  );
}

function ImportStudentsDialog({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (csv: string) => Promise<void>;
  loading: boolean;
  error?: string;
}) {
  const [csv, setCsv] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csv.trim()) return;
    await onSubmit(csv.trim());
    setCsv('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Bulk Import Students"
      description="Paste CSV data below. Format: name,grade (one per line)."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button form="import-form" type="submit" loading={loading} leftIcon={<Upload size={16} />}>
            Import
          </Button>
        </>
      }
    >
      <form id="import-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500 font-mono">
          <p className="font-semibold text-gray-600 mb-1">Example format:</p>
          <p>name,grade</p>
          <p>Alice Tan,P5</p>
          <p>Bob Lim,S2</p>
          <p>Charlie Wong</p>
        </div>
        <Textarea
          label="CSV Data"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={10}
          placeholder="Alice Tan,P5&#10;Bob Lim,S2&#10;Charlie Wong,K2"
          required
          autoFocus
        />
      </form>
    </Dialog>
  );
}
