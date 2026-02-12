import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/useChatStore';
import { Sidebar } from '../components/layout/Sidebar';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Send, Mic, MicOff, Paperclip, MoreVertical, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const { messages, isTyping, addMessage, setTyping } = useChatStore();
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>('User');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();

  useEffect(() => {
    const name = localStorage.getItem('user_name');
    if (name) setUserName(name);
  }, []);

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend) return;

    const userMsg = { role: 'user' as const, content: textToSend, timestamp: new Date() };
    addMessage(userMsg);
    setInput('');
    setTyping(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const aiMsg = { role: 'ai' as const, content: data.reply, timestamp: new Date() };
      addMessage(aiMsg);
    } catch (error) {
      addMessage({ role: 'ai', content: 'Error: Could not connect to server.', timestamp: new Date() });
    } finally {
      setTyping(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <header className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
            AI Assistant
          </h1>
        </div>
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 max-w-2xl mx-auto px-4">
             <div className="w-20 h-20 bg-linear-to-tr from-blue-600/20 to-emerald-600/20 rounded-3xl flex items-center justify-center mb-8 rotate-3 hover:rotate-6 transition-transform">
               <span className="text-4xl animate-pulse">✨</span>
             </div>
             <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 text-center">
               Hi <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400 capitalize">{userName}</span>,
               <br />
               How can I help you today?
             </h2>
             <p className="text-sm opacity-60 text-center max-w-sm">
               Experience the power of Gemini 1.5 Flash. Try asking about your calendar or writing a story.
             </p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex w-full",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl shadow-sm relative group",
                  msg.role === 'user'
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm"
                    : "bg-slate-800/80 border border-slate-700/50 text-slate-100 rounded-bl-sm backdrop-blur-sm"
                )}
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown 
                    components={{
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <div className="bg-slate-950 p-2 rounded-md my-2 overflow-x-auto text-xs">
                             <code className={className} {...props}>
                               {children}
                             </code>
                          </div>
                        ) : (
                          <code className="bg-slate-900/50 px-1 py-0.5 rounded text-xs" {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                     {typeof msg.content === 'string' ? msg.content : ''}
                  </ReactMarkdown>
                </div>
                <span className="text-[10px] opacity-40 block mt-2 text-right font-medium">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start"
          >
             <div className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-2xl rounded-bl-sm backdrop-blur-sm">
               <div className="flex space-x-1.5">
                 <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
               </div>
             </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center space-x-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:bg-slate-800 transition-all">
          <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : "Type a message..."}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 min-w-0"
          />
          {isSupported && (
            <button 
               className={cn(
                 "p-2 rounded-lg transition-all duration-300", 
                 isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
               )}
               onClick={toggleListening}
               title="Voice Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-blue-600/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
