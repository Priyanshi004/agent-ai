import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Chrome, Loader2, Phone, User } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export default function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Connection failed. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        
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

  const handleSocialAuth = async (method: 'google' | 'phone') => {
    if (method === 'google') {
      googleLogin();
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const endpoint = '/phone-auth';
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'phone-user@example.com' }),
      });
      const data = await response.json();
      if (data.success) {
        navigate('/chat');
      }
    } catch (err) {
      setError(`${method} authentication failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden backdrop-blur-sm">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex p-3 rounded-2xl bg-linear-to-tr from-blue-500/20 to-emerald-500/20 mb-4"
            >
              <User className="w-8 h-8 text-blue-400" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-white to-slate-400 text-transparent bg-clip-text">
              Create Account
            </h1>
            <p className="text-slate-400 mt-2">Start your AI journey today</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all text-white placeholder:text-slate-600"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all text-white placeholder:text-slate-600"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all text-white placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/25 disabled:opacity-70 disabled:hover:scale-100 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/40 px-3 text-slate-500">Or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSocialAuth('google')}
              className="flex items-center justify-center gap-2 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-colors"
            >
              <Chrome className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Google</span>
            </button>
            <button 
              onClick={() => handleSocialAuth('phone')}
              className="flex items-center justify-center gap-2 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-colors"
            >
              <Phone className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">Phone</span>
            </button>
          </div>

          <p className="text-center mt-8 text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
