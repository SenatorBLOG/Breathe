// src/pages/LoginPage.tsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { toast } from 'sonner';
import { AuthContext } from '../components/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { syncGoalFromProfile } from '../utils/mlDefaults';

function LoginPageInner() {
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const RESULT_TO_PRESET: Record<string, { inhale: number; hold: number; exhale: number; pause: number; name: string }> = {
    'stress':      { inhale: 4, hold: 7, exhale: 8, pause: 1, name: '4-7-8 Breathing' },
    'shallow':     { inhale: 4, hold: 0, exhale: 6, pause: 2, name: 'Belly Breathing' },
    'natural':     { inhale: 5, hold: 0, exhale: 5, pause: 1, name: 'Coherent Breathing' },
    'stress-calc': { inhale: 4, hold: 4, exhale: 4, pause: 4, name: 'Box Breathing' },
  };

  const redirectAfterAuth = () => {
    if (ref && RESULT_TO_PRESET[ref]) {
      const preset = RESULT_TO_PRESET[ref];
      navigate('/breathing', { state: { coachPreset: preset, coachPresetName: preset.name } });
    } else {
      navigate('/');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await api.post('/auth/google', { access_token: tokenResponse.access_token });
        login(res.data.token, res.data.user);
        localStorage.setItem('userId', res.data.user?._id ?? '');
        toast.success('Welcome to Breathe');
        api.get('/auth/me').then(r => syncGoalFromProfile(r.data)).catch(() => {});
        redirectAfterAuth();
      } catch {
        toast.error('Google login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google login failed'),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      localStorage.setItem('userId', res.data.user?._id ?? '');
      toast.success(t("auth.welcomeBack"), { description: t("auth.sessionsWaiting") });
      // Sync server-side goal into local ML defaults (fire-and-forget)
      api.get('/auth/me').then(r => syncGoalFromProfile(r.data)).catch(() => {});
      redirectAfterAuth();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen font-montserrat overflow-x-hidden">
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: branding */}
            <div className="hidden lg:flex flex-col gap-10">
              {/* Orb */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex-shrink-0"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #7AC4FF, #1A5FCC 65%, #0A1A3F)',
                    animation: 'orbPulse 4s ease-in-out infinite',
                  }} />
                <div>
                  <p className="t-heading font-light tracking-wide" style={{ color: ts.textPrimary }}>Breathe</p>
                  <p className="t-caption tracking-[0.2em] uppercase mt-0.5" style={{ color: ts.textMuted }}>
                    Mindful breathing app
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="text-4xl xl:text-5xl font-light leading-tight tracking-wide" style={{ color: ts.textPrimary }}>
                  Welcome back.<br />
                  <span style={{ color: ts.accent }}>Your sessions</span><br />
                  are waiting.
                </h1>
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-3">
                {[
                  { icon: '🔥', text: 'Your streak is still alive' },
                  { icon: '📊', text: 'Progress saved from last time' },
                  { icon: '🌊', text: 'Community posts to catch up on' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <span className="t-body">{icon}</span>
                    <p className="t-body" style={{ color: ts.textMuted }}>{text}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="t-caption" style={{ color: ts.textMuted }}>
                  No account?{' '}
                  <Link to="/signup" className="hover:underline" style={{ color: ts.accent }}>
                    Create one free →
                  </Link>
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div className="w-full">
              <div className="relative rounded-3xl overflow-hidden"
                style={{
                  background: ts.cardBg,
                  border: `1px solid ${ts.border}`,
                  boxShadow: ts.btnShadow,
                }}>

                {/* Top glow line */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/40 to-transparent" />

                <div className="p-7 sm:p-9 flex flex-col gap-6">
                  {/* Header */}
                  <div>
                    <h2 className="t-heading font-medium tracking-wide" style={{ color: ts.textPrimary }}>
                      Sign in
                    </h2>
                    <p className="t-caption mt-1" style={{ color: ts.textMuted }}>
                      {t("auth.noAccount")}{' '}
                      <Link to="/signup" className="hover:underline" style={{ color: ts.accent }}>
                        {t("auth.signUp")}
                      </Link>
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-xl px-4 py-3 t-body placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
                        style={{
                          backgroundColor: ts.cardBg,
                          border: `1px solid ${ts.border}`,
                          color: ts.textSecondary,
                        }}
                      />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>
                          Password
                        </label>
                        <Link to="/forgot-password" className="t-label transition-colors" style={{ color: ts.accent }}>
                          {t("auth.forgotPassword")}
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full rounded-xl px-4 py-3 pr-10 t-body placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
                          style={{
                            backgroundColor: ts.cardBg,
                            border: `1px solid ${ts.border}`,
                            color: ts.textSecondary,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: ts.textMuted }}
                        >
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me */}
                    <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                      <div
                        onClick={() => setRememberMe(v => !v)}
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          rememberMe ? '' : ''
                        }`}
                        style={{
                          backgroundColor: rememberMe ? ts.accent : `${ts.cardBg}60`,
                          borderColor: rememberMe ? ts.accentLight : ts.border,
                        }}
                      >
                        {rememberMe && <div className="w-2 h-2 rounded-sm bg-white" />}
                      </div>
                      <span className="t-caption" style={{ color: ts.textMuted }}>
                        Remember me
                      </span>
                    </label>

                    {/* Error */}
                    {error && (
                      <div className="px-4 py-3 rounded-xl t-caption text-center"
                        style={{
                          backgroundColor: 'rgba(255,138,138,0.1)',
                          border: '1px solid rgba(255,138,138,0.25)',
                          color: '#FF8A8A',
                        }}>
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl t-body font-medium tracking-wide transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 mt-1"
                      style={{ background: ts.btnGradient }}
                    >
                      {loading ? 'Signing in…' : t("auth.signIn") + ' →'}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ backgroundColor: ts.border }} />
                    <span className="t-label uppercase tracking-widest" style={{ color: ts.textDim }}>
                      or continue with
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: ts.border }} />
                  </div>

                  {/* Google */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => googleLogin()}
                      className="flex items-center justify-center gap-3 w-full py-3 px-5 rounded-xl border t-body transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ backgroundColor: ts.cardBg, borderColor: ts.border, color: ts.textSecondary }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
      <LoginPageInner />
    </GoogleOAuthProvider>
  );
}