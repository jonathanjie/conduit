import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuditLog, type AuditEntry } from '../hooks/use-audit';
import { DataTable, type Column } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Input, Select } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatDateTime } from '../lib/utils';

const AUDIT_ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'student.created', label: 'Student Created' },
  { value: 'student.updated', label: 'Student Updated' },
  { value: 'student.deactivated', label: 'Student Deactivated' },
  { value: 'student.imported', label: 'Student Import' },
  { value: 'mapping.created', label: 'Mapping Created' },
  { value: 'mapping.deleted', label: 'Mapping Deleted' },
  { value: 'token.generated', label: 'Token Generated' },
  { value: 'token.used', label: 'Token Used' },
  { value: 'broadcast.sent', label: 'Broadcast Sent' },
  { value: 'user.deactivated', label: 'User Deactivated' },
  { value: 'user.reactivated', label: 'User Reactivated' },
  { value: 'auth.login', label: 'Admin Login' },
  { value: 'auth.logout', label: 'Admin Logout' },
];

function getActionBadgeVariant(action: string): 'success' | 'warning' | 'error' | 'neutral' {
  if (action.includes('created') || action.includes('generated') || action.includes('login')) return 'success';
  if (action.includes('updated') || action.includes('imported')) return 'warning';
  if (action.includes('deactivated') || action.includes('deleted')) return 'error';
  return 'neutral';
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [afterDate, setAfterDate] = useState('');
  const [beforeDate, setBeforeDate] = useState('');

  const { data, isLoading } = useAuditLog({
    page,
    limit: 25,
    action: actionFilter || undefined,
    after: afterDate || undefined,
    before: beforeDate || undefined,
  });

  const hasFilters = actionFilter || afterDate || beforeDate;

  const clearFilters = () => {
    setActionFilter('');
    setAfterDate('');
    setBeforeDate('');
    setPage(1);
  };

  const columns: Column<AuditEntry>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '70px',
      accessor: (e) => (
        <span className="font-mono text-xs text-gray-400">#{e.id}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      accessor: (e) => (
        <Badge variant={getActionBadgeVariant(e.action)}>
          {formatAction(e.action)}
        </Badge>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      accessor: (e) =>
        e.actorId ? (
          <span className="text-sm text-gray-700">
            {e.actorType ?? 'User'} #{e.actorId}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">System</span>
        ),
    },
    {
      key: 'target',
      header: 'Target',
      accessor: (e) =>
        e.targetType && e.targetId ? (
          <span className="text-sm text-gray-600">
            {e.targetType} #{e.targetId}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      key: 'metadata',
      header: 'Details',
      accessor: (e) =>
        e.metadata ? (
          <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono truncate max-w-[200px] block">
            {JSON.stringify(e.metadata).slice(0, 80)}
          </code>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      accessor: (e) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {formatDateTime(e.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Audit Log</h2>
        <p className="text-sm text-gray-500">Full audit trail of all system events</p>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="Action"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            options={AUDIT_ACTIONS}
            className="w-56"
          />
          <Input
            label="From Date"
            type="date"
            value={afterDate}
            onChange={(e) => {
              setAfterDate(e.target.value);
              setPage(1);
            }}
          />
          <Input
            label="To Date"
            type="date"
            value={beforeDate}
            onChange={(e) => {
              setBeforeDate(e.target.value);
              setPage(1);
            }}
          />
          {hasFilters && (
            <Button variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(e) => e.id}
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
        emptyMessage={hasFilters ? 'No events match the current filters.' : 'No audit events recorded yet.'}
      />
    </div>
  );
}

function formatAction(action: string): string {
  return action
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
