import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Activity, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { apiClient } from '../lib/api';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 500 : -500,
    opacity: 0,
  }),
};

export default function OnboardingWizard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const baseProfile = location.state?.profile;

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [formData, setFormData] = useState({
    name: baseProfile?.name || '',
    gender: '',
    dob: '',
    height: '',
    weight: '',
    daysPerWeek: '4',
    experience: 'Beginner',
    prs: { squat: '', bench: '', deadlift: '' }
  });

  const [dateError, setDateError] = useState('');
  const [protocol, setProtocol] = useState(null);

  useEffect(() => {
    if (!baseProfile) {
      navigate('/signup', { replace: true });
    }
    document.title = 'System Initialization // ARISE';
  }, [baseProfile, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dob') {
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
    }
    
    if (name.startsWith('pr_')) {
      const prName = name.replace('pr_', '');
      setFormData(prev => ({ ...prev, prs: { ...prev.prs, [prName]: value } }));
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.gender || !formData.dob) {
        toast({ title: '[SYSTEM ERROR]', description: 'All fields are required.' });
        return;
      }
      if (dateError) {
        toast({ title: '[SYSTEM ERROR]', description: 'Please resolve date errors before continuing.' });
        return;
      }
    }
    if (step === 2) {
      if (!formData.height || !formData.weight) {
        toast({ title: '[SYSTEM ERROR]', description: 'Height and weight are required.' });
        return;
      }
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      
      if (weight < 20 || weight > 500) {
        toast({ title: '[SYSTEM ERROR]', description: 'Please enter a valid human weight (20kg - 500kg).' });
        return;
      }
      if (height < 50 || height > 300) {
        toast({ title: '[SYSTEM ERROR]', description: 'Please enter a valid human height (50cm - 300cm).' });
        return;
      }
    }
    
    setDirection(1);
    
    if (step === 3) {
      if (formData.experience !== 'Beginner') {
        setStep(4);
      } else {
        setStep(5);
        setIsAnalyzing(true);
        generateProtocol();
        setTimeout(() => {
          setIsAnalyzing(false);
          setStep(6);
        }, 3000);
      }
    } else if (step === 4) {
      setStep(5);
      setIsAnalyzing(true);
      generateProtocol();
      setTimeout(() => {
        setIsAnalyzing(false);
        setStep(6);
      }, 3000);
    } else {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    if (step === 5 && formData.experience === 'Beginner') {
      setStep(3);
    } else {
      setStep(s => s - 1);
    }
  };

  const generateProtocol = () => {
    const weight = parseFloat(formData.weight) || 70;
    const height = parseFloat(formData.height) || 170;
    
    // Very basic BMR calculation (Mifflin-St Jeor simplified)
    const bmr = 10 * weight + 6.25 * height - 5 * 25 + (formData.gender === 'male' ? 5 : -161);
    const maintenance = Math.round(bmr * 1.55); // moderate activity
    const cutting = maintenance - 500;
    const bulking = maintenance + 300;

    let workoutPlan = '';
    const days = parseInt(formData.daysPerWeek);
    const exp = formData.experience;

    if (exp === 'Beginner') {
      workoutPlan = days <= 3 ? 'Full Body Split (3 days)' : 'Upper/Lower Split (4 days)';
    } else if (exp === 'Intermediate') {
      workoutPlan = days <= 4 ? 'Upper/Lower Split (4 days)' : 'Push/Pull/Legs (5-6 days)';
    } else {
      workoutPlan = days >= 5 ? 'Advanced PPL / Bro Split (6 days)' : 'Upper/Lower Heavy (4 days)';
    }

    setProtocol({
      maintenance,
      cutting,
      bulking,
      workoutPlan,
    });
  };

  const completeOnboarding = async () => {
    const squat = parseFloat(formData.prs.squat) || 0;
    const bench = parseFloat(formData.prs.bench) || 0;
    const deadlift = parseFloat(formData.prs.deadlift) || 0;

    try {
      await apiClient.onboarding({
        gender: formData.gender,
        dob: formData.dob,
        height: formData.height,
        weight: formData.weight,
        daysPerWeek: formData.daysPerWeek,
        experience: formData.experience,
        prs: { squat, bench, deadlift }
      });

      // Update current session on localStorage for layout files
      const currentUser = JSON.parse(window.localStorage.getItem('arise-current-user') || 'null') || baseProfile;
      currentUser.name = formData.name.trim();
      currentUser.stats = {
        gender: formData.gender,
        dob: formData.dob,
        height: formData.height,
        weight: formData.weight,
        daysPerWeek: formData.daysPerWeek,
        experience: formData.experience
      };
      window.localStorage.setItem('arise-current-user', JSON.stringify(currentUser));

      toast({
        title: '[SYSTEM INITIALIZED]',
        description: `Welcome, Hunter ${currentUser.name}. Your dashboard is ready.`,
      });
      navigate('/dashboard', { replace: true });
    } catch (e) {
      toast({
        title: '[SYSTEM ERROR]',
        description: 'Failed to initialize hunter profile on backend.',
      });
    }
  };

  if (!baseProfile) return null;

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col overflow-hidden relative font-sans">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute -top-32 right-0 w-[520px] h-[520px] aura-cyan blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute -bottom-40 left-0 w-[520px] h-[520px] aura-red blur-3xl opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="p-6 md:p-10 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-cyan-400/40 bg-cyan-400/10 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Shield className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="font-display font-black tracking-widest text-xl text-slate-50">ARISE</div>
            <div className="font-mono text-[9px] text-cyan-400 tracking-widest">INITIALIZATION</div>
          </div>
        </div>
        
        {step < 4 && (
          <div className="font-mono text-[10px] text-slate-400 tracking-widest border border-slate-800 px-3 py-1 bg-black/50">
            STEP 0{step} / 03
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex items-center justify-center p-6 z-10">
        <AnimatePresence mode="wait" custom={direction}>
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-lg bracket-corners bg-slate-950/80 backdrop-blur-xl p-8 border border-slate-800"
            >
              <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-2">// IDENTITY</div>
              <h2 className="font-display text-3xl font-black text-slate-50 mb-8 uppercase">Hunter Profile</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block font-mono text-[10px] text-slate-400 tracking-widest mb-1.5">DISPLAY NAME</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full h-12 bg-black/50 border border-slate-700 text-slate-100 px-4 focus:outline-none focus:border-cyan-400 transition-colors font-display tracking-wider" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-slate-400 tracking-widest mb-1.5">GENDER</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-12 bg-black/50 border border-slate-700 text-slate-100 px-4 focus:outline-none focus:border-cyan-400 transition-colors font-display tracking-wider appearance-none">
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={`block font-mono text-[10px] tracking-widest mb-1.5 ${dateError ? 'text-red-400' : 'text-slate-400'}`}>DATE OF BIRTH</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={`w-full h-12 bg-black/50 border text-slate-400 px-4 focus:outline-none transition-colors font-mono ${dateError ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] focus:border-red-400' : 'border-slate-700 focus:border-cyan-400'}`} />
                  {dateError && <div className="text-red-400 text-xs mt-1 font-mono">{dateError}</div>}
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button onClick={nextStep} className="flex items-center gap-2 h-12 px-6 bg-cyan-500 hover:bg-cyan-400 text-black font-display tracking-widest font-bold transition-colors">
                  NEXT <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: METRICS */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-lg bracket-corners bg-slate-950/80 backdrop-blur-xl p-8 border border-slate-800"
            >
              <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-2">// PHYSICAL METRICS</div>
              <h2 className="font-display text-3xl font-black text-slate-50 mb-8 uppercase">Body Composition</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block font-mono text-[10px] text-slate-400 tracking-widest mb-1.5">WEIGHT (KG)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full h-12 bg-black/50 border border-slate-700 text-slate-100 px-4 focus:outline-none focus:border-cyan-400 transition-colors font-display tracking-wider text-xl" placeholder="e.g. 75" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-slate-400 tracking-widest mb-1.5">HEIGHT (CM)</label>
                  <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full h-12 bg-black/50 border border-slate-700 text-slate-100 px-4 focus:outline-none focus:border-cyan-400 transition-colors font-display tracking-wider text-xl" placeholder="e.g. 175" />
                </div>
              </div>

              <div className="mt-10 flex justify-between">
                <button onClick={prevStep} className="font-display tracking-widest text-slate-400 hover:text-white transition-colors text-sm">
                  BACK
                </button>
                <button onClick={nextStep} className="flex items-center gap-2 h-12 px-6 bg-cyan-500 hover:bg-cyan-400 text-black font-display tracking-widest font-bold transition-colors">
                  NEXT <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: COMMITMENT */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-lg bracket-corners bg-slate-950/80 backdrop-blur-xl p-8 border border-slate-800"
            >
              <div className="font-mono text-xs text-red-400 tracking-[0.3em] mb-2">// COMMITMENT</div>
              <h2 className="font-display text-3xl font-black text-slate-50 mb-8 uppercase">Training Parameters</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-mono text-[10px] text-slate-400 tracking-widest mb-3">DAYS PER WEEK</label>
                  <div className="flex gap-2">
                    {['3', '4', '5', '6'].map(d => (
                      <button 
                        key={d}
                        onClick={() => setFormData(p => ({ ...p, daysPerWeek: d }))}
                        className={`flex-1 h-12 border transition-all font-display text-lg ${formData.daysPerWeek === d ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-black/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-slate-400 tracking-widest mb-3">EXPERIENCE LEVEL</label>
                  <div className="flex flex-col gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map(exp => (
                      <button 
                        key={exp}
                        onClick={() => setFormData(p => ({ ...p, experience: exp }))}
                        className={`w-full text-left px-4 h-12 border transition-all font-display tracking-widest ${formData.experience === exp ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)]' : 'bg-black/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        {exp.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-between">
                <button onClick={prevStep} className="font-display tracking-widest text-slate-400 hover:text-white transition-colors text-sm">
                  BACK
                </button>
                <button onClick={nextStep} className="flex items-center gap-2 h-12 px-6 bg-red-500 hover:bg-red-400 text-white font-display tracking-widest font-bold transition-colors">
                  ANALYZE <Activity className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: BASELINE PRs (For Intermediate/Advanced) */}
          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-lg bracket-corners bg-slate-950/80 backdrop-blur-xl p-8 border border-slate-800"
            >
              <div className="font-mono text-xs text-blue-400 tracking-[0.3em] mb-2">// BASELINE POWER</div>
              <h2 className="font-display text-3xl font-black text-slate-50 mb-8 uppercase">Personal Records</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your 1-Rep Max (in kg) to calibrate your starting Strength Score.</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block font-mono text-[10px] text-slate-400 tracking-widest mb-1.5">SQUAT (KG)</label>
                  <input type="number" name="pr_squat" value={formData.prs.squat} onChange={handleChange} className="w-full h-12 bg-black/50 border border-slate-700 text-slate-100 px-4 focus:outline-none focus:border-cyan-400 transition-colors font-display tracking-wider text-xl" placeholder="e.g. 100" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-slate-400 tracking-widest mb-1.5">BENCH PRESS (KG)</label>
                  <input type="number" name="pr_bench" value={formData.prs.bench} onChange={handleChange} className="w-full h-12 bg-black/50 border border-slate-700 text-slate-100 px-4 focus:outline-none focus:border-cyan-400 transition-colors font-display tracking-wider text-xl" placeholder="e.g. 80" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-slate-400 tracking-widest mb-1.5">DEADLIFT (KG)</label>
                  <input type="number" name="pr_deadlift" value={formData.prs.deadlift} onChange={handleChange} className="w-full h-12 bg-black/50 border border-slate-700 text-slate-100 px-4 focus:outline-none focus:border-cyan-400 transition-colors font-display tracking-wider text-xl" placeholder="e.g. 140" />
                </div>
              </div>

              <div className="mt-10 flex justify-between">
                <button onClick={prevStep} className="font-display tracking-widest text-slate-400 hover:text-white transition-colors text-sm">
                  BACK
                </button>
                <button onClick={nextStep} className="flex items-center gap-2 h-12 px-6 bg-cyan-500 hover:bg-cyan-400 text-black font-display tracking-widest font-bold transition-colors">
                  ANALYZE <Activity className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: ANALYZING */}
          {step === 5 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="w-32 h-32 border-t-2 border-r-2 border-cyan-400 rounded-full absolute -top-16 -left-16 opacity-30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-24 h-24 border-b-2 border-l-2 border-red-500 rounded-full absolute -top-12 -left-12 opacity-50"
                />
                <Shield className="w-16 h-16 text-slate-100 absolute -top-8 -left-8" />
              </div>
              <div className="mt-20 font-display text-2xl tracking-widest text-slate-50">GENERATING PROTOCOL</div>
              <div className="mt-2 font-mono text-xs tracking-widest text-cyan-400 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> ASSESSING PARAMETERS
              </div>
            </motion.div>
          )}

          {/* STEP 6: PROTOCOL ASSIGNED */}
          {step === 6 && protocol && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-2xl bracket-corners bracket-corners-red bg-slate-950/90 backdrop-blur-xl p-8 md:p-10 border border-slate-800"
            >
              <div className="flex items-center gap-3 text-red-400 mb-6">
                <Activity className="w-6 h-6" />
                <span className="font-display text-3xl font-black tracking-widest">PROTOCOL ASSIGNED</span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="border border-slate-800 bg-black/60 p-5">
                  <div className="font-mono text-[10px] text-slate-500 tracking-widest mb-1">RECOMMENDED WORKOUT</div>
                  <div className="font-display text-xl text-cyan-300">{protocol.workoutPlan}</div>
                  <div className="mt-3 font-mono text-[10px] text-slate-400 border-t border-slate-800 pt-3">
                    Based on {formData.daysPerWeek} days/week & {formData.experience} level
                  </div>
                </div>

                <div className="border border-slate-800 bg-black/60 p-5">
                  <div className="font-mono text-[10px] text-slate-500 tracking-widest mb-3">CALORIC TARGETS (KCAL)</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-xs text-slate-300">CUTTING</span>
                      <span className="font-display text-lg text-red-400">{protocol.cutting}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-xs text-slate-300">MAINTENANCE</span>
                      <span className="font-display text-lg text-slate-100">{protocol.maintenance}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-xs text-slate-300">BULKING</span>
                      <span className="font-display text-lg text-cyan-400">{protocol.bulking}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={completeOnboarding}
                className="w-full h-14 bg-white hover:bg-slate-200 text-black font-display text-lg tracking-widest font-black transition-colors flex items-center justify-center gap-3"
              >
                ENTER THE SYSTEM <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
