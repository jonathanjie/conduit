import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'expired'
  | 'used'
  | 'admin'
  | 'superadmin'
  | 'parent'
  | 'teacher'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error';

const variantClasses: Record<BadgeVariant, string> = {
  active: 'bg-green-100 text-green-800 ring-green-200',
  inactive: 'bg-gray-100 text-gray-600 ring-gray-200',
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  expired: 'bg-red-100 text-red-700 ring-red-200',
  used: 'bg-blue-100 text-blue-700 ring-blue-200',
  admin: 'bg-conduit-100 text-conduit-800 ring-conduit-200',
  superadmin: 'bg-purple-100 text-purple-800 ring-purple-200',
  parent: 'bg-teal-100 text-teal-700 ring-teal-200',
  teacher: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  neutral: 'bg-gray-100 text-gray-600 ring-gray-200',
  success: 'bg-green-100 text-green-800 ring-green-200',
  warning: 'bg-amber-100 text-amber-800 ring-amber-200',
  error: 'bg-red-100 text-red-700 ring-red-200',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = 'neutral', children, className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset',
        variantClasses[variant],
        className,
      )}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}

export function tokenStatusBadge(token: { isUsed: boolean; isExpired: boolean }) {
  if (token.isUsed) return <Badge variant="used" dot>Used</Badge>;
  if (token.isExpired) return <Badge variant="expired" dot>Expired</Badge>;
  return <Badge variant="pending" dot>Pending</Badge>;
}

export function roleBadge(role: string) {
  const map: Record<string, BadgeVariant> = {
    superadmin: 'superadmin',
    admin: 'admin',
    teacher: 'teacher',
    parent: 'parent',
  };
  const variant = map[role] ?? 'neutral';
  return <Badge variant={variant}>{role}</Badge>;
}
