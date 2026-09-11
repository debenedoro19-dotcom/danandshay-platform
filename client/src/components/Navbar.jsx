import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Meet & Greet', path: '/meet-and-greet' },
    { name: 'Fan Cards', path: '/fan-cards' },
  ];

  return (
    <nav className="fixed w-full h-16 z-50 bg-cream/90 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="font-display text-gold text-2xl font-bold tracking-wider">
              DAN + SHAY
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `font-body text-sm font-medium transition-colors hover:text-gold ${
                    isActive ? 'text-gold border-b-2 border-gold' : 'text-charcoal'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right: Desktop Auth/User */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm font-medium text-charcoal">Hi, {user.name}</span>
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-all shadow-sm"
                  >
                    <span>👑</span>
                    <span>Admin</span>
                  </Link>
                )}
                <Link to="/my-tickets" className="text-sm font-semibold text-charcoal hover:text-gold transition-colors flex items-center gap-1">
                  <span>🎟️</span>
                  <span>My Tickets & Passes</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium bg-midnight text-cream px-4 py-2 rounded hover:bg-charcoal transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-charcoal hover:text-gold transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-gold text-cream px-4 py-2 rounded hover:bg-gold-dark transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-charcoal hover:text-gold focus:outline-none p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cream border-t border-blush shadow-lg absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive ? 'text-gold bg-blush' : 'text-charcoal hover:text-gold hover:bg-blush'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-bold text-amber-900 bg-amber-100/80 border border-amber-300 hover:bg-amber-200"
                  >
                    <span>👑</span>
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  to="/my-tickets"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold text-charcoal hover:bg-blush hover:text-gold"
                >
                  <span>🎟️</span>
                  <span>My Tickets & Passes (Dashboard)</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-charcoal hover:bg-blush hover:text-gold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-charcoal hover:bg-blush hover:text-gold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gold hover:bg-blush"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
