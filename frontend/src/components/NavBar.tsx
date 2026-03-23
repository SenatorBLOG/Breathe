import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme, THEME_META } from '../contexts/ThemeContext';
import { useThemeStyles } from '../hooks/useThemeStyles';

export default function NavBar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const { theme, toggle: toggleTheme } = useTheme();
  const ts = useThemeStyles();
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
    <Link to={to} onClick={() => setIsMenuOpen(false)}
      className="relative text-sm tracking-wide transition-colors duration-200 group"
      style={{ color: isActive(to) ? ts.accentLight : ts.textSecondary }}>
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px transition-all duration-300"
        style={{
          width: isActive(to) ? '100%' : '0%',
          backgroundColor: ts.accent,
        }} />
    </Link>
  );

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-menu { animation: slideDown 0.2s ease forwards; }
        .nav-link:hover { color: ${ts.textPrimary} !important; }
        .nav-link:hover span { width: 100% !important; }
      `}</style>

      <nav className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled ? `${ts.navBg}` : `${ts.navBg}B0`,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${scrolled ? ts.border : ts.border + '80'}`,
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
        }}>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <a href="/breathing" onClick={onLogoClick} className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-6 h-6 rounded-full flex-shrink-0 transition-shadow duration-300 group-hover:shadow-[0_0_16px_rgba(74,158,255,0.6)]"
              style={{ background: `radial-gradient(circle at 35% 35%, ${ts.accentLight}, ${ts.accent} 70%)`, boxShadow: `0 0 10px ${ts.accent}55` }} />
            <span className="text-base sm:text-lg font-medium tracking-wide transition-colors"
              style={{ color: ts.textPrimary }}>
              Breathe
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/home-page">{t("nav.home")}</NavLink>
            <NavLink to="/breathing">{t("nav.meditate")}</NavLink>
            <NavLink to="/globe">{t("nav.globe", "Globe")}</NavLink>
            <NavLink to="/music-library">{t("nav.sounds")}</NavLink>
            <NavLink to="/community">{t("nav.community")}</NavLink>
            {!isAuthenticated && (
              <>
                <NavLink to="/faq">{t("nav.learn")}</NavLink>
                <NavLink to="/support">{t("nav.support")}</NavLink>
              </>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
            {!isAuthenticated ? (
              <>
                <Link to="/login"
                  className="px-4 py-1.5 text-sm rounded-full transition-all duration-200"
                  style={{ color: ts.accentLight, border: `1px solid ${ts.border}` }}>
                  {t('nav.login')}
                </Link>
                <Link to="/signup"
                  className="px-4 py-1.5 text-sm text-white rounded-full transition-all duration-200 hover:scale-105"
                  style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
                  {t('nav.getStarted')}
                </Link>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  {(user?.avatar || user?.picture)
                    ? <img src={user.avatar || user.picture} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                    : <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-medium flex-shrink-0"
                        style={{ background: ts.btnGradient }}>
                        {user?.email?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                  }
                  <span className="text-xs" style={{ color: ts.textSecondary }}>
                    {user?.name ?? t('nav.profile')}
                  </span>
                </button>
                <button onClick={() => { logout(); navigate('/breathing'); }}
                  className="px-3 py-1.5 text-xs rounded-full transition-all duration-200"
                  style={{ color: '#FF8A8A', border: '1px solid rgba(255,107,107,0.2)' }}>
                  {t('nav.signOut')}
                </button>
              </>
            )}
          </div>

          {/* Theme toggle — desktop only */}
          <button onClick={toggleTheme}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs"
            style={{ color: ts.textMuted, border: `1px solid ${ts.border}` }}
            title={`Switch theme (current: ${THEME_META[theme].label})`}>
            <span className="text-sm">{THEME_META[theme].icon}</span>
            <span className="text-[10px] tracking-wide">{THEME_META[theme].label}</span>
          </button>

          {/* Language switcher — desktop only */}
          <div className="hidden md:flex relative">
            <button onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs"
              style={{ color: ts.textMuted, border: `1px solid ${ts.border}` }}>
              <Globe size={12} />
              <span className="hidden sm:inline uppercase tracking-wide">{i18n.language.slice(0,2)}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 flex flex-col gap-0.5 rounded-xl overflow-hidden z-50"
                style={{ background: ts.cardBg, border: `1px solid ${ts.border}`, minWidth: 130, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { i18n.changeLanguage(l.code); setLangOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left"
                    style={{
                      color: i18n.language.startsWith(l.code) ? ts.accentLight : ts.textMuted,
                      backgroundColor: i18n.language.startsWith(l.code) ? ts.cardBgHover : 'transparent',
                    }}>
                    <span>{l.flag}</span>{l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile burger */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1 transition-colors"
            style={{ color: ts.textMuted }}
            aria-label="Toggle menu">
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="mobile-menu md:hidden backdrop-blur-md"
            style={{ borderTop: `1px solid ${ts.border}`, backgroundColor: ts.navBg }}>
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {[
                { to: '/home-page',    label: t('nav.home') },
                { to: '/breathing',    label: t('nav.meditate') },
                { to: '/globe',        label: `🌍 ${t('nav.globe', 'Globe')}` },
                { to: '/music-library',label: t('nav.sounds') },
                { to: '/community',    label: t('nav.community') },
                ...(!isAuthenticated
                  ? [{ to: '/faq', label: t('nav.learn') }, { to: '/support', label: t('nav.support') }]
                  : []
                ),
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 text-sm transition-colors"
                  style={{
                    color: isActive(to) ? ts.accentLight : ts.textSecondary,
                    borderBottom: `1px solid ${ts.border}40`,
                  }}>
                  {label}
                </Link>
              ))}

              <div className="flex flex-col gap-2 pt-3">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}
                      className="py-2.5 text-center text-sm rounded-xl transition-colors"
                      style={{ color: ts.accentLight, border: `1px solid ${ts.border}` }}>
                      {t('nav.login')}
                    </Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}
                      className="py-2.5 text-center text-sm text-white rounded-xl"
                      style={{ background: ts.btnGradient }}>
                      {t('nav.getStarted')}
                    </Link>
                  </>
                ) : (
                  <>
                    <button onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                      className="py-2.5 text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                      style={{ color: ts.textSecondary, border: `1px solid ${ts.border}` }}>
                      {(user?.avatar || user?.picture)
                        ? <img src={user.avatar || user.picture} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-medium flex-shrink-0"
                            style={{ background: ts.btnGradient }}>
                            {user?.email?.[0]?.toUpperCase() ?? 'U'}
                          </div>
                      }
                      {user?.name ?? t('nav.profile')}
                    </button>
                    <button onClick={() => { logout(); navigate('/breathing'); setIsMenuOpen(false); }}
                      className="py-2.5 text-sm rounded-xl transition-colors"
                      style={{ color: '#FF8A8A', border: '1px solid rgba(255,107,107,0.2)' }}>
                      {t('nav.signOut')}
                    </button>
                  </>
                )}
              </div>

              {/* Theme + language at bottom of mobile drawer */}
              <div className="flex items-center justify-between pt-3 mt-1 border-t"
                style={{ borderColor: ts.border }}>
                <button onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
                  style={{ color: ts.textMuted, border: `1px solid ${ts.border}` }}>
                  <span>{THEME_META[theme].icon}</span>
                  <span className="text-xs">{THEME_META[theme].label}</span>
                </button>
                <div className="flex gap-1">
                  {LANGS.map(l => (
                    <button key={l.code}
                      onClick={() => { i18n.changeLanguage(l.code); }}
                      className="px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                      style={{
                        color: i18n.language.startsWith(l.code) ? ts.accentLight : ts.textMuted,
                        background: i18n.language.startsWith(l.code) ? ts.cardBgHover : 'transparent',
                        border: `1px solid ${i18n.language.startsWith(l.code) ? ts.borderHover : ts.border}`,
                      }}>
                      {l.flag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}