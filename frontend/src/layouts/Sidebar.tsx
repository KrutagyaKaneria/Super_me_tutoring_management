import { NavLink, useLocation } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { NAV_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  LayoutGrid, Users, Calendar, CheckCircle, PenLine, Bell,
  DollarSign, FileText, User
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  LayoutGrid, Users, Calendar, CheckCircle, PenLine, Bell,
  DollarSign, FileText, User
};

export function Sidebar() {
  const { role } = useRole();
  const location = useLocation();
  const navItems = NAV_CONFIG[role];

  return (
    <aside className="w-[220px] shrink-0 border-r border-slate-100 bg-white h-full overflow-y-auto hidden md:block">
      <nav className="py-4 px-3 space-y-1">
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
      </nav>
    </aside>
  );
}
