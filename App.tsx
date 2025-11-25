import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { BookingForm } from './components/BookingForm';
import { ApprovalsList } from './components/ApprovalsList';
import { ReportForm } from './components/ReportForm';
import { Analytics } from './components/Analytics';
import { NotificationsView } from './components/NotificationsView';
import { ChatWidget } from './components/ChatWidget';
import { mockService } from './services/mockData';
import { UserRole, Event, Notification } from './types';
import { Plus, Calendar, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('ADMIN');
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState<string | null>(null); // Holds event ID
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const venues = mockService.getVenues();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    // 1. Refresh Events
    const currentEvents = mockService.getEvents();
    setEvents([...currentEvents]);

    // 2. Check for Report Reminders
    const today = new Date().toISOString().split('T')[0];
    currentEvents.forEach(e => {
        if (e.status === 'APPROVED' && e.date < today && !e.report && e.organizer === 'Current User') {
             const userNotifs = mockService.getNotifications('Current User');
             const hasReminder = userNotifs.some(n => n.message.includes(e.title) && n.message.includes('Report Due'));
             
             if (!hasReminder) {
                 mockService.addNotification({
                     userId: 'Current User',
                     message: `Report Due: Please submit the post-event report for "${e.title}" to maintain compliance.`,
                     type: 'WARNING'
                 });
             }
        }
    });

    // 3. Refresh Notifications
    setNotifications([...mockService.getNotifications('Current User')]);

  }, [refreshTrigger, currentUserRole]); // Also refresh when role changes to ensure UI updates if we were to filter by role

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  const getPendingCount = () => {
      if(currentUserRole === 'HOD') return events.filter(e => e.status === 'PENDING_HOD').length;
      if(currentUserRole === 'PRINCIPAL') return events.filter(e => e.status === 'PENDING_PRINCIPAL').length;
      if(currentUserRole === 'ADMIN') return events.filter(e => e.status === 'PENDING_ADMIN').length;
      return 0;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationsView notifications={notifications} onRefresh={handleRefresh} />;
      case 'calendar':
        return <CalendarView events={events} venues={venues} />;
      case 'book':
        return (
          <div className="p-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center transition-colors">
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">Book a Venue</h2>
              <p className="text-blue-700 dark:text-blue-300 mb-6">Use our AI-powered system to find the perfect spot for your event.</p>
              <button 
                onClick={() => setShowBookingModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-700 transition"
              >
                Start New Booking
              </button>
            </div>
            <div className="mt-8">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">Your Recent Requests</h3>
                {events.filter(e => e.organizer === 'Current User').length === 0 ? (
                    <p className="text-slate-400">No previous requests found.</p>
                ) : (
                    <div className="space-y-3">
                        {events.filter(e => e.organizer === 'Current User').map(e => (
                            <div key={e.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
                                <span className="font-medium text-slate-800 dark:text-slate-200">{e.title}</span>
                                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">{e.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        );
      case 'approvals':
        return <ApprovalsList role={currentUserRole} events={events} onUpdate={handleRefresh} />;
      case 'reports':
        // Filter events that are approved (happened) but not reported OR reported
        const myEvents = events.filter(e => e.status === 'APPROVED' || e.status === 'COMPLETED');
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Report Submission</h2>
                <div className="grid gap-4">
                    {myEvents.map(e => (
                        <div key={e.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center transition-colors">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{e.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{e.date}</p>
                            </div>
                            {e.status === 'COMPLETED' ? (
                                <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                    <CheckCircle2 size={16} className="mr-1"/> Report Submitted
                                </span>
                            ) : (
                                <button 
                                    onClick={() => setShowReportModal(e.id)}
                                    className="flex items-center space-x-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition"
                                >
                                    <FileText size={16} />
                                    <span>Submit Report</span>
                                </button>
                            )}
                        </div>
                    ))}
                    {myEvents.length === 0 && <p className="text-slate-500 dark:text-slate-400">No completed events requiring reports.</p>}
                </div>
            </div>
        );
      case 'analytics':
        return <Analytics events={events} venues={venues} />;
      case 'dashboard':
      default:
        return (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {currentUserRole}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Here is what's happening on campus today.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Calendar /></div>
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">{events.length}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Scheduled Events</p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><AlertCircle /></div>
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">{getPendingCount()}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending Your Approval</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><FileText /></div>
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">
                        {Math.round((events.filter(e => e.status === 'COMPLETED').length / (events.filter(e => e.status === 'APPROVED' || e.status === 'COMPLETED').length || 1)) * 100)}%
                    </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Report Compliance Rate</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm transition-colors">
                    <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">Quick Actions</h3>
                    <div className="flex gap-3 mt-4">
                        {(currentUserRole === 'COORDINATOR' || currentUserRole === 'ADMIN') && (
                            <button onClick={() => setActiveTab('book')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">Book Venue</button>
                        )}
                        {(currentUserRole !== 'COORDINATOR') && (
                            <button onClick={() => setActiveTab('approvals')} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition">Approvals</button>
                        )}
                    </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm transition-colors">
                     <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">System Status</h3>
                     <div className="space-y-2 mt-4">
                         <div className="flex items-center justify-between text-sm">
                             <span className="flex items-center text-slate-600 dark:text-slate-400"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div> Conflict Detection</span>
                             <span className="font-mono text-green-600 dark:text-green-400">ACTIVE</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                             <span className="flex items-center text-slate-600 dark:text-slate-400"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div> AI Suggestions</span>
                             <span className="font-mono text-green-600 dark:text-green-400">ONLINE</span>
                         </div>
                     </div>
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUserRole={currentUserRole}
        setRole={setCurrentUserRole}
        notificationCount={notifications.filter(n => !n.read).length}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 ml-64 overflow-y-auto p-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {renderContent()}
      </main>

      {showBookingModal && (
        <BookingForm 
          onClose={() => setShowBookingModal(false)} 
          onSuccess={() => {
            setShowBookingModal(false);
            handleRefresh();
            setActiveTab('dashboard'); // Go to dashboard to see pending status
          }} 
        />
      )}

      {showReportModal && (
        <ReportForm
          event={events.find(e => e.id === showReportModal)!}
          onClose={() => setShowReportModal(null)}
          onSuccess={() => {
              setShowReportModal(null);
              handleRefresh();
          }}
        />
      )}

      <ChatWidget />
    </div>
  );
};

export default App;