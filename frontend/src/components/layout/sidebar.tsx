import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  GitBranch,
  Key,
  Megaphone,
  BookOpen,
  Users,
  UserCog,
  ClipboardList,
  Activity,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth';

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  superadminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/students', label: 'Students', icon: <GraduationCap size={18} /> },
  { to: '/teachers', label: 'Teachers', icon: <BookOpen size={18} /> },
  { to: '/parents', label: 'Parents', icon: <Users size={18} /> },
  { to: '/mappings', label: 'Mappings', icon: <GitBranch size={18} /> },
  { to: '/tokens', label: 'Tokens', icon: <Key size={18} /> },
  { to: '/broadcasts', label: 'Broadcasts', icon: <Megaphone size={18} /> },
];

const superadminItems: NavItem[] = [
  { to: '/user-management', label: 'User Management', icon: <UserCog size={18} />, superadminOnly: true },
  { to: '/audit-log', label: 'Audit Log', icon: <ClipboardList size={18} />, superadminOnly: true },
  { to: '/system-status', label: 'System Status', icon: <Activity size={18} />, superadminOnly: true },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isSuperadmin } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-30 flex flex-col',
          'conduit-sidebar w-64',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-sm font-heading">C</span>
            </div>
            <div>
              <p className="text-white font-bold text-base font-heading leading-tight">Conduit</p>
              <p className="text-white/50 text-xs">Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <SidebarLink key={item.to} item={item} onClick={onClose} />
            ))}
          </div>

          {isSuperadmin && (
            <>
              <div className="mt-6 mb-2 px-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Superadmin
                </p>
              </div>
              <div className="space-y-1">
                {superadminItems.map((item) => (
                  <SidebarLink key={item.to} item={item} onClick={onClose} />
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/30 text-xs text-center">Math Mavens Bot</p>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/70 hover:bg-white/10 hover:text-white',
        )
      }
    >
      {item.icon}
      {item.label}
    </NavLink>
  );
}
