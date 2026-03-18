// src/pages/LoginPage.tsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { toast } from 'sonner';
import { AuthContext } from '../components/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';

export default function LoginPage() {
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      localStorage.setItem('userId', res.data.user?._id ?? '');
      toast.success('{t("auth.welcomeBack")}', { description: '{t("auth.sessionsWaiting")}' });
      navigate('/home-page');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { credential });
      login(res.data.token, res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user?._id ?? '');
      toast.success('Welcome to Breathe');
      navigate('/home-page');
    } catch {
      toast.error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen  font-montserrat overflow-x-hidden">
      <ThemeBackground />
      <style>{`
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbPulse {
          0%,100% { transform: scale(1);    box-shadow: 0 0 60px rgba(74,158,255,0.35); }
          50%      { transform: scale(1.08); box-shadow: 0 0 90px rgba(74,158,255,0.55); }
        }
        .lfu  { animation: loginFadeUp 0.7s ease forwards; }
        .lfu1 { animation-delay: 0.1s; opacity: 0; }
        .lfu2 { animation-delay: 0.22s; opacity: 0; }
        .lfu3 { animation-delay: 0.34s; opacity: 0; }
        .lfu4 { animation-delay: 0.46s; opacity: 0; }
      `}</style>

      {/* Background */}
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left: branding ── */}
            <div className="hidden lg:flex flex-col gap-10">
              {/* Orb */}
              <div className="lfu lfu1 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex-shrink-0"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #7AC4FF, #1A5FCC 65%, #0A1A3F)',
                    animation: 'orbPulse 4s ease-in-out infinite',
                  }} />
                <div>
                  <p className="text-[#B8D9FF] text-xl font-light tracking-wide">Breathe</p>
                  <p className="text-[#4A7AAA] text-xs tracking-[0.2em] uppercase mt-0.5">Mindful breathing app</p>
                </div>
              </div>

              <div className="lfu lfu2 flex flex-col gap-3">
                <h1 className="text-4xl xl:text-5xl font-light text-[#B8D9FF] leading-tight tracking-wide">
                  Welcome back.<br />
                  <span className="text-[#4A9EFF]">Your sessions</span><br />
                  are waiting.
                </h1>
              </div>

              {/* Stats */}
              <div className="lfu lfu3 flex flex-col gap-3">
                {[
                  { icon: '🔥', text: 'Your streak is still alive' },
                  { icon: '📊', text: 'Progress saved from last time' },
                  { icon: '🌊', text: 'Community posts to catch up on' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <span className="text-base">{icon}</span>
                    <p className="text-[#3D6080] text-sm">{text}</p>
                  </div>
                ))}
              </div>

              <div className="lfu lfu4">
                <p className="text-[#3D6080] text-xs">
                  No account?{' '}
                  <Link to="/signup" className="text-[#4A9EFF] hover:underline">Create one free →</Link>
                </p>
              </div>
            </div>

            {/* ── Right: form ── */}
            <div className="lfu lfu2 w-full">
              <div className="relative rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, rgba(11,22,40,0.92) 0%, rgba(6,12,26,0.96) 100%)',
                  border: '1px solid rgba(30,51,88,0.6)',
                  boxShadow: '0 0 80px rgba(74,158,255,0.06), 0 24px 60px rgba(0,0,0,0.5)',
                }}>

                {/* Top glow line */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/40 to-transparent" />

                <div className="p-7 sm:p-9 flex flex-col gap-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-xl font-medium text-[#B8D9FF] tracking-wide">Sign in</h2>
                    <p className="text-[#4A7AAA] text-xs mt-1">
                      {t("auth.noAccount")}{' '}
                      <Link to="/signup" className="text-[#4A9EFF] hover:underline">{t("auth.signUp")}</Link>
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-[#4A7AAA]">Email</label>
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="you@example.com"
                        className="w-full bg-[#060C1A]/70 border border-[#1E3358]/50 rounded-xl px-4 py-3 text-sm text-[#7AC4FF] placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
                      />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-widest text-[#4A7AAA]">Password</label>
                        <Link to="/forgot-password" className="text-[9px] text-[#2A5499] hover:text-[#4A9EFF] transition-colors">
                          {t("auth.forgotPassword")}
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'} value={password}
                          onChange={e => setPassword(e.target.value)} required
                          placeholder="••••••••"
                          className="w-full bg-[#060C1A]/70 border border-[#1E3358]/50 rounded-xl px-4 py-3 pr-10 text-sm text-[#7AC4FF] placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
                        />
                        <button type="button" onClick={() => setShowPass(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A7AAA] hover:text-[#4A9EFF] transition-colors">
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me */}
                    <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                      <div onClick={() => setRememberMe(v => !v)}
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          rememberMe ? 'bg-[#1A5FCC] border-[#3A82F7]' : 'border-[#1E3358]/60 bg-[#060C1A]/60'
                        }`}>
                        {rememberMe && <div className="w-2 h-2 rounded-sm bg-white" />}
                      </div>
                      <span className="text-[#4A7AAA] text-xs">Remember me</span>
                    </label>

                    {/* Error */}
                    {error && (
                      <div className="px-4 py-3 rounded-xl bg-[#FF8A8A]/10 border border-[#FF8A8A]/25 text-[#FF8A8A] text-xs text-center">
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                      className="w-full py-3 rounded-xl text-sm text-white font-medium tracking-wide transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 mt-1"
                      style={{ background: ts.btnGradient }}>
                      {loading ? 'Signing in…' : '{t("auth.signIn")} →'}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#1E3358]/40" />
                    <span className="text-[9px] uppercase tracking-widest text-[#3D6080]">or continue with</span>
                    <div className="flex-1 h-px bg-[#1E3358]/40" />
                  </div>

                  {/* Google */}
                  <div className="flex justify-center">
                    <div className="opacity-80 hover:opacity-100 transition-opacity">
                      <GoogleLogin
                        onSuccess={cr => { if (cr.credential) handleGoogle(cr.credential); }}
                        onError={() => toast.error('Google login failed')}
                        useOneTap={false}
                        theme="filled_black"
                        text="signin_with"
                        shape="pill"
                        size="medium"
                      />
                    </div>
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