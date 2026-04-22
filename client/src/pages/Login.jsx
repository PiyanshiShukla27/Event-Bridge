import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Users, Calendar, CheckCircle, TrendingUp, Award, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [role, setRole] = useState('participant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password, role);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/participant');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ─── LEFT PANEL — Full height green branding ─── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #047857 100%)' }}
      >
        {/* Animated floating shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[15%] w-72 h-72 bg-white/[0.04] rounded-full blur-xl animate-float" />
          <div className="absolute bottom-[15%] left-[10%] w-96 h-96 bg-white/[0.03] rounded-full blur-2xl animate-float-slow" />
          <div className="absolute top-[45%] right-[40%] w-40 h-40 bg-white/[0.03] rounded-3xl rotate-45 animate-float" />
          <div className="absolute bottom-[40%] right-[8%] w-24 h-24 bg-white/[0.05] rounded-2xl rotate-12 animate-float-slow" />
          <div className="absolute top-[20%] left-[25%] w-16 h-16 bg-white/[0.04] rounded-xl rotate-[30deg] animate-float-slow" />

          {/* Grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="loginGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#loginGrid)" />
          </svg>

          {/* Gradient circles */}
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.15), transparent 70%)' }} />
          <div className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          {/* Top: Logo */}
          <div>
            <div className="flex items-center gap-3.5 mb-16">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-lg shadow-black/5">
                <Sparkles className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-[22px] font-bold text-white tracking-tight">EventBridge</h1>
                <p className="text-[11px] text-emerald-300/60 font-semibold uppercase tracking-[0.2em]">College Events</p>
              </div>
            </div>

            {/* Hero Text */}
            <div className="max-w-md">
              <h2 className="text-[2.8rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                Your Events,<br />
                <span className="bg-gradient-to-r from-emerald-200 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                  Simplified.
                </span>
              </h2>
              <p className="text-lg text-white/45 leading-relaxed max-w-sm">
                A complete platform to create, manage, and track college events across every department.
              </p>
            </div>
          </div>

          {/* Bottom: Feature cards */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-8 max-w-md">
              {[
                { icon: Calendar, title: 'Smart Events', desc: 'Create & manage' },
                { icon: CheckCircle, title: 'Attendance', desc: 'Real-time tracking' },
                { icon: TrendingUp, title: 'Analytics', desc: 'Deep insights' },
                { icon: Award, title: 'Certificates', desc: 'Auto-generated' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white/[0.06] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.06] hover:bg-white/[0.09] transition-all duration-300">
                  <Icon className="w-5 h-5 text-emerald-300/70 mb-2.5" />
                  <p className="text-sm font-semibold text-white/90">{title}</p>
                  <p className="text-xs text-white/35 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/20">© {new Date().getFullYear()} EventBridge · Built for colleges</p>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL — Full height login form ─── */}
      <div className="w-full lg:w-[48%] flex flex-col bg-white">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-6 border-b border-neutral-100">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-neutral-900">EventBridge</h1>
        </div>

        {/* Form area — centered */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[380px] animate-fade-in">
            {/* Welcome */}
            <div className="mb-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6 text-brand-600" />
              </div>
              <h2 className="text-[1.75rem] font-extrabold text-neutral-900 tracking-tight mb-2">Welcome back</h2>
              <p className="text-neutral-400 text-[15px]">Sign in to your account to continue</p>
            </div>

            {/* Role Selector */}
            <div className="mb-8">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.15em] mb-3">I am a</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'admin', label: 'Admin', icon: Shield, desc: 'Manage events' },
                  { key: 'participant', label: 'Participant', icon: Users, desc: 'Join events' },
                ].map(({ key, label, icon: Icon, desc }) => (
                  <button
                    key={key}
                    onClick={() => setRole(key)}
                    className={`relative flex flex-col items-center gap-1.5 py-5 px-4 rounded-2xl border-2 transition-all duration-200 group ${
                      role === key
                        ? 'border-brand-500 bg-brand-50/60 shadow-sm shadow-brand-500/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                    }`}
                  >
                    {role === key && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      role === key ? 'bg-brand-500 shadow-sm' : 'bg-neutral-100 group-hover:bg-neutral-200'
                    }`}>
                      <Icon className={`w-5 h-5 ${role === key ? 'text-white' : 'text-neutral-400'}`} />
                    </div>
                    <span className={`text-sm font-bold mt-0.5 ${role === key ? 'text-brand-700' : 'text-neutral-600'}`}>
                      {label}
                    </span>
                    <span className={`text-[11px] ${role === key ? 'text-brand-500' : 'text-neutral-400'}`}>
                      {desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-neutral-700 mb-2">Email address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="w-full bg-neutral-50/80 border border-neutral-200 rounded-xl pl-11 pr-4 py-3 text-neutral-800 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all text-[15px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-neutral-700 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-neutral-50/80 border border-neutral-200 rounded-xl pl-11 pr-12 py-3 text-neutral-800 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all text-[15px]"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors">
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-[15px] mt-2"
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  boxShadow: '0 4px 14px rgba(5,150,105,0.25), 0 1px 3px rgba(5,150,105,0.15)'
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In<ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-neutral-100" />
              <span className="text-xs text-neutral-300 font-medium">New here?</span>
              <div className="flex-1 h-px bg-neutral-100" />
            </div>

            <Link to="/register"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-neutral-200 text-neutral-600 font-semibold text-[15px] hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/30 transition-all duration-200">
              Create an Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
