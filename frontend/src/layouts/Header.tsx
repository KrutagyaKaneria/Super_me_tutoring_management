import { useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { ROLES, APP_NAME, NAV_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { GraduationCap, Bell, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Users, Calendar, CheckCircle, PenLine,
  DollarSign, FileText,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  LayoutGrid, Users, Calendar, CheckCircle, PenLine, Bell,
  DollarSign, FileText,
};

export function Header() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = NAV_CONFIG[role];

  const handleRoleSwitch = (newRole: typeof role) => {
    setRole(newRole);
    navigate(`/${newRole}`);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2.5">
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base hidden sm:inline">{APP_NAME}</span>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            {/* Search bar or breadcrumbs could go here */}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative cursor-pointer">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-2 py-1 rounded-full border border-slate-100 bg-slate-50/50">
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
                <span className="text-[10px] font-bold text-indigo-700">JD</span>
              </div>
              <div className="hidden sm:block text-left mr-1">
                <div className="text-[11px] font-bold leading-tight">Jon Doe</div>
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-tighter leading-tight">{role}</div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="w-64 h-full bg-white shadow-xl p-3 space-y-1 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Navigation
            </p>
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutGrid;
              const basePath = `/${role}`;
              const fullPath = item.path ? `${basePath}/${item.path}` : basePath;
              const isActive = location.pathname === fullPath ||
                (item.path === '' && location.pathname === basePath);

              return (
                <NavLink
                  key={item.id}
                  to={fullPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
