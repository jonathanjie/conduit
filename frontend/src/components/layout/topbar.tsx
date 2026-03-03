import React, { useState } from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth';
import { useToast } from '../ui/toast';
import { getErrorMessage } from '../../lib/utils';

interface TopbarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export function Topbar({ onMenuToggle, pageTitle }: TopbarProps) {
  const { user, logout, isSuperadmin } = useAuth();
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="conduit-topbar h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left: Hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        {pageTitle && (
          <h1 className="text-lg font-semibold text-gray-900 font-heading">{pageTitle}</h1>
        )}
      </div>

      {/* Right: User menu */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-conduit-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {user?.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900 leading-tight">
              {user?.email}
            </p>
            <p className="text-xs text-gray-500">
              {isSuperadmin ? 'Superadmin' : 'Admin'}
            </p>
          </div>
          <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
        </button>

        {/* Dropdown */}
        {userMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setUserMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isSuperadmin ? 'Superadmin' : 'Admin'}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm',
                    'text-red-600 hover:bg-red-50 transition-colors',
                    'disabled:opacity-50',
                  )}
                >
                  <LogOut size={16} />
                  {loggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
