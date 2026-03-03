import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Users,
  MessageSquare,
  Plus,
  Key,
  Megaphone,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useSystemStats, useSystemStatus } from '../hooks/use-system';
import { useAuditLog } from '../hooks/use-audit';
import { StatCard, Card, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PageSpinner } from '../components/ui/spinner';
import { formatRelative, formatDateTime } from '../lib/utils';

export default function DashboardPage() {
  const { user, isSuperadmin } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useSystemStats();
  const { data: status } = useSystemStatus();
  const { data: auditData, isLoading: auditLoading } = useAuditLog({ limit: 10, page: 1 });

  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-heading">
          {greeting}, {user?.email.split('@')[0]}
        </h2>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your tuition center today.
        </p>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <PageSpinner message="Loading stats..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Active Students"
            value={stats?.students.active ?? '—'}
            icon={<GraduationCap size={20} />}
            colorClass="bg-conduit-50 text-conduit-700"
          />
          <StatCard
            label="Teachers"
            value={stats?.users.teachers ?? '—'}
            icon={<BookOpen size={20} />}
            colorClass="bg-indigo-50 text-indigo-700"
          />
          <StatCard
            label="Parents"
            value={stats?.users.parents ?? '—'}
            icon={<Users size={20} />}
            colorClass="bg-teal-50 text-teal-700"
          />
          <StatCard
            label="Messages Today"
            value={stats?.messages.today ?? '—'}
            icon={<MessageSquare size={20} />}
            colorClass="bg-amber-50 text-amber-700"
          />
        </div>
      )}

      {/* Quick Actions + Activity + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <div className="space-y-3">
            <QuickAction
              label="Add Student"
              description="Enrol a new student"
              icon={<Plus size={18} />}
              onClick={() => navigate('/students')}
              color="conduit"
            />
            <QuickAction
              label="Generate Token"
              description="Create an onboarding link"
              icon={<Key size={18} />}
              onClick={() => navigate('/tokens')}
              color="indigo"
            />
            <QuickAction
              label="New Broadcast"
              description="Send a message to all users"
              icon={<Megaphone size={18} />}
              onClick={() => navigate('/broadcasts')}
              color="amber"
            />
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Activity"
            description="Last 10 events across the system"
          />
          {auditLoading ? (
            <PageSpinner message="Loading activity..." />
          ) : auditData?.data.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No activity recorded yet.</p>
          ) : (
            <div className="space-y-1">
              {(auditData?.data ?? []).map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* System Health (superadmin only) */}
      {isSuperadmin && status && (
        <Card>
          <CardHeader
            title="System Health"
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/system-status')}
              >
                View Details
              </Button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <HealthItem
              label="Database"
              ok={status.database.connected}
              detail={`${status.database.latencyMs}ms`}
            />
            <HealthItem
              label="Redis"
              ok={status.redis.connected}
              detail={`${status.redis.latencyMs}ms`}
            />
            <HealthItem
              label="Bot"
              ok={status.bot.running}
              detail={status.bot.webhookSet ? 'Webhook set' : 'Polling'}
            />
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function QuickAction({
  label,
  description,
  icon,
  onClick,
  color,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: 'conduit' | 'indigo' | 'amber';
}) {
  const colorClasses: Record<string, string> = {
    conduit: 'bg-conduit-50 text-conduit-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
    >
      <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-conduit-700 transition-colors">
          {label}
        </p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
    </button>
  );
}

function AuditRow({ entry }: { entry: { id: number; action: string; createdAt: string; targetType: string | null; metadata: Record<string, unknown> | null } }) {
  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-2 h-2 rounded-full bg-conduit-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium truncate">
          {formatAction(entry.action)}
        </p>
        {entry.targetType && (
          <p className="text-xs text-gray-400 truncate">
            Target: {entry.targetType} {entry.metadata ? `— ${JSON.stringify(entry.metadata).slice(0, 60)}` : ''}
          </p>
        )}
      </div>
      <span className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap">
        {formatRelative(entry.createdAt)}
      </span>
    </div>
  );
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function HealthItem({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
      {ok ? (
        <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
      )}
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{detail}</p>
      </div>
      <div className="ml-auto">
        <Badge variant={ok ? 'active' : 'error'}>{ok ? 'OK' : 'Down'}</Badge>
      </div>
    </div>
  );
}
