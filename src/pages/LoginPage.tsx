import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import api from '../api';
import { toast } from 'sonner';
import { AuthContext } from '../components/contexts/AuthContext';
import Footer from '../components/Footer';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success('Welcome back to Breathe', {
description: 'You have entered your world of peace'
      });
      navigate('/home-page');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background — space + blue */}
      
      {/* Stars (animation) */}
      <div className="absolute inset-0">
{[...Array(80)].map((_, i) => (
<div
            key={i}
            className="absolute animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            <div className={`w-${i % 3 === 0 ? 1 : 0.5} h-${i % 3 === 0 ? 1 : 0.5} bg-[#70B8FF] rounded-full ${i % 5 === 0 ? 'opacity-100' : 'opacity-60'}`} />
          </div>
        ))}
      </div>

      <NavBar />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* The left part is magic */}
<div className="space-y-10">
<div>
                <h1 className="text-5xl md:text-7xl font-extralight leading-tight">
                  <span className="text-[#70B8FF]">Welcome back</span>
                  <br />
                  <span className="text-[#AEE6FF] font-bold">to Breathe</span>
                </h1>
                <p className="text-2xl text-[#88AACC] mt-6 font-light">
                  Continue your journey to inner peace.
                </p>
              </div>
              
              <div className="text-[#88AACC] space-y-3">
                <p className="text-lg">Your sessions are waiting for you</p>
                <p className="text-lg">Your progress is saved</p>
                <p className="text-lg">You're already halfway to nirvana</p>
              </div>
            </div>

            {/* The right part is a shape */}
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl ring-1 ring-white/20">
              <form onSubmit={handleLogin} className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-[#70B8FF]">Log in to your account</h2>
</div>

                {/* Email */}
                <div>
                  <label className="block text-[#70B8FF] text-lg font-medium mb-3">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-[#AEE6FF] text-lg placeholder-[#88AACC]/60 focus:outline-none focus:border-[#70B8FF] focus:ring-4 focus:ring-[#70B8FF]/30 transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[#70B8FF] text-lg font-medium mb-3">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-[#AEE6FF] text-lg placeholder-[#88AACC]/60 focus:outline-none focus:border-[#70B8FF] focus:ring-4 focus:ring-[#70B8FF]/30 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {/* Remember + Forgot */}
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 rounded border-white/30 bg-white/10 checked:bg-[#70B8FF] focus:ring-2 focus:ring-[#70B8FF]/50"
                    />
                    <span className="text-[#AEE6FF]">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-[#70B8FF] hover:underline text-sm">
                    Forgot your password?
                  </Link>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-center backdrop-blur-sm">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-5 bg-gradient-to-r from-[#3A82F7] via-[#549BF6] to-[#70B8FF] rounded-2xl font-bold text-white text-lg hover:shadow-2xl hover:shadow-[#70B8FF]/40 transform hover:scale-105 transition-all disabled:opacity-70 disabled:transform-none"
                  >
                    {loading ? 'Entering...' : 'Enter'}
                  </button>
                  <Link
                    to="/signup"
                    className="flex-1 py-5 border-2 border-[#70B8FF] rounded-2xl font-bold text-[#70B8FF] text-lg hover:bg-[#70B8FF]/10 hover:text-[#AEE6FF] transition-all text-center"
                  >
Registration
                  </Link>
                </div>

                {/* Social Networks */}
<div className="text-center pt-6 border-t border-white/10">
<p className="text-[#88AACC] mb-6">Or log in via </p>
                  <div className="flex justify-center gap-10">
                    {['Facebook', 'Google', 'Apple'].map((social) => (
                      <button
                        key={social}
                        className="text-[#70B8FF] font-bold text-lg hover:text-[#AEE6FF] hover:scale-110 transition-all"
                      >
                        {social}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}