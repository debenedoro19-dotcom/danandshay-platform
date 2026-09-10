import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-16 px-4 bg-cream">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-amber-200 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            👑
          </div>
          <h2 className="text-2xl font-bold font-display text-charcoal mb-2">Admin Privileges Required</h2>
          <p className="text-gray-600 text-sm mb-3">
            You are signed in as <strong className="text-charcoal font-mono">{user.email}</strong> with role <span className="px-2 py-0.5 rounded bg-gray-100 font-mono text-xs font-bold text-gray-700">{user.role}</span>.
          </p>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            The Admin Dashboard is restricted to administrator accounts. Please sign in with an administrator account to continue.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              state={{ from: location }}
              className="block w-full py-2.5 px-4 bg-gradient-to-r from-gold to-gold-dark text-cream font-bold text-sm rounded-lg hover:shadow-md transition-all text-center"
            >
              Sign In as Administrator
            </Link>
            <a
              href="/"
              className="block w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-charcoal font-semibold text-sm rounded-lg transition-colors text-center"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
