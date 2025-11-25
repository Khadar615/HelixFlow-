import React from 'react';
import { Event, Venue } from '../types';
import { MapPin, Clock } from 'lucide-react';

interface CalendarViewProps {
  events: Event[];
  venues: Venue[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, venues }) => {
  const today = new Date();
  
  // Simple generic next 7 days view for MVP
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const getEventsForDate = (date: string) => events.filter(e => e.date === date && e.status === 'APPROVED');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Campus Events Calendar</h2>
        <span className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded border dark:border-slate-700 shadow-sm transition-colors">
          Showing confirmed bookings
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dates.map(date => {
            const daysEvents = getEventsForDate(date);
            const dateObj = new Date(date);
            
            return (
                <div key={date} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                    <div className="bg-slate-50 dark:bg-slate-850 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            {daysEvents.length}
                        </span>
                    </div>
                    <div className="p-4 space-y-3 min-h-[150px]">
                        {daysEvents.length === 0 ? (
                            <p className="text-sm text-slate-400 dark:text-slate-600 italic text-center py-4">No events scheduled</p>
                        ) : (
                            daysEvents.map(ev => {
                                const venue = venues.find(v => v.id === ev.venueId);
                                return (
                                    <div key={ev.id} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 hover:shadow-md transition-shadow">
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm truncate">{ev.title}</h4>
                                        <div className="flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300 mt-1">
                                            <Clock size={12} />
                                            <span>{ev.startTime} - {ev.endTime}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            <MapPin size={12} />
                                            <span className="truncate">{venue?.name}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};