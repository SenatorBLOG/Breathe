// src/pages/SignUpPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../api';
import { toast } from 'sonner';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [agreed,     setAgreed]     = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  // Password strength
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ];
  const strengthScore = strength.filter(Boolean).length;
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strengthScore];
  const strengthColor = ['', '#FF8A8A', '#FFD97D', '#4AE8A0'][strengthScore];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError('Please accept the terms to continue'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user?._id ?? '');
      toast.success('Account created! Welcome to Breathe 🌊');
      navigate('/home-page');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create account';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential?: string) => {
    if (!credential) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { credential });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user?._id ?? '');
      toast.success('Signed up with Google! Welcome to Breathe');
      navigate('/home-page');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Google sign up failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#010814] font-montserrat overflow-x-hidden">
      <style>{`
        @keyframes suFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes suPing {
          0%   { transform: scale(1); opacity: 0.5; }
          80%,100% { transform: scale(1.7); opacity: 0; }
        }
        .sfu  { animation: suFadeUp 0.7s ease forwards; }
        .sfu1 { animation-delay: 0.1s;  opacity: 0; }
        .sfu2 { animation-delay: 0.22s; opacity: 0; }
        .sfu3 { animation-delay: 0.34s; opacity: 0; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/Background_img_Meditation.jpg')`, opacity: 0.4 }} />
      <div className="fixed inset-0"
        style={{ background: 'radial-gradient(ellipse at 40% 0%, rgba(26,95,204,0.12) 0%, rgba(1,8,20,0.95) 65%)' }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left: branding ── */}
            <div className="hidden lg:flex flex-col gap-10">

              {/* Animated orb cluster */}
              <div className="sfu sfu1 relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border border-[#4A9EFF]/15"
                  style={{ animation: 'suPing 3s ease-out infinite' }} />
                <div className="absolute inset-2 rounded-full border border-[#4A9EFF]/20"
                  style={{ animation: 'suPing 3s ease-out 0.6s infinite' }} />
                <div className="absolute inset-4 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #7AC4FF, #1A5FCC 65%, #0A1A3F)',
                    boxShadow: '0 0 40px rgba(74,158,255,0.4)',
                  }} />
              </div>

              <div className="sfu sfu2 flex flex-col gap-3">
                <h1 className="text-4xl xl:text-5xl font-light text-[#B8D9FF] leading-tight tracking-wide">
                  Begin your<br />
                  <span className="text-[#4A9EFF]">breathing</span><br />
                  journey.
                </h1>
                <p className="text-[#3D6080] text-sm leading-relaxed max-w-xs">
                  Free forever. No credit card. Just you, your breath, and a path to calm.
                </p>
              </div>

              {/* Feature list */}
              <div className="sfu sfu3 flex flex-col gap-3">
                {[
                  'Guided breathing sessions',
                  'Track mood & progress over time',
                  'Sleep sounds & ambient music',
                  'Community of meditators',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(74,232,160,0.12)', border: '1px solid rgba(74,232,160,0.25)' }}>
                      <Check size={9} className="text-[#4AE8A0]" />
                    </div>
                    <p className="text-[#3D6080] text-sm">{f}</p>
                  </div>
                ))}
              </div>

              <div className="sfu sfu3">
                <p className="text-[#3D6080] text-xs">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#4A9EFF] hover:underline">Sign in →</Link>
                </p>
              </div>
            </div>

            {/* ── Right: form ── */}
            <div className="sfu sfu2 w-full">
              <div className="relative rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, rgba(11,22,40,0.92) 0%, rgba(6,12,26,0.96) 100%)',
                  border: '1px solid rgba(30,51,88,0.6)',
                  boxShadow: '0 0 80px rgba(74,158,255,0.06), 0 24px 60px rgba(0,0,0,0.5)',
                }}>

                <div className="h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/40 to-transparent" />

                <div className="p-7 sm:p-9 flex flex-col gap-6">

                  {/* Header */}
                  <div>
                    <h2 className="text-xl font-medium text-[#B8D9FF] tracking-wide">Create account</h2>
                    <p className="text-[#4A7AAA] text-xs mt-1">
                      {t("auth.alreadyAccount")}{' '}
                      <Link to="/login" className="text-[#4A9EFF] hover:underline">Sign in</Link>
                    </p>
                  </div>

                  <form onSubmit={handleSignUp} className="flex flex-col gap-4">

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-[#4A7AAA]">Your name</label>
                      <input
                        value={name} onChange={e => setName(e.target.value)}
                        placeholder="Alex"
                        className="w-full bg-[#060C1A]/70 border border-[#1E3358]/50 rounded-xl px-4 py-3 text-sm text-[#7AC4FF] placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-[#4A7AAA]">Email address</label>
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="you@example.com"
                        className="w-full bg-[#060C1A]/70 border border-[#1E3358]/50 rounded-xl px-4 py-3 text-sm text-[#7AC4FF] placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
                      />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-[#4A7AAA]">Password</label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'} value={password}
                          onChange={e => setPassword(e.target.value)} required minLength={6}
                          placeholder="Min. 6 characters"
                          className="w-full bg-[#060C1A]/70 border border-[#1E3358]/50 rounded-xl px-4 py-3 pr-10 text-sm text-[#7AC4FF] placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
                        />
                        <button type="button" onClick={() => setShowPass(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A7AAA] hover:text-[#4A9EFF] transition-colors">
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {/* Strength bar */}
                      {password.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-1 flex-1">
                            {[0, 1, 2].map(i => (
                              <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-300"
                                style={{ background: i < strengthScore ? strengthColor : 'rgba(30,51,88,0.4)' }} />
                            ))}
                          </div>
                          <span className="text-[9px] tabular-nums" style={{ color: strengthColor }}>
                            {strengthLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Terms checkbox */}
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <div onClick={() => setAgreed(v => !v)}
                        className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border flex-shrink-0 transition-all ${
                          agreed ? 'bg-[#1A5FCC] border-[#3A82F7]' : 'border-[#1E3358]/60 bg-[#060C1A]/60'
                        }`}>
                        {agreed && <Check size={9} className="text-white" />}
                      </div>
                      <span className="text-[#4A7AAA] text-xs leading-relaxed">
                        {t("auth.termsAgree")}{' '}
                        <span className="text-[#4A9EFF]">{t("auth.terms")}</span>{' '}
                        and{' '}
                        <span className="text-[#4A9EFF]">{t("auth.privacy")}</span>
                      </span>
                    </label>

                    {/* Error */}
                    {error && (
                      <div className="px-4 py-3 rounded-xl bg-[#FF8A8A]/10 border border-[#FF8A8A]/25 text-[#FF8A8A] text-xs text-center">
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button type="submit" disabled={loading || !agreed}
                      className="w-full py-3 rounded-xl text-sm text-white font-medium tracking-wide transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 mt-1"
                      style={{ background: 'linear-gradient(135deg, #1A5FCC 0%, #3A82F7 50%, #2266D4 100%)' }}>
                      {loading ? 'Creating account…' : '{t("auth.signUp")} →'}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#1E3358]/40" />
                    <span className="text-[9px] uppercase tracking-widest text-[#3D6080]">or sign up with</span>
                    <div className="flex-1 h-px bg-[#1E3358]/40" />
                  </div>

                  {/* Google */}
                  <div className="flex justify-center">
                    <div className="opacity-80 hover:opacity-100 transition-opacity">
                      <GoogleLogin
                        onSuccess={cr => handleGoogle(cr.credential)}
                        onError={() => toast.error('Google sign up failed')}
                        useOneTap={false}
                        theme="filled_black"
                        text="signup_with"
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