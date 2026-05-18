import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../config/api.config';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const navLinks = [
    { to: '/game/setup', label: 'Play', icon: '🎮' },
    { to: '/arena', label: 'Arena', icon: '🏟️' },
    { to: '/history', label: 'History', icon: '📋' },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin/players', label: 'Admin', icon: '⚙️' }] : []),
  ];

  const avatarSrc = getAvatarUrl(user?.avatar);

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-violet-500/30">
              T
            </div>
            <span className="font-black text-lg tracking-tight">
              <span className="text-violet-400">Tic</span>
              <span className="text-cyan-400">Tac</span>
              <span className="text-white">Toang</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5
                    ${isActive(link.to)
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <span>{link.icon}</span> {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* User section */}
          {user ? (
            <div className="flex items-center gap-3">
              {user.isPremium && (
                <span className="hidden sm:inline-flex badge-premium text-xs">
                  ⭐ Premium
                </span>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-1.5 transition-all duration-150"
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="w-7 h-7 rounded-full object-cover ring-2 ring-violet-500/50" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-slate-300 font-medium hidden sm:block">{user.username}</span>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 card py-1 z-20 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-slate-700">
                        <p className="text-white font-semibold text-sm">{user.username}</p>
                        <p className="text-slate-500 text-xs truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Profile
                      </Link>
                      {/* Mobile nav links */}
                      <div className="md:hidden border-t border-slate-700 mt-1 pt-1">
                        {navLinks.map(link => (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            <span>{link.icon}</span> {link.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-slate-700 mt-1">
                        <button
                          onClick={() => { setMenuOpen(false); handleLogout(); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
