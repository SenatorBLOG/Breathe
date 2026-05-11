// src/pages/SignUpPage.tsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../components/contexts/AuthContext';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { syncGoalFromProfile } from '../utils/mlDefaults';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { toast } from 'sonner';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';

function SignUpPageInner() {
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [searchParams] = useSearchParams();
  const ref   = searchParams.get('ref');
  const score = searchParams.get('score');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const RESULT_TO_PRESET: Record<string, { inhale: number; hold: number; exhale: number; pause: number; name: string }> = {
    'stress':      { inhale: 4, hold: 7, exhale: 8, pause: 1,  name: '4-7-8 Breathing' },
    'shallow':     { inhale: 4, hold: 0, exhale: 6, pause: 2,  name: 'Belly Breathing' },
    'natural':     { inhale: 5, hold: 0, exhale: 5, pause: 1,  name: 'Coherent Breathing' },
    'stress-calc': { inhale: 4, hold: 4, exhale: 4, pause: 4,  name: 'Box Breathing' },
  };

  const redirectAfterAuth = () => {
    if (ref && RESULT_TO_PRESET[ref]) {
      const preset = RESULT_TO_PRESET[ref];
      navigate('/breathing', { state: { coachPreset: preset, coachPresetName: preset.name } });
    } else {
      const onboarded = localStorage.getItem('breathe_onboarded');
      navigate(onboarded ? '/' : '/onboarding');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await api.post('/auth/google', { access_token: tokenResponse.access_token });
        login(res.data.token, res.data.user);
        localStorage.setItem('userId', res.data.user?._id ?? '');
        toast.success(t('auth.googleSignUpSuccess'));
        api.get('/auth/me').then(r => syncGoalFromProfile(r.data)).catch(() => {});
        redirectAfterAuth();
      } catch (err: any) {
        const msg = err.response?.data?.error || t('auth.googleSignUpFailed');
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error(t('auth.googleSignUpFailed')),
  });

  // Password strength
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ];
  const strengthScore = strength.filter(Boolean).length;
  const strengthLabel = ['', t('auth.strengthWeak'), t('auth.strengthFair'), t('auth.strengthStrong')][strengthScore];
  const strengthColor = ['', '#FF8A8A', '#FFD97D', '#4AE8A0'][strengthScore];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError(t('auth.acceptTermsError')); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user?._id ?? '');
      if (ref)   localStorage.setItem('breathe_quiz_result', ref);
      if (score) localStorage.setItem('breathe_stress_score', score);
      toast.success(t('auth.accountCreated'));
      // New users always go through onboarding first
      navigate('/onboarding');
    } catch (err: any) {
      const msg = err.response?.data?.error || t('auth.failedCreateAccount');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen font-montserrat overflow-x-hidden">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: branding */}
            <div className="hidden lg:flex flex-col gap-10">
              {/* Animated orb cluster */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border transition-all"
                  style={{
                    borderColor: `${ts.accent}15`,
                    animation: 'suPing 3s ease-out infinite',
                  }} />
                <div className="absolute inset-2 rounded-full border transition-all"
                  style={{
                    borderColor: `${ts.accent}20`,
                    animation: 'suPing 3s ease-out 0.6s infinite',
                  }} />
                <div className="absolute inset-4 rounded-full"
                  style={{
                    background: ts.btnGradient,
                    boxShadow: ts.btnShadow,
                  }} />
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="text-4xl xl:text-5xl font-light leading-tight tracking-wide" style={{ color: ts.textPrimary }}>
                  {t('auth.beginYour')}<br />
                  <span style={{ color: ts.accent }}>{t('auth.breathingWord')}</span><br />
                  {t('auth.journeyDot')}
                </h1>
                <p className="t-body leading-relaxed max-w-xs" style={{ color: ts.textDim }}>
                  {t('auth.freeForever')}
                </p>
              </div>

              {/* Feature list */}
              <div className="flex flex-col gap-3">
                {([
                  t('auth.features.guided'),
                  t('auth.features.track'),
                  t('auth.features.sounds'),
                  t('auth.features.community'),
                ] as string[]).map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${ts.accent}12`,
                        border: `1px solid ${ts.accent}25`,
                      }}>
                      <Check size={9} style={{ color: ts.accent }} />
                    </div>
                    <p className="t-body" style={{ color: ts.textDim }}>{f}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="t-caption" style={{ color: ts.textDim }}>
                  {t('auth.alreadyAccount')}{' '}
                  <Link to="/login" className="hover:underline" style={{ color: ts.accent }}>
                    {t('auth.signInArrow')}
                  </Link>
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div className="w-full">
              <div className="relative rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: ts.cardBg,
                  border: `1px solid ${ts.border}`,
                  boxShadow: ts.btnShadow,
                }}>

                <div className="h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/40 to-transparent" />

                <div className="p-7 sm:p-9 flex flex-col gap-6">

                  {/* Quiz/calc result banner */}
                  {ref && (
                    <div className="px-4 py-3 rounded-xl text-center"
                      style={{ background: ts.cardBgHover, border: `1px solid ${ts.borderHover}` }}>
                      <p className="t-caption font-medium" style={{ color: ts.textPrimary }}>
                        {ref === 'stress'      && t('auth.resultStress')}
                        {ref === 'shallow'     && t('auth.resultShallow')}
                        {ref === 'natural'     && t('auth.resultNatural')}
                        {ref === 'stress-calc' && t('auth.resultStressCalc', { score })}
                      </p>
                      <p className="t-label mt-0.5" style={{ color: ts.textMuted }}>
                        {t('auth.createToUnlock')}
                      </p>
                    </div>
                  )}

                  {/* Header */}
                  <div>
                    <h2 className="t-heading font-medium tracking-wide" style={{ color: ts.textPrimary }}>
                      {t('auth.createAccountHeading')}
                    </h2>
                    <p className="t-caption mt-1" style={{ color: ts.textMuted }}>
                      {t("auth.alreadyAccount")}{' '}
                      <Link to="/login" className="hover:underline" style={{ color: ts.accent }}>
                        {t('auth.signIn')}
                      </Link>
                    </p>
                  </div>

                  <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>
                        {t('auth.name')}
                      </label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={t('auth.namePlaceholder')}
                        className="w-full rounded-xl px-4 py-3 t-body placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
                        style={{
                          backgroundColor: ts.cardBg,
                          border: `1px solid ${ts.border}`,
                          color: ts.textSecondary,
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>
                        {t('auth.email')}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder={t('auth.emailPlaceholder')}
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
                      <label className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>
                        {t('auth.password')}
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder={t('auth.passwordHint')}
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

                      {/* Strength bar */}
                      {password.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-1 flex-1">
                            {[0, 1, 2].map(i => (
                              <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-300"
                                style={{ background: i < strengthScore ? strengthColor : ts.border }} />
                            ))}
                          </div>
                          <span className="t-label tabular-nums" style={{ color: strengthColor }}>
                            {strengthLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Terms checkbox */}
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <div
                        onClick={() => setAgreed(v => !v)}
                        className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border flex-shrink-0 transition-all ${
                          agreed ? '' : ''
                        }`}
                        style={{
                          backgroundColor: agreed ? ts.accent : `${ts.cardBg}60`,
                          borderColor: agreed ? ts.accentLight : ts.border,
                        }}
                      >
                        {agreed && <Check size={9} className="text-white" />}
                      </div>
                      <span className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                        {t("auth.termsAgree")}{' '}
                        <Link to="/support" style={{ color: ts.accent }}>{t("auth.terms")}</Link>{' '}
                        {t('auth.and')}{' '}
                        <Link to="/privacy" style={{ color: ts.accent }}>{t("auth.privacy")}</Link>
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
                      disabled={loading || !agreed}
                      className="w-full py-3 rounded-xl t-body font-medium tracking-wide transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 mt-1"
                      style={{ background: ts.btnGradient }}
                    >
                      {loading ? t('auth.creatingAccount') : t("auth.signUp") + ' →'}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ backgroundColor: ts.border }} />
                    <span className="t-label uppercase tracking-widest" style={{ color: ts.textDim }}>
                      {t('auth.orSignUpWith')}
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
                      {t('auth.continueWithGoogle')}
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

export default function SignUpPage() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
      <SignUpPageInner />
    </GoogleOAuthProvider>
  );
}