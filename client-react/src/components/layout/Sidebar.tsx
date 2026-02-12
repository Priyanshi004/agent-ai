import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Trash2, X, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useChatStore } from '../../store/useChatStore';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { clearChat } = useChatStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20"
          />
          
          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-30 flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                History
              </h2>
              <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
                 <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
               <button 
                  onClick={() => {
                    clearChat();
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 rounded-xl transition-all group"
               >
                 <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                 <span className="font-medium">New Chat</span>
               </button>

               <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-6 mb-2 px-2">
                 Recent
               </div>

               {/* Mock History Items */}
               <HistoryItem title="Project Planning AI" time="2h ago" active />
               <HistoryItem title="React Component Help" time="Yesterday" />
               <HistoryItem title="Debug Python Script" time="Yesterday" />
            </div>

            <div className="p-4 border-t border-slate-800 space-y-1">
               <button 
                 onClick={clearChat}
                 className="flex items-center space-x-2 text-slate-400 hover:text-red-400 transition-colors text-sm w-full px-3 py-2 hover:bg-red-400/10 rounded-lg"
               >
                 <Trash2 className="w-4 h-4" />
                 <span>Clear Conversations</span>
               </button>
               <button 
                 onClick={handleLogout}
                 className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm w-full px-3 py-2 hover:bg-slate-800 rounded-lg"
               >
                 <LogOut className="w-4 h-4" />
                 <span>Log Out</span>
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function HistoryItem({ title, time, active }: { title: string, time: string, active?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-colors",
      active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
    )}>
      <MessageSquare className="w-4 h-4" />
      <div className="flex-1 overflow-hidden">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="text-xs opacity-50">{time}</div>
      </div>
    </button>
  )
}
