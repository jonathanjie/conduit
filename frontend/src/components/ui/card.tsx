import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className, padding = 'md', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function CardHeader({ title, description, actions, className, ...props }: CardHeaderProps) {
  return (
    <div {...props} className={cn('flex items-start justify-between mb-6', className)}>
      <div>
        <h3 className="text-base font-semibold text-gray-900 font-heading">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  colorClass?: string;
}

export function StatCard({ label, value, icon, trend, colorClass = 'bg-conduit-50 text-conduit-700' }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && (
          <div className={cn('p-2 rounded-lg', colorClass)}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 font-heading">{value}</p>
        {trend && (
          <p className={cn('mt-1 text-xs font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
            {trend.value >= 0 ? '+' : ''}{trend.value} {trend.label}
          </p>
        )}
      </div>
    </Card>
  );
}
