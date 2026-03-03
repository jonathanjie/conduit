import React, { useState } from 'react';
import { Plus, Copy, CheckCheck } from 'lucide-react';
import { useTokens, useGenerateToken, type Token } from '../hooks/use-tokens';
import { useStudents } from '../hooks/use-students';
import { DataTable, type Column } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge, tokenStatusBadge } from '../components/ui/badge';
import { Dialog } from '../components/ui/dialog';
import { useToast } from '../components/ui/toast';
import { getErrorMessage, formatDateTime } from '../lib/utils';

export default function TokensPage() {
  const { success, error: showError } = useToast();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'parent' | 'teacher' | ''>('');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<{
    token: string;
    deepLink: string;
    role: string;
  } | null>(null);

  const { data, isLoading } = useTokens({
    page,
    role: roleFilter || undefined,
  });
  const generateMut = useGenerateToken();

  const columns: Column<Token>[] = [
    {
      key: 'token',
      header: 'Token',
      accessor: (t) => (
        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
          {t.token.slice(0, 16)}...
        </code>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (t) => (
        <Badge variant={t.role === 'teacher' ? 'teacher' : 'parent'}>
          {t.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (t) => tokenStatusBadge(t),
    },
    {
      key: 'createdAt',
      header: 'Created',
      accessor: (t) => formatDateTime(t.createdAt),
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      accessor: (t) => formatDateTime(t.expiresAt),
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      align: 'right',
      accessor: (t) => (
        <CopyButton value={`https://t.me/MathMavens_bot?start=${t.token}`} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Tokens</h2>
          <p className="text-sm text-gray-500">Onboarding tokens for teachers and parents</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setGenerateOpen(true)}>
          Generate Token
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex items-center gap-4">
          <Select
            label=""
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as 'parent' | 'teacher' | '');
              setPage(1);
            }}
            options={[
              { value: '', label: 'All roles' },
              { value: 'teacher', label: 'Teacher' },
              { value: 'parent', label: 'Parent' },
            ]}
            className="w-48"
          />
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(t) => t.id}
        loading={isLoading}
        emptyMessage="No tokens generated yet."
      />

      {/* Generate Token Dialog */}
      <GenerateTokenDialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onGenerated={(result) => {
          setGenerateOpen(false);
          setGeneratedToken(result);
        }}
      />

      {/* Show generated token */}
      {generatedToken && (
        <Dialog
          open={generatedToken !== null}
          onClose={() => setGeneratedToken(null)}
          title="Token Generated"
          description="Share this deep link with the user to onboard them."
          size="sm"
          footer={
            <Button onClick={() => setGeneratedToken(null)}>Done</Button>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Token</p>
                <code className="text-sm font-mono text-gray-800 break-all">{generatedToken.token}</code>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Deep Link</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-conduit-700 break-all flex-1">
                    {generatedToken.deepLink}
                  </code>
                  <CopyButton value={generatedToken.deepLink} />
                </div>
              </div>
              <div>
                <Badge variant={generatedToken.role === 'teacher' ? 'teacher' : 'parent'}>
                  {generatedToken.role}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              This link will expire in 48 hours and can only be used once.
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg text-gray-400 hover:text-conduit-700 hover:bg-conduit-50 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <CheckCheck size={14} className="text-green-600" /> : <Copy size={14} />}
    </button>
  );
}

function GenerateTokenDialog({
  open,
  onClose,
  onGenerated,
}: {
  open: boolean;
  onClose: () => void;
  onGenerated: (result: { token: string; deepLink: string; role: string }) => void;
}) {
  const { error: showError } = useToast();
  const [role, setRole] = useState<'parent' | 'teacher'>('parent');
  const [studentId, setStudentId] = useState('');
  const [expiresInHours, setExpiresInHours] = useState('48');

  const { data: studentsData } = useStudents({ limit: 100 });
  const generateMut = useGenerateToken();

  const studentOptions = (studentsData?.data ?? []).map((s) => ({
    value: String(s.id),
    label: s.grade ? `${s.name} (${s.grade})` : s.name,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await generateMut.mutateAsync({
        role,
        studentId: studentId ? Number(studentId) : undefined,
        expiresInHours: expiresInHours ? Number(expiresInHours) : undefined,
      });
      onGenerated(result);
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Generate Token"
      description="Create an onboarding link for a teacher or parent."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={generateMut.isPending}>Cancel</Button>
          <Button form="generate-token-form" type="submit" loading={generateMut.isPending}>
            Generate
          </Button>
        </>
      }
    >
      <form id="generate-token-form" onSubmit={handleSubmit} className="space-y-4">
        {generateMut.error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {getErrorMessage(generateMut.error)}
          </div>
        )}
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'parent' | 'teacher')}
          options={[
            { value: 'parent', label: 'Parent' },
            { value: 'teacher', label: 'Teacher' },
          ]}
        />
        <Select
          label="Link to Student (optional)"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          options={[{ value: '', label: 'None' }, ...studentOptions]}
        />
        <Select
          label="Expires In"
          value={expiresInHours}
          onChange={(e) => setExpiresInHours(e.target.value)}
          options={[
            { value: '24', label: '24 hours' },
            { value: '48', label: '48 hours' },
            { value: '168', label: '7 days' },
            { value: '720', label: '30 days' },
          ]}
        />
      </form>
    </Dialog>
  );
}
