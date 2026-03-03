import React, { useState } from 'react';
import { UserX, UserCheck } from 'lucide-react';
import { useUsers, useDeactivateUser, useActivateUser, type TelegramUser } from '../hooks/use-users';
import { DataTable, type Column } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Input, Select } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ConfirmDialog } from '../components/ui/dialog';
import { useToast } from '../components/ui/toast';
import { getErrorMessage, formatDate } from '../lib/utils';

export default function TeachersPage() {
  const { success, error: showError } = useToast();
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | ''>('true');
  const [actionUser, setActionUser] = useState<{ user: TelegramUser; action: 'activate' | 'deactivate' } | null>(null);

  const { data, isLoading } = useUsers({
    page,
    role: 'teacher',
    active: activeFilter === '' ? undefined : activeFilter === 'true',
  });

  const activateMut = useActivateUser();
  const deactivateMut = useDeactivateUser();

  const columns: Column<TelegramUser>[] = [
    {
      key: 'name',
      header: 'Display Name',
      accessor: (u) => (
        <span className="font-medium text-gray-900">{u.displayName}</span>
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
      key: 'registeredAt',
      header: 'Registered',
      accessor: (u) => formatDate(u.registeredAt),
    },
    {
      key: 'deactivatedAt',
      header: 'Deactivated',
      accessor: (u) => u.deactivatedAt ? formatDate(u.deactivatedAt) : <span className="text-gray-400">—</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      align: 'right',
      accessor: (u) => (
        <button
          onClick={() => setActionUser({ user: u, action: u.isActive ? 'deactivate' : 'activate' })}
          className={`p-1.5 rounded-lg transition-colors ${
            u.isActive
              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
          }`}
          title={u.isActive ? 'Deactivate' : 'Reactivate'}
        >
          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Teachers</h2>
        <p className="text-sm text-gray-500">Telegram-registered teachers</p>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex items-center gap-4">
          <Select
            label=""
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as 'true' | 'false' | '');
              setPage(1);
            }}
            options={[
              { value: '', label: 'All statuses' },
              { value: 'true', label: 'Active only' },
              { value: 'false', label: 'Inactive only' },
            ]}
            className="w-48"
          />
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(u) => u.id}
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
        emptyMessage="No teachers found."
      />

      {/* Confirm action */}
      <ConfirmDialog
        open={actionUser !== null}
        onClose={() => setActionUser(null)}
        onConfirm={async () => {
          if (!actionUser) return;
          try {
            if (actionUser.action === 'deactivate') {
              await deactivateMut.mutateAsync(actionUser.user.id);
              success(`${actionUser.user.displayName} deactivated`);
            } else {
              await activateMut.mutateAsync(actionUser.user.id);
              success(`${actionUser.user.displayName} reactivated`);
            }
            setActionUser(null);
          } catch (err) {
            showError(getErrorMessage(err));
          }
        }}
        title={actionUser?.action === 'deactivate' ? 'Deactivate Teacher' : 'Reactivate Teacher'}
        description={
          actionUser?.action === 'deactivate'
            ? `Deactivate ${actionUser?.user.displayName}? They will lose access to the relay bot.`
            : `Reactivate ${actionUser?.user.displayName}? They will regain access to the relay bot.`
        }
        confirmLabel={actionUser?.action === 'deactivate' ? 'Deactivate' : 'Reactivate'}
        destructive={actionUser?.action === 'deactivate'}
        loading={deactivateMut.isPending || activateMut.isPending}
      />
    </div>
  );
}
