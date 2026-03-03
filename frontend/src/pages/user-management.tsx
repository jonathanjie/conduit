import React, { useState } from 'react';
import { Plus, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';
import {
  useDashboardUsers,
  useCreateDashboardUser,
  useUpdateDashboardUser,
  useDeleteDashboardUser,
  type DashboardUser,
} from '../hooks/use-dashboard-users';
import { useAuth } from '../lib/auth';
import { DataTable, type Column } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Input, Select } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, ConfirmDialog } from '../components/ui/dialog';
import { useToast } from '../components/ui/toast';
import { getErrorMessage, formatDateTime } from '../lib/utils';

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const { success, error: showError } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<DashboardUser | null>(null);
  const [promoteUser, setPromoteUser] = useState<DashboardUser | null>(null);

  const { data: users, isLoading } = useDashboardUsers();
  const createMut = useCreateDashboardUser();
  const updateMut = useUpdateDashboardUser();
  const deleteMut = useDeleteDashboardUser();

  const columns: Column<DashboardUser>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (u) => (
        <div>
          <p className="font-medium text-gray-900">{u.displayName}</p>
          <p className="text-xs text-gray-500">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (u) => (
        <Badge variant={u.role === 'superadmin' ? 'superadmin' : 'admin'}>
          {u.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (u) =>
        u.isActive ? (
          <Badge variant="active" dot>Active</Badge>
        ) : (
          <Badge variant="inactive" dot>Inactive</Badge>
        ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      accessor: (u) =>
        u.lastLoginAt ? formatDateTime(u.lastLoginAt) : <span className="text-gray-400">Never</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      align: 'right',
      accessor: (u) => {
        // Don't allow self-action
        if (u.id === currentUser?.userId) return null;

        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setPromoteUser(u)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-conduit-700 hover:bg-conduit-50 transition-colors"
              title={u.role === 'admin' ? 'Promote to Superadmin' : 'Demote to Admin'}
            >
              {u.role === 'admin' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
            </button>
            <button
              onClick={() => setDeleteUser(u)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove user"
            >
              <UserX size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">User Management</h2>
          <p className="text-sm text-gray-500">Dashboard admin accounts</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          Add Admin
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users ?? []}
        keyExtractor={(u) => u.id}
        loading={isLoading}
        emptyMessage="No dashboard users found."
      />

      {/* Add Admin Dialog */}
      <AddAdminDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (data) => {
          await createMut.mutateAsync(data);
          success(`${data.displayName} created as ${data.role}`);
          setAddOpen(false);
        }}
        loading={createMut.isPending}
        error={createMut.error ? getErrorMessage(createMut.error) : undefined}
      />

      {/* Promote / Demote Confirm */}
      <ConfirmDialog
        open={promoteUser !== null}
        onClose={() => setPromoteUser(null)}
        onConfirm={async () => {
          if (!promoteUser) return;
          const newRole = promoteUser.role === 'admin' ? 'superadmin' : 'admin';
          try {
            await updateMut.mutateAsync({ id: promoteUser.id, role: newRole });
            success(`${promoteUser.displayName} is now ${newRole}`);
            setPromoteUser(null);
          } catch (err) {
            showError(getErrorMessage(err));
          }
        }}
        title={promoteUser?.role === 'admin' ? 'Promote to Superadmin' : 'Demote to Admin'}
        description={
          promoteUser?.role === 'admin'
            ? `Give ${promoteUser?.displayName} full superadmin access? This grants access to audit logs, system status, and user management.`
            : `Demote ${promoteUser?.displayName} to admin? They will lose access to superadmin features.`
        }
        confirmLabel={promoteUser?.role === 'admin' ? 'Promote' : 'Demote'}
        destructive={promoteUser?.role === 'superadmin'}
        loading={updateMut.isPending}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteUser !== null}
        onClose={() => setDeleteUser(null)}
        onConfirm={async () => {
          if (!deleteUser) return;
          try {
            await deleteMut.mutateAsync(deleteUser.id);
            success(`${deleteUser.displayName} removed`);
            setDeleteUser(null);
          } catch (err) {
            showError(getErrorMessage(err));
          }
        }}
        title="Remove Admin"
        description={`Remove ${deleteUser?.displayName} from the dashboard? This cannot be undone.`}
        confirmLabel="Remove"
        destructive
        loading={deleteMut.isPending}
      />
    </div>
  );
}

// ─── Add Admin Dialog ─────────────────────────────────────────────────────────

function AddAdminDialog({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    email: string;
    password: string;
    role: 'admin' | 'superadmin';
    displayName: string;
  }) => Promise<void>;
  loading: boolean;
  error?: string;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'admin' | 'superadmin'>('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) return;
    await onSubmit({ email, password, role, displayName });
    setEmail('');
    setPassword('');
    setDisplayName('');
    setRole('admin');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add Admin User"
      description="Create a new dashboard administrator account."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button form="add-admin-form" type="submit" loading={loading}>Create Admin</Button>
        </>
      }
    >
      <form id="add-admin-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Jane Smith"
          required
          autoFocus
        />
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 characters"
          hint="Must be at least 8 characters"
          required
          minLength={8}
        />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'superadmin')}
          options={[
            { value: 'admin', label: 'Admin — standard access' },
            { value: 'superadmin', label: 'Superadmin — full access' },
          ]}
        />
      </form>
    </Dialog>
  );
}
