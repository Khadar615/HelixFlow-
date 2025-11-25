import React from 'react';
import { Notification } from '../types';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Check } from 'lucide-react';
import { mockService } from '../services/mockData';

interface NotificationsViewProps {
  notifications: Notification[];
  onRefresh: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, onRefresh }) => {
  
  const handleMarkRead = () => {
    mockService.markAllRead('Current User');
    onRefresh();
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="text-green-500" size={20} />;
      case 'WARNING': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'ERROR': return <XCircle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBgColor = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-white dark:bg-slate-800';
    switch (type) {
        case 'SUCCESS': return 'bg-green-50 dark:bg-green-900/20';
        case 'WARNING': return 'bg-amber-50 dark:bg-amber-900/20';
        case 'ERROR': return 'bg-red-50 dark:bg-red-900/20';
        default: return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Bell className="text-slate-600 dark:text-slate-400" />
          Notifications
        </h2>
        {notifications.some(n => !n.read) && (
            <button 
                onClick={handleMarkRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium flex items-center gap-1"
            >
                <Check size={16} /> Mark all as read
            </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed transition-colors">
            <Bell size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 rounded-xl border transition-all ${getBgColor(n.type, n.read)} ${n.read ? 'border-slate-200 dark:border-slate-700' : 'border-blue-200 dark:border-blue-800 shadow-sm'}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                    {getIcon(n.type)}
                </div>
                <div className="flex-1">
                    <p className={`text-sm ${n.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white font-medium'}`}>
                        {n.message}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                    </p>
                </div>
                {!n.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};