import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import NavBar from '../components/NavBar';
import api from '../api';
import { toast } from 'sonner';
import Footer from '../components/Footer';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { email, password });
      localStorage.setItem('token', res.data.token);
      toast.success('Account created! Welcome to Breathe');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create an account';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async (credential?: string) => {
  if (!credential) return;
  setLoading(true);
  try {
    const res = await api.post('/auth/google', { credential });
    localStorage.setItem('token', res.data.token);
    toast.success('Signed in with Google! Welcome to Breathe');
    navigate('/');
  } catch (err: any) {
    const msg = err.response?.data?.error || 'Google sign in failed';
    setError(msg);
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      
      {/* stars */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            <div className="w-1 h-1 bg-[#70B8FF] rounded-full opacity-60" />
          </div>
        ))}
      </div>

      <NavBar />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left panel - text */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-light leading-tight text-[#70B8FF]">
                Create an account to track<br />
                <span className="font-bold text-[#AEE6FF]">your meditation progress</span>
              </h1>
              <p className="text-xl text-[#88AACC] font-light">
                Welcome to <span className="font-semibold text-[#70B8FF]">Breathe</span>.<br />
               Start your own path to meditatio calmnes
              </p>
            </div>

            {/* Rite side */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl">
              <form onSubmit={handleSignUp} className="space-y-8">
                {/* Email */}
                <div>
                  <label className="block text-[#70B8FF] text-lg font-medium mb-3">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-[#AEE6FF] text-lg placeholder-[#88AACC]/70 focus:outline-none focus:border-[#70B8FF] focus:ring-4 focus:ring-[#70B8FF]/20 transition-all"
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
                    minLength={6}
                    className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-[#AEE6FF] text-lg placeholder-[#88AACC]/70 focus:outline-none focus:border-[#70B8FF] focus:ring-4 focus:ring-[#70B8FF]/20 transition-all"
                    placeholder="••••••••••••"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-center">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-5 bg-gradient-to-r from-[#3A82F7] to-[#70B8FF] rounded-2xl font-semibold text-white text-lg hover:shadow-xl hover:shadow-[#3A82F7]/30 transition-all disabled:opacity-70"
                  >
                    {loading ? 'Creating...' : 'Sign Up'}
                  </button>
                  <Link
                    to="/login"
                    className="flex-1 py-5 border-2 border-[#70B8FF] rounded-2xl font-semibold text-[#70B8FF] text-lg hover:bg-[#70B8FF]/10 transition-all text-center"
                  >
                    Login
                  </Link>
                </div>

                {/* Social */}
                <div className="text-center pt-6 border-t border-white/10">
                  <p className="text-[#88AACC] mb-6">Or log in via</p>

                  <div className="flex justify-center gap-10 items-center">
                    
                    {/* Заглушки под другие соцсети */}
                    {['Facebook', 'Apple'].map((social) => (
                      <button
                        key={social}
                        className="text-[#70B8FF] font-bold text-lg hover:text-[#AEE6FF] hover:scale-110 transition-all"
                      >
                        {social}
                      </button>
                    ))}

                    {/* Google OAuth */}
                    <div className="hover:scale-110 transition-all">
                      <GoogleLogin
                        onSuccess={(credentialResponse) => {
                          console.log(credentialResponse);
                          handleGoogleSignIn(credentialResponse.credential);
                        }}
                        onError={() => {
                          console.log('Google Sign Up Failed');
                          toast.error('Google sign up failed');
                        }}
                        useOneTap={false}
                        theme="outline"
                        text="signin_with"
                        shape="rectangular"
                        size="large"
                        logo_alignment="left"
                        width="220"
                      />
                    </div>

                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
}