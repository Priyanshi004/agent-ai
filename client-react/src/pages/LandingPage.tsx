import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageSquare, Zap, Shield, Chrome, Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSocialAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        // Fetch user info from Google
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        
        // Sync with our backend
        const response = await fetch(`http://localhost:8000/google-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: userInfo.email,
            name: userInfo.name
          }),
        });
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('user_name', data.name || userInfo.name || 'Google User');
          navigate('/chat');
        } else {
          setError(data.message || `Google authentication failed`);
        }
      } catch (err) {
        setError(`Google authentication failed. Is the server running?`);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google Login Failed');
      setIsLoading(false);
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative selection:bg-blue-500/30">
        
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[30%] h-[30%] bg-emerald-600/20 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold bg-linear-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text"
        >
          AI Assistant
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/login')}
          className="px-6 py-2 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          Sign In
        </motion.button>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center max-w-5xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="inline-flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-slate-300">New: GPT-4o Integration</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
        >
            Your Intelligent
            <br />
            <span className="bg-linear-to-r from-blue-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text animate-gradient">
              Creative Companion
            </span>
        </motion.h1>

        <motion.p 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12"
        >
          Experience the next generation of AI chat. seamless voice interaction, 
          intelligent context retention, and a beautiful interface designed for focus.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button 
            onClick={() => navigate('/login')}
            className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-semibold text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-full font-semibold text-lg transition-all hover:scale-105 active:scale-95 backdrop-blur-sm">
             View Demo
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-sm mx-auto"
        >
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950 px-4 text-slate-500">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialAuth()}
            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900/40 border border-slate-800 rounded-full hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            ) : (
              <>
                <Chrome className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-200">Continue with Google</span>
              </>
            )}
          </button>
          
          {error && (
            <p className="mt-4 text-sm text-red-400 text-center animate-pulse">{error}</p>
          )}
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.7 }}
           className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full"
        >
           <FeatureCard 
             icon={<MessageSquare className="w-6 h-6 text-blue-400" />}
             title="Natural Conversation"
             desc="Chat naturally with an AI that understands context, nuance, and intent better than ever."
           />
           <FeatureCard 
             icon={<Zap className="w-6 h-6 text-yellow-400" />}
             title="Lightning Fast"
             desc="Powered by Vite and optimized for performance. No loading screens, instant responses."
           />
           <FeatureCard 
             icon={<Shield className="w-6 h-6 text-emerald-400" />}
             title="Private & Secure"
             desc="Your conversations are stored locally and encrypted. You own your data."
           />
        </motion.div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: String, desc: String }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 transition-colors backdrop-blur-sm">
      <div className="mb-4 p-3 bg-slate-800 rounded-xl inline-block">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}
