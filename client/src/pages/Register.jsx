import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Users, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'BioTech', 'Other'];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'participant',
    branch: 'CSE'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await register(formData.name, formData.email, formData.password, formData.role, formData.branch);
      toast.success(`Welcome, ${user.name}! Account created.`);
      navigate(user.role === 'admin' ? '/admin' : '/participant');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">EventBridge</h1>
        </div>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Create Account</h2>
            <p className="text-neutral-500">Join EventBridge to start managing events</p>
          </div>

          {/* Role Selector */}
          <div className="flex gap-2 mb-6 p-1.5 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'admin' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                formData.role === 'admin'
                  ? 'bg-white text-brand-700 shadow-sm border border-neutral-200'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'participant' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                formData.role === 'participant'
                  ? 'bg-white text-brand-700 shadow-sm border border-neutral-200'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Users className="w-4 h-4" />
              Participant
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="John Doe" className="input-field pl-12" required />
              </div>
            </div>

            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="you@college.edu" className="input-field pl-12" required />
              </div>
            </div>

            <div>
              <label className="input-label">Branch / Department</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <select name="branch" value={formData.branch} onChange={handleChange}
                  className="input-field pl-12 appearance-none cursor-pointer" required>
                  {BRANCHES.map((b) => (<option key={b} value={b}>{b}</option>))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                    onChange={handleChange} placeholder="••••••••" className="input-field pl-12" required minLength={6} />
                </div>
              </div>
              <div>
                <label className="input-label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleChange} placeholder="••••••••" className="input-field pl-12" required />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="showPwd" checked={showPassword} onChange={() => setShowPassword(!showPassword)}
                className="w-4 h-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500/30" />
              <label htmlFor="showPwd" className="text-sm text-neutral-500 cursor-pointer">Show passwords</label>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
