import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, Mail, Shield, UserPlus, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from './button';
import { useToast } from '../../hooks/use-toast';
import { apiClient } from '../../lib/api';
import MockGoogleSelector from './MockGoogleSelector';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const emptyForm = {
  email: '',
  password: '',
};

const isGmailAddress = (email) => /^[^\s@]+@gmail\.com$/i.test(email.trim());

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [showMockGoogle, setShowMockGoogle] = useState(false);

  useEffect(() => {
    document.title = 'Login // ARISE Protocol';
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleManualLogin = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!isGmailAddress(form.email)) {
      nextErrors.email = 'Enter your registered Gmail address.';
    }
    if (!form.password) {
      nextErrors.password = 'Enter your password.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const email = form.email.trim().toLowerCase();

    try {
      const result = await apiClient.login(email, form.password);
      toast({
        title: '[LOGIN SUCCESS]',
        description: `Welcome back, Hunter ${result.user.name}.`,
      });
      navigate('/dashboard');
    } catch (e) {
      const errMsg = e.response?.data?.error || 'Failed to authenticate.';
      toast({
        title: '[ACCESS DENIED]',
        description: errMsg,
      });
    }
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await res.json();
        
        if (!isGmailAddress(profile.email)) {
          toast({
            title: '[SYSTEM]',
            description: 'Please choose a Google account that uses a Gmail address.',
          });
          return;
        }

        const email = profile.email.trim().toLowerCase();
        const result = await apiClient.googleAuth(email, profile.name || email.split('@')[0], profile.sub);
        
        toast({
          title: '[LOGIN SUCCESS]',
          description: `Welcome, Hunter ${result.user.name}.`,
        });
        navigate('/dashboard');
      } catch (e) {
        toast({
          title: '[SYSTEM]',
          description: 'Failed to authenticate Google account.',
        });
      }
    },
    onError: () => {
      toast({
        title: '[SYSTEM]',
        description: 'Google login failed or was cancelled.',
      });
    }
  });

  const handleGoogleLogin = async () => {
    if (GOOGLE_CLIENT_ID) {
      triggerGoogleLogin();
      return;
    }
    setShowMockGoogle(true);
  };

  const handleMockGoogleLoginSelect = async (email, name) => {
    setShowMockGoogle(false);
    try {
      const result = await apiClient.googleAuth(email, name, 'mock-sub-' + email);
      toast({
        title: '[LOGIN SUCCESS]',
        description: `Welcome back, ${result.user.name}.`,
      });
      navigate('/dashboard');
    } catch (e) {
      toast({
        title: '[ACCESS DENIED]',
        description: 'Failed to authenticate mock Google user.',
      });
    }
  };

  return (
    <section className="relative min-h-screen bg-black pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -top-32 left-0 w-[520px] h-[520px] aura-cyan blur-3xl opacity-25" />
      <div className="absolute -bottom-40 right-0 w-[520px] h-[520px] aura-red blur-3xl opacity-25" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-3">// RETURNING HUNTER</div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-slate-50 leading-tight">
            LOGIN TO <span className="text-red-400">START FRESH</span>
          </h1>
          <p className="mt-4 text-slate-400 max-w-xl leading-relaxed">
            Registered users enter the system with a clean E-Rank profile, a fresh quest board, and quests that unlock only after earlier quests are cleared.
          </p>
          <div className="mt-8 bracket-corners p-5 bg-slate-950/80">
            <div className="flex items-center gap-3 text-cyan-300">
              <Shield className="w-5 h-5" />
              <span className="font-display tracking-widest">E-RANK RESET ACTIVE</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Every login starts the training path clean for the signed-in hunter.
            </p>
          </div>
        </div>

        <div className="bracket-corners bracket-corners-red p-6 md:p-8 bg-gradient-to-br from-slate-950 to-black">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="font-mono text-xs text-red-400 tracking-widest">SYSTEM LOGIN</div>
              <h2 className="font-display text-2xl text-slate-50 mt-1">Hunter Access</h2>
            </div>
            <LogIn className="w-8 h-8 text-cyan-300 rune-glow" />
          </div>

          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-none bg-white text-black hover:bg-slate-200 font-display tracking-wider"
          >
            <Mail className="w-4 h-4" />
            LOGIN WITH GOOGLE
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="font-mono text-[10px] text-slate-500 tracking-widest">OR LOGIN MANUALLY</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <form onSubmit={handleManualLogin} className="space-y-4">
            <label className="block">
              <span className="font-mono text-xs text-slate-400 tracking-widest">GMAIL ADDRESS</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@gmail.com"
                className="mt-2 w-full h-12 bg-black border border-slate-800 px-4 text-slate-100 outline-none focus:border-cyan-400"
              />
              {errors.email && <span className="mt-1 block text-xs text-red-400">{errors.email}</span>}
            </label>

            <label className="block">
              <span className="font-mono text-xs text-slate-400 tracking-widest">PASSWORD</span>
              <div className="mt-2 flex h-12 border border-slate-800 bg-black focus-within:border-cyan-400">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="min-w-0 flex-1 bg-transparent px-4 text-slate-100 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="w-12 flex items-center justify-center text-slate-400 hover:text-cyan-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="mt-1 block text-xs text-red-400">{errors.password}</span>}
            </label>

            <Button
              type="submit"
              className="w-full h-12 bg-cyan-400 text-black hover:bg-cyan-300 font-display font-bold tracking-wider rounded-none"
            >
              ENTER SYSTEM <Zap className="w-4 h-4" />
            </Button>
          </form>

          <Button
            asChild
            variant="outline"
            className="mt-4 w-full h-11 rounded-none border-cyan-400/60 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200 bg-transparent"
          >
            <Link to="/signup">
              <UserPlus className="w-4 h-4" />
              CREATE NEW ACCOUNT
            </Link>
          </Button>
        </div>
      </div>
      <MockGoogleSelector
        isOpen={showMockGoogle}
        onClose={() => setShowMockGoogle(false)}
        onSelect={handleMockGoogleLoginSelect}
        title="Hunter Access Protocol"
        subtitle="SELECT A PROFILE OR GMAIL ACCOUNT TO SYNC WITH GOOGLE"
      />
    </section>
  );
}