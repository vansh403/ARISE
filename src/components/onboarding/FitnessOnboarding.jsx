import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { apiClient } from '../../lib/api';
import MockGoogleSelector from '../ui/MockGoogleSelector';
import {
  WEIGHT_KG_MIN, WEIGHT_KG_MAX, HEIGHT_CM_MIN, HEIGHT_CM_MAX,
  lbsToKg, kgToLbs, ftInToCm, cmToFtIn, clampWeightKg, clampHeightCm,
  validateMetrics, calcAge, calcBMI, bmiCategory, LOCK_IN_MESSAGE,
  generateWorkoutPlan, generateDietPlan,
} from '../../lib/fitnessPlans';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const PROFILE_KEY = 'arise-fitness-profile';

const slide = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.3, ease: 'easeIn' } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fieldIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function FitnessOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [googleReady, setGoogleReady] = useState(false);
  const [account, setAccount] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showMockGoogle, setShowMockGoogle] = useState(false);

  const [basic, setBasic] = useState({ name: '', gender: 'male', dob: '' });
  const [dateError, setDateError] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(170);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [level, setLevel] = useState('beginner');
  const [plans, setPlans] = useState(null);

  useEffect(() => {
    document.title = 'Onboarding // ARISE Fitness';
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      setGoogleReady(Boolean(window.google?.accounts?.id));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    document.body.appendChild(script);
  }, []);

  const decodeJwt = (token) => {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(payload));
    } catch {
      return null;
    }
  };

  const handleGoogleSignIn = () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (GOOGLE_CLIENT_ID && googleReady && window.google?.accounts?.id && !isLocalhost) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          const profile = decodeJwt(response.credential);
          if (!profile?.email) return;
          setAccount({ name: profile.name, email: profile.email.toLowerCase() });
          setBasic((b) => ({ ...b, name: profile.name || b.name }));
        },
      });
      window.google.accounts.id.prompt();
      return;
    }
    setShowMockGoogle(true);
  };

  const handleMockGoogleSignInSelect = (email, name) => {
    setShowMockGoogle(false);
    setAccount({ name, email: email.toLowerCase() });
    setBasic((b) => ({ ...b, name: name || b.name }));
  };

  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const canLeaveStep1 = account && basic.name.trim() && basic.dob && !dateError;

  const handleWeightChange = (val) => {
    const num = Number(val);
    if (Number.isNaN(num)) return;
    const kg = weightUnit === 'kg' ? num : lbsToKg(num);
    setWeightKg(clampWeightKg(kg));
  };

  const handleHeightCmChange = (val) => {
    const num = Number(val);
    if (Number.isNaN(num)) return;
    setHeightCm(clampHeightCm(num));
  };

  const handleHeightFtChange = (ft, inches) => {
    const cm = ftInToCm(Number(ft) || 0, Number(inches) || 0);
    setHeightCm(clampHeightCm(cm));
  };

  const displayWeight = weightUnit === 'kg' ? Math.round(weightKg) : Math.round(kgToLbs(weightKg));
  const { ft: displayFt, inches: displayIn } = cmToFtIn(heightCm);

  const handleGeneratePlans = () => {
    const errors = validateMetrics(weightKg, heightCm);
    if (errors.length) {
      toast({ title: '[SYSTEM]', description: errors.join(' ') });
      return;
    }
    setGenerating(true);
    setTimeout(async () => {
      try {
        const age = calcAge(basic.dob);
        const bmi = calcBMI(weightKg, heightCm);
        const cat = bmiCategory(bmi);
        const workoutPlan = generateWorkoutPlan(level, daysPerWeek);
        const dietPlan = generateDietPlan({
          weightKg, heightCm, age, gender: basic.gender, daysPerWeek, level, bmiCat: cat.key,
        });

        const profile = {
          account, name: basic.name, gender: basic.gender, dob: basic.dob, age,
          weightKg, heightCm, daysPerWeek, level,
          bmi: Math.round(bmi * 10) / 10, bmiCategory: cat,
          workoutPlan, dietPlan, customWorkouts: [],
        };
        await apiClient.saveFitnessProfile(profile);
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        setPlans(profile);
        if (cat.warn) {
          toast({ title: '[LOCK IN]', description: LOCK_IN_MESSAGE });
        }
      } catch (e) {
        toast({ title: '[SYSTEM ERROR]', description: 'Failed to save generated profile on backend.' });
      } finally {
        setGenerating(false);
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n <= step ? 'bg-cyan-400' : 'bg-slate-800'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={slide} initial="initial" animate="animate" exit="exit">
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">
                <motion.h1 variants={fieldIn} className="font-display text-3xl font-black">Let's begin your journey</motion.h1>

                {!account ? (
                  <motion.button
                    variants={fieldIn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 rounded-lg bg-white text-black font-semibold flex items-center justify-center gap-2"
                  >
                    Continue with Google
                  </motion.button>
                ) : (
                  <>
                    <motion.p variants={fieldIn} className="text-sm text-cyan-300">Signed in as {account.email}</motion.p>
                    <motion.div variants={fieldIn}>
                      <label className="text-xs text-slate-400">Full name</label>
                      <input
                        value={basic.name}
                        onChange={(e) => setBasic({ ...basic, name: e.target.value })}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2"
                        placeholder="Your name"
                      />
                    </motion.div>
                    <motion.div variants={fieldIn}>
                      <label className="text-xs text-slate-400">Gender</label>
                      <div className="flex gap-2 mt-1">
                        {['male', 'female', 'other'].map((g) => (
                          <button
                            key={g}
                            onClick={() => setBasic({ ...basic, gender: g })}
                            className={`flex-1 py-2 rounded-lg border capitalize ${basic.gender === g ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300' : 'border-slate-700 text-slate-400'}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                    <motion.div variants={fieldIn}>
                      <label className={`text-xs ${dateError ? 'text-red-400' : 'text-slate-400'}`}>Date of birth</label>
                      <input
                        type="date"
                        value={basic.dob}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBasic({ ...basic, dob: value });
                          setDateError('');
                          if (value) {
                            const selectedDate = new Date(value);
                            const now = new Date();
                            if (isNaN(selectedDate.getTime())) {
                              setDateError('Invalid date format.');
                            } else {
                              let age = now.getFullYear() - selectedDate.getFullYear();
                              const m = now.getMonth() - selectedDate.getMonth();
                              if (m < 0 || (m === 0 && now.getDate() < selectedDate.getDate())) {
                                age--;
                              }
                              if (age < 13) {
                                setDateError('You must be at least 13 years old.');
                              } else if (age > 120) {
                                setDateError('Year out of bounds.');
                              } else if (selectedDate > now) {
                                setDateError('Date cannot be in the future.');
                              }
                            }
                          }
                        }}
                        className={`mt-1 w-full bg-slate-900 border rounded-lg px-3 py-2 ${dateError ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] focus:border-red-400' : 'border-slate-700'}`}
                      />
                      {dateError && <p className="text-red-400 text-xs mt-1">{dateError}</p>}
                    </motion.div>
                  </>
                )}

                <motion.div variants={fieldIn} className="flex justify-end pt-2">
                  <motion.button
                    whileHover={{ scale: canLeaveStep1 ? 1.05 : 1 }}
                    whileTap={{ scale: canLeaveStep1 ? 0.95 : 1 }}
                    disabled={!canLeaveStep1}
                    onClick={goNext}
                    className="p-3 rounded-full bg-cyan-400 text-black disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowRight size={20} />
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={slide} initial="initial" animate="animate" exit="exit">
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                <motion.h1 variants={fieldIn} className="font-display text-3xl font-black">Your physical metrics</motion.h1>

                <motion.div variants={fieldIn}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-400">Weight</label>
                    <div className="flex gap-1 text-xs">
                      {['kg', 'lbs'].map((u) => (
                        <button key={u} onClick={() => setWeightUnit(u)} className={`px-2 py-1 rounded ${weightUnit === u ? 'bg-cyan-400 text-black' : 'bg-slate-800 text-slate-400'}`}>{u}</button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={displayWeight}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Range: {WEIGHT_KG_MIN}–{WEIGHT_KG_MAX}kg</p>
                </motion.div>

                <motion.div variants={fieldIn}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-400">Height</label>
                    <div className="flex gap-1 text-xs">
                      {['cm', 'ft'].map((u) => (
                        <button key={u} onClick={() => setHeightUnit(u)} className={`px-2 py-1 rounded ${heightUnit === u ? 'bg-cyan-400 text-black' : 'bg-slate-800 text-slate-400'}`}>{u}</button>
                      ))}
                    </div>
                  </div>
                  {heightUnit === 'cm' ? (
                    <input
                      type="number"
                      value={Math.round(heightCm)}
                      onChange={(e) => handleHeightCmChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input type="number" value={displayFt} onChange={(e) => handleHeightFtChange(e.target.value, displayIn)} className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="ft" />
                      <input type="number" value={displayIn} onChange={(e) => handleHeightFtChange(displayFt, e.target.value)} className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="in" />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">Range: {HEIGHT_CM_MIN}–{HEIGHT_CM_MAX}cm</p>
                </motion.div>

                <motion.div variants={fieldIn} className="flex justify-between pt-2">
                  <button onClick={goBack} className="text-slate-400 text-sm">Back</button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goNext}
                    className="p-3 rounded-full bg-cyan-400 text-black"
                  >
                    <ArrowRight size={20} />
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={slide} initial="initial" animate="animate" exit="exit">
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                <motion.h1 variants={fieldIn} className="font-display text-3xl font-black">Training profile</motion.h1>

                <motion.div variants={fieldIn}>
                  <label className="text-xs text-slate-400">Workout days per week: {daysPerWeek}</label>
                  <input
                    type="range" min={1} max={7} value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="w-full mt-2 accent-cyan-400"
                  />
                </motion.div>

                <motion.div variants={fieldIn}>
                  <label className="text-xs text-slate-400">Fitness level</label>
                  <div className="flex gap-2 mt-1">
                    {['beginner', 'intermediate', 'advanced'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={`flex-1 py-2 rounded-lg border capitalize ${level === l ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300' : 'border-slate-700 text-slate-400'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {!plans && (
                  <motion.div variants={fieldIn} className="flex justify-between pt-2">
                    <button onClick={goBack} className="text-slate-400 text-sm">Back</button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleGeneratePlans}
                      disabled={generating}
                      className="px-5 py-3 rounded-lg bg-cyan-400 text-black font-semibold flex items-center gap-2"
                    >
                      {generating && <Loader2 size={16} className="animate-spin" />}
                      {generating ? 'Generating...' : 'Generate my plan'}
                    </motion.button>
                  </motion.div>
                )}

                <AnimatePresence>
                  {plans && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4"
                    >
                      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                        <p className="text-sm text-slate-300">BMI: <span className="text-cyan-300 font-semibold">{plans.bmi}</span> — {plans.bmiCategory.label}</p>
                        {plans.bmiCategory.warn && (
                          <p className="text-xs text-amber-400 mt-2">{LOCK_IN_MESSAGE}</p>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/fitness-dashboard')}
                        className="w-full py-3 rounded-lg bg-cyan-400 text-black font-semibold"
                      >
                        View my dashboard
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <MockGoogleSelector
        isOpen={showMockGoogle}
        onClose={() => setShowMockGoogle(false)}
        onSelect={handleMockGoogleSignInSelect}
        title="CALIBRATE INTEGRATION"
        subtitle="SELECT A PROFILE OR GMAIL ACCOUNT TO SYNC METRICS"
      />
    </div>
  );
}
