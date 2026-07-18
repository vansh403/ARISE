import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, LogIn, LogOut, Mail, Shield, User, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from './button';
import { useToast } from '../../hooks/use-toast';
import { apiClient } from '../../lib/api';
import MockGoogleSelector from './MockGoogleSelector';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const emptyForm = {
  name: '',
  email: '',
  password: '',
};

const isGmailAddress = (email) => /^[^\s@]+@gmail\.com$/i.test(email.trim());

const formatError = (err) => {
  if (!err) return '';
  if (typeof err === 'object') {
    return err.message || JSON.stringify(err);
  }
  return String(err);
};

export default function Awaken() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [showMockGoogle, setShowMockGoogle] = useState(false);

  useEffect(() => {
    const savedUser = window.localStorage.getItem('arise-current-user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const firstName = useMemo(() => {
    if (!currentUser?.name) return 'Hunter';
    return currentUser.name.trim().split(/\s+/)[0];
  }, [currentUser]);

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Enter your name.';
    }

    if (!isGmailAddress(form.email)) {
      nextErrors.email = 'Use a valid Gmail address ending in @gmail.com.';
    }

    if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleManualSignup = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      const result = await apiClient.signup(form.name, form.email, form.password);
      toast({
        title: '[HUNTER AWAKENED]',
        description: 'Profile created. Let\'s calibrate your stats.',
      });
      navigate('/onboarding', { state: { profile: result.user } });
    } catch (e) {
      const errMsg = formatError(e.response?.data?.error) || 'Registration failed.';
      toast({
        title: '[SYSTEM ERROR]',
        description: errMsg,
      });
    }
  };

  const triggerGoogleSignup = useGoogleLogin({
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
          title: '[HUNTER AWAKENED]',
          description: 'Google profile connected. Let\'s calibrate your stats.',
        });
        navigate('/onboarding', { state: { profile: result.user } });
      } catch (e) {
        const detail = formatError(e.response?.data?.error) || e.message || 'Unknown authentication error.';
        toast({
          title: '[SYSTEM]',
          description: `Failed to authenticate Google account: ${detail}`,
        });
      }
    },
    onError: () => {
      toast({
        title: '[SYSTEM]',
        description: 'Google signup failed or was cancelled.',
      });
    }
  });

  const handleGoogleSignup = async () => {
    if (GOOGLE_CLIENT_ID) {
      triggerGoogleSignup();
      return;
    }
    setShowMockGoogle(true);
  };

  const handleMockGoogleSignupSelect = async (email, name) => {
    setShowMockGoogle(false);
    try {
      const result = await apiClient.googleAuth(email, name, 'mock-sub-' + email);
      toast({
        title: '[HUNTER AWAKENED]',
        description: 'Connected mock Google profile. Calibrating stats...',
      });
      navigate('/onboarding', { state: { profile: result.user } });
    } catch (e) {
      toast({
        title: '[SYSTEM ERROR]',
        description: 'Failed to sign up mock Google account.',
      });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleLogout = () => {
    apiClient.logout();
    setCurrentUser(null);
    toast({
      title: '[SYSTEM]',
      description: 'Session cleared. You can sign up again anytime.',
    });
  };

  return (
    <section id="awaken" className="relative bg-black py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -top-32 right-0 w-[520px] h-[520px] aura-cyan blur-3xl opacity-25" />
      <div className="absolute -bottom-40 left-0 w-[520px] h-[520px] aura-red blur-3xl opacity-25" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-3">// AWAKENING GATE</div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-slate-50 leading-tight">
            CREATE YOUR <span className="text-cyan-300">HUNTER PROFILE</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl leading-relaxed">
            Sign up with your Gmail account or enter your name, Gmail address, and password manually. After signup,
            your name appears in the system profile panel.
          </p>

          {currentUser && (
            <div className="mt-8 bracket-corners bracket-corners-red p-6 bg-slate-950/80">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs tracking-widest">
                    <CheckCircle2 className="w-4 h-4" />
                    ACTIVE PROFILE
                  </div>
                  <h3 className="mt-3 font-display text-3xl text-slate-50">Welcome, {firstName}</h3>
                  <p className="mt-2 text-slate-400">{currentUser.name} is now displayed in the system.</p>
                </div>
                <div className="w-14 h-14 border border-cyan-400/60 bg-cyan-400/10 flex items-center justify-center">
                  <User className="w-7 h-7 text-cyan-300" />
                </div>
              </div>
              <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
                <div className="border border-slate-800 bg-black/40 p-3">
                  <div className="font-mono text-[10px] text-slate-500 tracking-widest">NAME</div>
                  <div className="mt-1 text-slate-100">{currentUser.name}</div>
                </div>
                <div className="border border-slate-800 bg-black/40 p-3">
                  <div className="font-mono text-[10px] text-slate-500 tracking-widest">GMAIL</div>
                  <div className="mt-1 text-slate-100 break-all">{currentUser.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bracket-corners p-6 md:p-8 bg-gradient-to-br from-slate-950 to-black">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="font-mono text-xs text-red-400 tracking-widest">NEW USER SIGNUP</div>
              <h3 className="font-display text-2xl text-slate-50 mt-1">Awaken Account</h3>
            </div>
            <Shield className="w-8 h-8 text-cyan-300 rune-glow" />
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full h-12 rounded-none bg-white text-black hover:bg-slate-200 font-display tracking-wider"
          >
            <Mail className="w-4 h-4" />
            SIGN UP WITH GOOGLE
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="font-mono text-[10px] text-slate-500 tracking-widest">OR USE GMAIL MANUALLY</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <form onSubmit={handleManualSignup} className="space-y-4">
            <label className="block">
              <span className="font-mono text-xs text-slate-400 tracking-widest">DISPLAY NAME</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your hunter name"
                className="mt-2 w-full h-12 bg-black border border-slate-800 px-4 text-slate-100 outline-none focus:border-cyan-400"
              />
              {errors.name && <span className="mt-1 block text-xs text-red-400">{errors.name}</span>}
            </label>

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
                  placeholder="Minimum 8 characters"
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
              CREATE PROFILE <Zap className="w-4 h-4" />
            </Button>
          </form>

          <Button
            asChild
            variant="outline"
            className="mt-4 w-full h-11 rounded-none border-cyan-400/60 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200 bg-transparent"
          >
            <Link to="/login">
              <LogIn className="w-4 h-4" />
              ALREADY HAVE AN ACCOUNT? LOGIN
            </Link>
          </Button>

          {currentUser && (
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="mt-4 w-full h-11 rounded-none border-red-500/60 text-red-300 hover:bg-red-500/10 hover:text-red-200 bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              CLEAR CURRENT USER
            </Button>
          )}
        </div>
      </div>
      <MockGoogleSelector
        isOpen={showMockGoogle}
        onClose={() => setShowMockGoogle(false)}
        onSelect={handleMockGoogleSignupSelect}
        title="Awakening Protocol"
        subtitle="SELECT A PROFILE OR GMAIL ACCOUNT TO SYNC WITH GOOGLE"
      />
    </section>
  );
}
