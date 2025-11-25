import React, { useState, useRef } from 'react';
import { Event } from '../types';
import { mockService } from '../services/mockData';
import { analyzeReport } from '../services/geminiService';
import { Upload, FileText, CheckCircle, Sparkles, Loader2, X } from 'lucide-react';

interface ReportFormProps {
  event: Event;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ event, onClose, onSuccess }) => {
  const [attendance, setAttendance] = useState(0);
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
      if (!summary) return;
      // Avoid re-analyzing if we already have a result for the same text (optimization could be added here, but simple check is ok)
      setAnalyzing(true);
      const result = await analyzeReport(summary);
      setAiAnalysis(result);
      setAnalyzing(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Process files into Base64 for persistent storage in mock data
    const filePromises = files.map(file => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    }));

    try {
        const processedFiles = await Promise.all(filePromises);
        
        mockService.submitReport(event.id, {
            attendance,
            summary,
            photos: processedFiles
        });
        
        setIsSubmitting(false);
        onSuccess();
    } catch (error) {
        console.error("Error uploading files:", error);
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Submit Post-Event Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{event.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Actual Attendance</label>
            <input 
              type="number" 
              required
              min="0"
              className="w-full border dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              value={attendance}
              onChange={e => setAttendance(Number(e.target.value))}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Event Summary</label>
                <div className="flex items-center space-x-2">
                   {analyzing && <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center"><Loader2 size={10} className="animate-spin mr-1"/> Analyzing...</span>}
                   {!analyzing && !aiAnalysis && summary && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">AI analysis on finish</span>
                   )}
                </div>
            </div>
            <textarea 
              required
              rows={4}
              className="w-full border dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Describe the event outcome, any issues faced..."
              value={summary}
              onChange={e => setSummary(e.target.value)}
              onBlur={handleAnalyze}
            />
            
            {aiAnalysis && (
                <div className="mt-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800 flex items-start space-x-2">
                    <Sparkles size={16} className="text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-1">AI Feedback</p>
                        <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">{aiAnalysis}</p>
                    </div>
                </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assets (Photos, Attendance Sheet)</label>
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center text-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-400 cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/50"
            >
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Upload className="text-slate-400 mb-2" size={24} />
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Click to upload files</span>
              <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF</span>
            </div>

            {files.length > 0 && (
                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto pr-1">
                    {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center space-x-2 overflow-hidden">
                                <FileText size={14} className="text-blue-500 flex-shrink-0"/>
                                <span className="truncate text-slate-700 dark:text-slate-300">{file.name}</span>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => removeFile(idx)}
                                className="text-slate-400 hover:text-red-500 transition ml-2"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center space-x-2 transition disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
            <span>Submit Report</span>
          </button>
        </form>
      </div>
    </div>
  );
};