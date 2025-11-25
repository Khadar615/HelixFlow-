import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockData';
import { suggestVenue } from '../services/geminiService';
import { Venue, UserRole } from '../types';
import { Sparkles, AlertCircle, Check, Loader2, Search } from 'lucide-react';

interface BookingFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    department: 'Computer Science', // Default
    description: '',
    attendees: 50,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    venueId: ''
  });

  const [conflict, setConflict] = useState(false);
  const [suggestedIds, setSuggestedIds] = useState<string[]>([]);

  useEffect(() => {
    setVenues(mockService.getVenues());
  }, []);

  // Conflict detection
  useEffect(() => {
    if (formData.venueId && formData.date && formData.startTime && formData.endTime) {
      const hasConflict = mockService.checkConflict(
        formData.venueId,
        formData.date,
        formData.startTime,
        formData.endTime
      );
      setConflict(hasConflict);
    } else {
      setConflict(false);
    }
  }, [formData.venueId, formData.date, formData.startTime, formData.endTime]);

  const handleAISuggest = async () => {
    if (!formData.description) {
        setAiError("Please enter a description first.");
        return;
    }
    setLoadingAI(true);
    setAiError('');
    const ids = await suggestVenue(
      `${formData.description}. I expect around ${formData.attendees} attendees.`, 
      venues
    );
    setSuggestedIds(ids);
    setLoadingAI(false);
    if (ids.length > 0) {
        setFormData(prev => ({ ...prev, venueId: ids[0] }));
    } else {
        setAiError("No specific recommendations found via AI.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflict) return;

    mockService.addEvent({
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      organizer: 'Current User', // In real app, get from auth
      department: formData.department,
      venueId: formData.venueId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      description: formData.description,
      status: 'PENDING_HOD' // Starts approval chain
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        <div className="p-6 bg-blue-600 dark:bg-blue-700 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">Book a Venue</h3>
          <button onClick={onClose} className="hover:bg-blue-700 dark:hover:bg-blue-600 p-1 rounded">✕</button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
                <input 
                  required
                  type="text" 
                  className="w-full border dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select 
                  className="w-full border dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                >
                  <option>Computer Science</option>
                  <option>Mechanical Eng</option>
                  <option>Business School</option>
                  <option>Administration</option>
                  <option>Electrical Engineering</option>
                  <option>Civil Engineering</option>
                  <option>Architecture</option>
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Biology</option>
                  <option>History</option>
                </select>
              </div>
            </div>

            {/* AI Section */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-indigo-900 dark:text-indigo-200">Event Description & Requirements</label>
                <button 
                  type="button"
                  onClick={handleAISuggest}
                  disabled={loadingAI}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full flex items-center space-x-1 hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loadingAI ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                  <span>Smart Suggest</span>
                </button>
              </div>
              <textarea 
                required
                rows={3}
                className="w-full border border-indigo-200 dark:border-indigo-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="E.g., I need a room with a projector and good sound system for a guest lecture on AI..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                     <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Est. Attendees:</label>
                     <input 
                        type="number" 
                        className="w-20 border dark:border-slate-700 rounded px-2 py-1 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={formData.attendees}
                        onChange={e => setFormData({...formData, attendees: Number(e.target.value)})}
                     />
                  </div>
                  {aiError && <span className="text-xs text-red-500">{aiError}</span>}
              </div>
            </div>

            {/* Venue Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Venue</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                {venues.map(v => {
                    const isSuggested = suggestedIds.includes(v.id);
                    return (
                    <div 
                        key={v.id}
                        onClick={() => setFormData({...formData, venueId: v.id})}
                        className={`p-3 rounded-lg border cursor-pointer transition-all relative ${
                        formData.venueId === v.id 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                    >
                        {isSuggested && (
                            <div className="absolute top-2 right-2">
                                <Sparkles size={14} className="text-indigo-500 fill-indigo-100 dark:fill-indigo-900" />
                            </div>
                        )}
                        <div className="font-medium text-sm text-slate-900 dark:text-white">{v.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
                            <span>Cap: {v.capacity}</span>
                            <span>•</span>
                            <span className="truncate max-w-[100px]">{v.features.join(', ')}</span>
                        </div>
                    </div>
                    )
                })}
              </div>
            </div>

            {/* Time & Date */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input 
                  type="date"
                  required
                  className="w-full border dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start</label>
                <input 
                  type="time"
                  required
                  className="w-full border dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End</label>
                <input 
                  type="time"
                  required
                  className="w-full border dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            {/* Conflict Alert */}
            {conflict && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-lg flex items-center space-x-2 text-sm font-medium">
                <AlertCircle size={16} />
                <span>Slot not available</span>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-slate-700">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
              <button 
                type="submit" 
                disabled={conflict || !formData.venueId}
                className={`px-6 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                    conflict 
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-400 cursor-not-allowed' 
                    : !formData.venueId 
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <span>{conflict ? 'Slot Not Available' : 'Submit for Approval'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};