import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Truck, Users, MapPin, Wrench, LogOut, DollarSign, X, FileBarChart, Moon, Sun } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Fleet Manager', 'Financial Analyst'] },
    { to: '/vehicles', label: 'Fleet Registry', icon: <Truck className="w-5 h-5" />, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { to: '/drivers', label: 'Drivers', icon: <Users className="w-5 h-5" />, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer'] },
    { to: '/trips', label: 'Trips', icon: <MapPin className="w-5 h-5" />, roles: ['Fleet Manager', 'Dispatcher'] },
    { to: '/finances', label: 'Finances', icon: <DollarSign className="w-5 h-5" />, roles: ['Fleet Manager', 'Financial Analyst'] },
    { to: '/maintenance', label: 'Maintenance', icon: <Wrench className="w-5 h-5" />, roles: ['Fleet Manager'] },
    { to: '/reports', label: 'Reports', icon: <FileBarChart className="w-5 h-5" />, roles: ['Fleet Manager', 'Financial Analyst'] },
  ];

  const visibleLinks = links.filter(link => link.roles.includes(user?.role_name));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed left-0 top-0 z-50 h-screen w-64 flex flex-col bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 shadow-sm
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-500 tracking-tight flex items-center gap-2">
              <Truck className="w-6 h-6" /> TransitOps
            </h1>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 uppercase tracking-wider font-semibold">Smart Transport</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 p-2 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800/50'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-lg">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-neutral-200">{user?.email}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">{user?.role_name}</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme} 
            className="p-2 text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 text-slate-600 dark:text-neutral-300 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
