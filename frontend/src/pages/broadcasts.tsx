import React, { useState } from 'react';
import { Send, Eye } from 'lucide-react';
import { useBroadcasts, useCreateBroadcast, type Broadcast } from '../hooks/use-broadcasts';
import { DataTable, type Column } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Input, Textarea, Select } from '../components/ui/input';
import { Card, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../components/ui/toast';
import { getErrorMessage, formatDateTime } from '../lib/utils';
import { cn } from '../lib/utils';

const BROADCAST_SCOPES = [
  { value: 'all', label: 'All Users (Teachers + Parents)' },
  { value: 'teachers', label: 'Teachers Only' },
  { value: 'parents', label: 'Parents Only' },
];

export default function BroadcastsPage() {
  const { success, error: showError } = useToast();
  const [page, setPage] = useState(1);

  // Compose form
  const [scope, setScope] = useState('all');
  const [messageText, setMessageText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const { data, isLoading, refetch } = useBroadcasts({ page });
  const createMut = useCreateBroadcast();

  const columns: Column<Broadcast>[] = [
    {
      key: 'scope',
      header: 'Scope',
      accessor: (b) => (
        <Badge variant="neutral">{formatScope(b.scope)}</Badge>
      ),
    },
    {
      key: 'preview',
      header: 'Message Preview',
      accessor: (b) => (
        <span className="text-sm text-gray-600 truncate max-w-xs block">
          {b.messagePreview ?? '—'}
        </span>
      ),
    },
    {
      key: 'targets',
      header: 'Targets',
      align: 'right',
      accessor: (b) => (
        <span className="font-medium">{b.targetCount}</span>
      ),
    },
    {
      key: 'delivered',
      header: 'Delivered',
      align: 'right',
      accessor: (b) => (
        <span className="text-green-700 font-medium">{b.deliveredCount}</span>
      ),
    },
    {
      key: 'failed',
      header: 'Failed',
      align: 'right',
      accessor: (b) => (
        <span className={b.failedCount > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
          {b.failedCount}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (b) =>
        b.completedAt ? (
          <Badge variant="active" dot>Completed</Badge>
        ) : (
          <Badge variant="pending" dot>In Progress</Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Sent',
      accessor: (b) => formatDateTime(b.createdAt),
    },
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    try {
      const result = await createMut.mutateAsync({ scope, messageText: messageText.trim() });
      success(`Broadcast queued — ${result.queued} messages`);
      setMessageText('');
      setScope('all');
      setShowPreview(false);
      void refetch();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const charCount = messageText.length;
  const charLimit = 4096;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Broadcasts</h2>
        <p className="text-sm text-gray-500">Send messages to teachers and parents via Telegram</p>
      </div>

      {/* Compose */}
      <Card>
        <CardHeader title="Compose Broadcast" />
        <form onSubmit={handleSend} className="space-y-5">
          {createMut.error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {getErrorMessage(createMut.error)}
            </div>
          )}

          <Select
            label="Audience"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            options={BROADCAST_SCOPES}
          />

          <div className="space-y-1.5">
            <Textarea
              label="Message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={5}
              placeholder="Type your message here... Supports Telegram Markdown."
              maxLength={charLimit}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">Supports Telegram Markdown (*bold*, _italic_, etc.)</p>
              <p className={cn('text-xs font-medium', charCount > charLimit * 0.9 ? 'text-amber-600' : 'text-gray-400')}>
                {charCount}/{charLimit}
              </p>
            </div>
          </div>

          {/* Preview */}
          {showPreview && messageText && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preview</p>
              <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{messageText}</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Recipients: {BROADCAST_SCOPES.find(s => s.value === scope)?.label}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              leftIcon={<Eye size={16} />}
              onClick={() => setShowPreview((v) => !v)}
              disabled={!messageText}
            >
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button
              type="submit"
              loading={sending}
              leftIcon={<Send size={16} />}
              disabled={!messageText.trim()}
            >
              Send Broadcast
            </Button>
          </div>
        </form>
      </Card>

      {/* History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 font-heading mb-4">Broadcast History</h3>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyExtractor={(b) => b.id}
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
          emptyMessage="No broadcasts sent yet."
        />
      </div>
    </div>
  );
}

function formatScope(scope: string): string {
  const map: Record<string, string> = {
    all: 'All Users',
    teachers: 'Teachers',
    parents: 'Parents',
  };
  return map[scope] ?? scope;
}
