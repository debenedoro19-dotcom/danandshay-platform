import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isFromAdmin = location.state?.from?.pathname?.startsWith('/admin');

  const handleSubmit = async (e, overrideEmail, overridePassword) => {
    if (e) e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const loginEmail = overrideEmail || email;
    const loginPassword = overridePassword || password;

    const result = await login(loginEmail, loginPassword);
    
    if (result.success) {
      const targetFrom = location.state?.from?.pathname;
      if (result.user?.role === 'admin') {
        if (targetFrom && targetFrom !== '/login') {
          navigate(targetFrom, { replace: true });
        } else {
          navigate('/admin', { replace: true });
        }
      } else {
        if (targetFrom && !targetFrom.startsWith('/admin') && targetFrom !== '/login') {
          navigate(targetFrom, { replace: true });
        } else {
          navigate('/events', { replace: true });
        }
      }
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-lg border border-blush">
        <div>
          <h2 className="text-center text-3xl font-display font-extrabold text-charcoal">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-charcoal/70 font-body">
            Sign in to access your tickets, VIP bookings, and dashboard
          </p>
        </div>

        {isFromAdmin && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg text-xs font-medium flex items-start gap-2.5 shadow-sm">
            <span className="text-base leading-none">👑</span>
            <div>
              <span className="font-bold">Administrator Access Required</span>
              <p className="mt-0.5 text-amber-800">Please sign in with an administrator account to access the Admin Dashboard.</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm font-body">
            {error}
          </div>
        )}

        {/* Quick Demo Fill Buttons */}
        <div className="pt-1 pb-1">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
            ⚡ Quick Demo Accounts
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@danandshay.com', 'admin123')}
              className="p-2.5 rounded-lg border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1">
                  👑 Admin
                </span>
                <span className="text-[10px] text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">Autofill</span>
              </div>
              <div className="text-[11px] text-gray-600 font-mono mt-1 truncate">admin@danandshay.com</div>
              <div className="text-[10px] text-gray-400 font-mono">Password: admin123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('fan@example.com', 'fan123')}
              className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1">
                  🎸 Fan Club
                </span>
                <span className="text-[10px] text-blue-800 bg-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">Autofill</span>
              </div>
              <div className="text-[11px] text-gray-600 font-mono mt-1 truncate">fan@example.com</div>
              <div className="text-[10px] text-gray-400 font-mono">Password: fan123</div>
            </button>
          </div>
        </div>

        <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-charcoal rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm font-body"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal" htmlFor="password">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-400 text-charcoal rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm font-body"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-500 hover:text-charcoal cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-cream bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="text-center pt-2">
          <p className="text-sm font-body text-charcoal/80">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-gold hover:text-gold-dark underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
