import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Copy, Check, Eye, EyeOff } from 'lucide-react';
import ClickSpark from '../components/ClickSpark.js';
import SplitText from '../components/SplitText.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Copy states for the floating helper
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const navigate = useNavigate();

  const handleCopy = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsAuthenticating(true);
    // Simulate real authentication delay
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <ClickSpark
      sparkColor='#3b82f6'
      sparkSize={12}
      sparkRadius={20}
      sparkCount={12}
      duration={500}
      extraScale={1.2}
    >
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans select-none">
        
        {/* Animated Background Gradients & Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.1)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(15,23,42,0.1)_1.5px,transparent_1.5px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

        {/* FLOATING CREDENTIALS HELPER */}
        <div className="absolute top-8 right-8 z-50 animate-in slide-in-from-right-8 fade-in duration-1000 delay-500 hidden lg:block">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)] w-72">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Demo Credentials</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 font-mono mb-1">Analyst Email</p>
                <div className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg p-2 group hover:border-blue-500/50 transition-colors">
                  <span className="text-xs text-slate-300 font-mono select-all">admin@veriscope.ai</span>
                  <button 
                    onClick={() => handleCopy('admin@veriscope.ai', 'email')}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-mono mb-1">Access Key</p>
                <div className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg p-2 group hover:border-blue-500/50 transition-colors">
                  <span className="text-xs text-slate-300 font-mono select-all">Veriscope2026!</span>
                  <button 
                    onClick={() => handleCopy('Veriscope2026!', 'password')}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN LOGIN CONTENT */}
        <div className="w-full max-w-md px-6 relative z-10 flex flex-col items-center">
          
          {/* Logo & Header */}
          <div className="mb-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <span className="text-2xl">🔭</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif font-black text-white tracking-tight flex justify-center">
              <SplitText
                text="Veriscope"
                className="inline-block"
                delay={50}
                duration={1.2}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
              />
              <SplitText
                text="OS"
                className="inline-block ml-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400"
                delay={80}
                duration={1.2}
                from={{ opacity: 0, scale: 0.8 }}
                to={{ opacity: 1, scale: 1 }}
              />
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              <SplitText
                text="Authenticate to access the workspace."
                splitType="words"
                delay={30}
                duration={0.8}
                from={{ opacity: 0, y: 10 }}
                to={{ opacity: 1, y: 0 }}
              />
            </p>
          </div>

          {/* Premium Glassmorphic Login Card */}
          <div className="w-full bg-[#111827]/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden group/card animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
            
            {/* Inner Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono ml-1">
                    Analyst Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@veriscope.ai"
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono ml-1">
                    Access Key
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthenticating || !email || !password}
                className="w-full relative group overflow-hidden rounded-xl bg-slate-100 text-slate-950 font-bold text-sm py-4 transition-all hover:bg-white disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
              >
                {/* Button Glow */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-200/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                
                <span className="relative flex items-center justify-center gap-2">
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 rounded-sm border-2 border-slate-950 border-t-transparent animate-spin" />
                      Authenticating Node...
                    </>
                  ) : (
                    <>
                      Initialize Workspace
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>

            </form>

            <div className="mt-6 text-center text-xs text-slate-500 font-mono">
              Secure AES-256 Connection
            </div>
          </div>
          
        </div>
      </div>
    </ClickSpark>
  );
}
