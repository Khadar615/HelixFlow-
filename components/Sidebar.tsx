import React from 'react';
import { LayoutDashboard, Calendar, PlusCircle, CheckSquare, FileText, BarChart3, Settings, Shield, Bell, Sun, Moon } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUserRole: UserRole;
  setRole: (role: UserRole) => void;
  notificationCount: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUserRole, setRole, notificationCount, theme, toggleTheme }) => {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['COORDINATOR', 'HOD', 'PRINCIPAL', 'ADMIN'] },
    { id: 'calendar', label: 'Events Calendar', icon: Calendar, roles: ['COORDINATOR', 'HOD', 'PRINCIPAL', 'ADMIN'] },
    { id: 'book', label: 'Book Venue', icon: PlusCircle, roles: ['COORDINATOR', 'ADMIN'] },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare, roles: ['HOD', 'PRINCIPAL', 'ADMIN'] },
    { id: 'reports', label: 'Reports & Docs', icon: FileText, roles: ['COORDINATOR', 'ADMIN'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN', 'PRINCIPAL'] },
  ];

  return (
    <div className="w-64 bg-slate-900 dark:bg-slate-950 text-white h-screen flex flex-col fixed left-0 top-0 shadow-xl z-10 border-r border-slate-800">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="bg-blue-500 p-2 rounded-lg">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
        <h1 className="text-xl font-bold tracking-tight">HelixFlow</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.filter(item => item.roles.includes(currentUserRole)).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {/* Notification Item - Available to all */}
        <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'notifications' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
                <Bell size={20} />
                <span className="font-medium">Notifications</span>
            </div>
            {notificationCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {notificationCount > 9 ? '9+' : notificationCount}
                </span>
            )}
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900 dark:bg-slate-950">
        
        {/* Theme Toggle */}
        <div className="mb-4 flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Theme</span>
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
        </div>

        <div className="flex items-center space-x-2 mb-3 text-slate-500 text-xs uppercase tracking-wider font-semibold">
          <Shield size={12} />
          <span>Role Simulation</span>
        </div>
        <select 
          value={currentUserRole} 
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-200"
        >
          <option value="COORDINATOR">Coordinator</option>
          <option value="HOD">Head of Dept (HOD)</option>
          <option value="PRINCIPAL">Principal</option>
          <option value="ADMIN">Administrator</option>
        </select>
        <div className="mt-3 flex items-center space-x-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {currentUserRole[0]}
            </div>
            <div>
                <p className="text-sm font-medium text-white">Current User</p>
                <p className="text-xs text-slate-500 capitalize">{currentUserRole.toLowerCase()}</p>
            </div>
        </div>
      </div>
    </div>
  );
};