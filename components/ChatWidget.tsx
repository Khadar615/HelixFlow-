import React, { useState, useEffect, useRef } from 'react';
import { createChatSession } from '../services/geminiService';
import { MessageCircle, X, Send, Loader2, Sparkles, Minimize2, Lightbulb } from 'lucide-react';
import { Chat } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTIONS = [
  "Draft a description for a Tech Workshop",
  "What is the approval workflow?",
  "Checklist for organizing a seminar",
  "Suggest a venue for 200 students"
];

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm the HelixFlow Assistant. I can help you draft event descriptions, explain workflows, or suggest checklists. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = createChatSession();
    setChatSession(session);
  }, []);

  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !chatSession) return;

    if (!textOverride) setInput('');
    
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: textToSend });
      setMessages(prev => [...prev, { role: 'model', text: result.text || "I couldn't generate a response." }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!chatSession) return null; // Don't render if no API key/session

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <div className={`mb-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-80 sm:w-96 overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto flex flex-col ${isOpen ? 'scale-100 opacity-100 h-[500px]' : 'scale-90 opacity-0 h-0 w-0'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles size={18} />
            <span className="font-bold">HelixFlow AI</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
            <Minimize2 size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 transition-colors">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                }`}
              >
                {msg.text.split('\n').map((line, i) => <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>)}
              </div>
            </div>
          ))}
          
          {/* Suggestions - Show only when chat is "fresh" (just the intro message) */}
          {messages.length === 1 && !isLoading && (
             <div className="mt-6 animate-in fade-in duration-500">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Lightbulb size={12} /> Suggested Actions
                </p>
                <div className="grid grid-cols-1 gap-2">
                    {SUGGESTIONS.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSend(undefined, suggestion)}
                            className="text-left text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 transition-all shadow-sm group"
                        >
                            <span className="group-hover:translate-x-1 transition-transform inline-block">{suggestion}</span>
                        </button>
                    ))}
                </div>
             </div>
          )}

          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                 <Loader2 size={16} className="animate-spin text-blue-500" />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
          <form onSubmit={(e) => handleSend(e)} className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen ? 'bg-slate-700 dark:bg-slate-600 text-white rotate-90' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-110'}`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>

    </div>
  );
};