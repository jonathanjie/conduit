import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Database,
  Server,
  Bot,
  RefreshCw,
  Users,
  GraduationCap,
  MessageSquare,
  Megaphone,
  Key,
} from 'lucide-react';
import { useSystemStatus, useSystemStats } from '../hooks/use-system';
import { Card, CardHeader, StatCard } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { PageSpinner } from '../components/ui/spinner';
import { cn } from '../lib/utils';

export default function SystemStatusPage() {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus, isFetching: statusFetching } = useSystemStatus();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useSystemStats();

  const handleRefresh = () => {
    void refetchStatus();
    void refetchStats();
  };

  const overallOk =
    status?.database.connected && status?.redis.connected && status?.bot.running;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">System Status</h2>
          <p className="text-sm text-gray-500">Health check and usage statistics</p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<RefreshCw size={16} className={statusFetching ? 'animate-spin' : ''} />}
          onClick={handleRefresh}
          disabled={statusFetching}
        >
          Refresh
        </Button>
      </div>

      {/* Overall Status Banner */}
      {status && (
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border',
            overallOk
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800',
          )}
        >
          {overallOk ? (
            <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
          )}
          <div>
            <p className="font-semibold">
              {overallOk ? 'All systems operational' : 'One or more services are down'}
            </p>
            <p className="text-sm opacity-75">
              Version {status.version} — Uptime {formatUptime(status.uptime)}
            </p>
          </div>
          <div className="ml-auto">
            <Badge variant={overallOk ? 'active' : 'error'}>
              {status.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      )}

      {statusLoading ? (
        <PageSpinner message="Checking services..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Database */}
          <ServiceCard
            label="PostgreSQL Database"
            icon={<Database size={24} />}
            ok={status?.database.connected ?? false}
            metrics={[
              { label: 'Status', value: status?.database.connected ? 'Connected' : 'Disconnected' },
              { label: 'Latency', value: `${status?.database.latencyMs ?? '—'}ms` },
            ]}
          />

          {/* Redis */}
          <ServiceCard
            label="Redis Cache"
            icon={<Server size={24} />}
            ok={status?.redis.connected ?? false}
            metrics={[
              { label: 'Status', value: status?.redis.connected ? 'Connected' : 'Disconnected' },
              { label: 'Latency', value: `${status?.redis.latencyMs ?? '—'}ms` },
            ]}
          />

          {/* Bot */}
          <ServiceCard
            label="Telegram Bot"
            icon={<Bot size={24} />}
            ok={status?.bot.running ?? false}
            metrics={[
              { label: 'Running', value: status?.bot.running ? 'Yes' : 'No' },
              { label: 'Webhook', value: status?.bot.webhookSet ? 'Set' : 'Not Set' },
            ]}
          />
        </div>
      )}

      {/* Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 font-heading mb-4">Usage Statistics</h3>
        {statsLoading ? (
          <PageSpinner message="Loading stats..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              label="Total Students"
              value={stats?.students.total ?? '—'}
              icon={<GraduationCap size={20} />}
              colorClass="bg-conduit-50 text-conduit-700"
            />
            <StatCard
              label="Active Students"
              value={stats?.students.active ?? '—'}
              icon={<GraduationCap size={20} />}
              colorClass="bg-green-50 text-green-700"
            />
            <StatCard
              label="Total Users"
              value={stats?.users.total ?? '—'}
              icon={<Users size={20} />}
              colorClass="bg-indigo-50 text-indigo-700"
            />
            <StatCard
              label="Messages Today"
              value={stats?.messages.today ?? '—'}
              icon={<MessageSquare size={20} />}
              colorClass="bg-amber-50 text-amber-700"
            />
            <StatCard
              label="Messages This Month"
              value={stats?.messages.thisMonth ?? '—'}
              icon={<MessageSquare size={20} />}
              colorClass="bg-teal-50 text-teal-700"
            />
            <StatCard
              label="Pending Tokens"
              value={stats?.tokens.pending ?? '—'}
              icon={<Key size={20} />}
              colorClass="bg-purple-50 text-purple-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ServiceCard({
  label,
  icon,
  ok,
  metrics,
}: {
  label: string;
  icon: React.ReactNode;
  ok: boolean;
  metrics: { label: string; value: string }[];
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2.5 rounded-xl',
              ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
            )}
          >
            {icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{label}</p>
            <p className={cn('text-xs font-medium', ok ? 'text-green-600' : 'text-red-600')}>
              {ok ? 'Operational' : 'Degraded'}
            </p>
          </div>
        </div>
        {ok ? (
          <CheckCircle size={20} className="text-green-500" />
        ) : (
          <XCircle size={20} className="text-red-500" />
        )}
      </div>

      <div className="space-y-2">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between py-1 border-t border-gray-100 first:border-0">
            <span className="text-xs text-gray-500">{m.label}</span>
            <span className="text-xs font-medium text-gray-900">{m.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
