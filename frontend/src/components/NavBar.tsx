import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NavBar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const LANGS = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/breathing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      onClick={() => setIsMenuOpen(false)}
      className={`relative text-sm tracking-wide transition-colors duration-200 group ${
        isActive(to) ? 'text-[#7AC4FF]' : 'text-[#5A8FB8] hover:text-[#B8D9FF]'
      }`}
    >
      {children}
      <span className={`absolute -bottom-0.5 left-0 h-px bg-[#4A9EFF]/60 transition-all duration-300 ${
        isActive(to) ? 'w-full' : 'w-0 group-hover:w-full'
      }`} />
    </Link>
  );

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mobile-menu { animation: slideDown 0.2s ease forwards; }
      `}</style>

      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#060C1A]/95 backdrop-blur-md border-b border-[#1E3358]/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'bg-[#060C1A]/70 backdrop-blur-sm border-b border-[#1E3358]/30'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <a
            href="/breathing"
            onClick={onLogoClick}
            className="flex items-center gap-2 flex-shrink-0 group"
          >
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 transition-shadow duration-300 group-hover:shadow-[0_0_16px_rgba(74,158,255,0.6)]"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #7AC4FF, #1A5FCC 70%)',
                boxShadow: '0 0 10px rgba(74,158,255,0.35)',
              }}
            />
            <span className="text-[#BCDDFF] text-base sm:text-lg font-medium tracking-wide group-hover:text-white transition-colors">
              Breathe
            </span>
          </a>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/home-page">Home</NavLink>
            <NavLink to="/breathing">Meditate</NavLink>
            <NavLink to="/music-library">Sounds</NavLink>
            <NavLink to="/community">Community</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/sessions">Sessions</NavLink>
                <NavLink to="/statistics">Progress</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/faq">Learn</NavLink>
                <NavLink to="/support">Support</NavLink>
              </>
            )}
          </div>

          {/* ── Desktop Auth ── */}
          <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm text-[#7AC4FF] border border-[#2A5499]/60 rounded-full hover:border-[#4A9EFF]/80 hover:text-white transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 text-sm text-white rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(58,130,247,0.4)]"
                  style={{ background: 'linear-gradient(135deg, #1A5FCC, #3A82F7)' }}
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D1B33] border border-[#1E3358]/60 hover:border-[#2A5499] transition-all duration-200 group"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#4A9EFF] to-[#1A5FCC] flex items-center justify-center text-[9px] text-white font-medium flex-shrink-0">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-[#7AC4FF] text-xs group-hover:text-white transition-colors">
                    {user?.name ?? 'Profile'}
                  </span>
                </button>
                <button
                  onClick={() => { logout(); navigate('/breathing'); }}
                  className="px-3 py-1.5 text-xs text-[#FF8A8A] border border-[#FF6B6B]/20 rounded-full hover:border-[#FF6B6B]/50 hover:text-[#FFB8B8] transition-all duration-200"
                >
                  Sign out
                </button>
              </>
            )}
          </div>

          {/* ── Language switcher ── */}
          <div className="relative">
            <button onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[#4A7AAA] hover:text-[#7AC4FF] transition-colors text-xs border border-[#1E3358]/40 hover:border-[#2A5499]/50">
              <Globe size={12} />
              <span className="hidden sm:inline uppercase tracking-wide">{i18n.language.slice(0,2)}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 flex flex-col gap-0.5 rounded-xl overflow-hidden z-50"
                style={{ background: 'rgba(9,17,34,0.97)', border: '1px solid rgba(30,51,88,0.6)', minWidth: 130, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { i18n.changeLanguage(l.code); setLangOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left ${
                      i18n.language.startsWith(l.code) ? 'text-[#7AC4FF] bg-[#0D1B33]' : 'text-[#4A7AAA] hover:text-[#B8D9FF] hover:bg-[#0A1525]'
                    }`}>
                    <span>{l.flag}</span>{l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Mobile burger ── */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-[#5A8FB8] hover:text-white transition-colors p-1"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {isMenuOpen && (
          <div className="mobile-menu md:hidden border-t border-[#1E3358]/40 bg-[#060C1A]/98 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {/* Nav links */}
              {[
                { to: '/home-page', label: 'Home' },
                { to: '/breathing', label: 'Meditate' },
                { to: '/music-library', label: 'Sounds' },
                { to: '/community', label: 'Community' },
                ...(isAuthenticated
                  ? [{ to: '/sessions', label: 'Sessions' }, { to: '/statistics', label: 'Progress' }]
                  : [{ to: '/faq', label: 'Learn' }, { to: '/support', label: 'Support' }]
                ),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`py-2.5 text-sm border-b border-[#1E3358]/20 transition-colors ${
                    isActive(to) ? 'text-[#7AC4FF]' : 'text-[#5A8FB8] hover:text-[#B8D9FF]'
                  }`}
                >
                  {label}
                </Link>
              ))}

              {/* Auth */}
              <div className="flex flex-col gap-2 pt-3">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-2.5 text-center text-sm text-[#7AC4FF] border border-[#2A5499]/50 rounded-xl hover:border-[#4A9EFF]/70 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-2.5 text-center text-sm text-white rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #1A5FCC, #3A82F7)' }}
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                      className="py-2.5 text-sm text-[#7AC4FF] border border-[#1E3358]/50 rounded-xl hover:border-[#2A5499] transition-colors"
                    >
                      {user?.name ?? 'Profile'}
                    </button>
                    <button
                      onClick={() => { logout(); navigate('/breathing'); setIsMenuOpen(false); }}
                      className="py-2.5 text-sm text-[#FF8A8A] border border-[#FF6B6B]/20 rounded-xl hover:border-[#FF6B6B]/40 transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}