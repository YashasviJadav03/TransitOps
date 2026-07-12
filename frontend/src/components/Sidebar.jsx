import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Truck, Users, MapPin, Wrench, LogOut, DollarSign, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Fleet Manager', 'Financial Analyst'] },
    { to: '/vehicles', label: 'Fleet Registry', icon: <Truck className="w-5 h-5" />, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { to: '/drivers', label: 'Drivers', icon: <Users className="w-5 h-5" />, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer'] },
    { to: '/trips', label: 'Trips', icon: <MapPin className="w-5 h-5" />, roles: ['Fleet Manager', 'Dispatcher'] },
    { to: '/finances', label: 'Finances', icon: <DollarSign className="w-5 h-5" />, roles: ['Fleet Manager', 'Financial Analyst'] },
    { to: '/maintenance', label: 'Maintenance', icon: <Wrench className="w-5 h-5" />, roles: ['Fleet Manager'] },
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
        fixed left-0 top-0 z-50 h-screen w-64 flex flex-col bg-white border-r border-slate-200 shadow-sm
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
              <Truck className="w-6 h-6" /> TransitOps
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Smart Transport</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-md">
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
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-slate-900">{user?.email}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role_name}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
