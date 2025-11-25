import React from 'react';
import { Event, UserRole, ApprovalStatus } from '../types';
import { mockService } from '../services/mockData';
import { Check, X, Clock, User, Building2 } from 'lucide-react';

interface ApprovalsListProps {
  role: UserRole;
  events: Event[];
  onUpdate: () => void;
}

export const ApprovalsList: React.FC<ApprovalsListProps> = ({ role, events, onUpdate }) => {
  
  // Define which status the current role needs to act upon
  const relevantStatus: ApprovalStatus | undefined = 
    role === 'HOD' ? 'PENDING_HOD' :
    role === 'PRINCIPAL' ? 'PENDING_PRINCIPAL' :
    role === 'ADMIN' ? 'PENDING_ADMIN' : undefined;

  const pendingEvents = events.filter(e => e.status === relevantStatus);

  const handleAction = (eventId: string, action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT') {
      mockService.updateEventStatus(eventId, 'REJECTED');
    } else {
      // Logic for next step
      let nextStatus: ApprovalStatus = 'APPROVED';
      if (role === 'HOD') nextStatus = 'PENDING_PRINCIPAL';
      else if (role === 'PRINCIPAL') nextStatus = 'PENDING_ADMIN';
      else if (role === 'ADMIN') nextStatus = 'APPROVED'; // Final step

      mockService.updateEventStatus(eventId, nextStatus);
    }
    onUpdate();
  };

  if (!relevantStatus && role !== 'ADMIN') {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">You do not have approval privileges.</div>;
  }

  // For Admin, also show general list, but for this specific view, let's focus on pending actions
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Pending Approvals</h2>
        <p className="text-slate-500 dark:text-slate-400">Review and authorize venue requests.</p>
      </div>

      <div className="space-y-4">
        {pendingEvents.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center transition-colors">
            <Check className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-slate-600 dark:text-slate-300 font-medium">You're all caught up!</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">No pending requests for your review.</p>
          </div>
        ) : (
          pendingEvents.map(ev => (
            <div key={ev.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{ev.title}</h3>
                  <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs px-2 py-0.5 rounded font-semibold border border-yellow-200 dark:border-yellow-800">
                    Needs {role} Approval
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{ev.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
                  <div className="flex items-center space-x-1">
                    <User size={14} />
                    <span>{ev.organizer} ({ev.department})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{ev.date} • {ev.startTime}-{ev.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building2 size={14} />
                    <span>Venue ID: {ev.venueId}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => handleAction(ev.id, 'REJECT')}
                  className="flex-1 md:flex-none px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center justify-center space-x-2 transition"
                >
                  <X size={16} />
                  <span>Reject</span>
                </button>
                <button 
                  onClick={() => handleAction(ev.id, 'APPROVE')}
                  className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center justify-center space-x-2 shadow-sm transition"
                >
                  <Check size={16} />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};