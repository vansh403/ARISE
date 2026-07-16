// Realistic human bounds — used to validate/clamp user input
export const WEIGHT_KG_MIN = 25;
export const WEIGHT_KG_MAX = 300;
export const HEIGHT_CM_MIN = 100;
export const HEIGHT_CM_MAX = 250;

export const KG_PER_LB = 0.45359237;
export const CM_PER_FT = 30.48;
export const CM_PER_IN = 2.54;

export const lbsToKg = (lbs) => lbs * KG_PER_LB;
export const kgToLbs = (kg) => kg / KG_PER_LB;
export const ftInToCm = (ft, inches = 0) => ft * CM_PER_FT + inches * CM_PER_IN;
export const cmToFtIn = (cm) => {
  const totalIn = cm / CM_PER_IN;
  const ft = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn - ft * 12);
  return { ft, inches };
};

export function clampWeightKg(kg) {
  return Math.min(WEIGHT_KG_MAX, Math.max(WEIGHT_KG_MIN, kg));
}

export function clampHeightCm(cm) {
  return Math.min(HEIGHT_CM_MAX, Math.max(HEIGHT_CM_MIN, cm));
}

export function validateMetrics(weightKg, heightCm) {
  const errors = [];
  if (!weightKg || weightKg < WEIGHT_KG_MIN || weightKg > WEIGHT_KG_MAX) {
    errors.push(`Weight must be between ${WEIGHT_KG_MIN}kg and ${WEIGHT_KG_MAX}kg.`);
  }
  if (!heightCm || heightCm < HEIGHT_CM_MIN || heightCm > HEIGHT_CM_MAX) {
    errors.push(`Height must be between ${HEIGHT_CM_MIN}cm and ${HEIGHT_CM_MAX}cm.`);
  }
  return errors;
}

export function calcAge(dob) {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function calcBMI(weightKg, heightCm) {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

export function bmiCategory(bmi) {
  if (bmi < 18.5) return { key: 'underweight', label: 'Underweight', warn: false };
  if (bmi < 25) return { key: 'normal', label: 'Normal', warn: false };
  if (bmi < 30) return { key: 'overweight', label: 'Overweight', warn: false };
  if (bmi < 35) return { key: 'obese1', label: 'Obese (Class 1)', warn: false };
  if (bmi < 40) return { key: 'obese2', label: 'Obese (Class 2)', warn: true };
  return { key: 'obese3', label: 'Obese (Class 3)', warn: true };
}

export const LOCK_IN_MESSAGE =
  "Your BMI puts you in a high-risk range. This is the moment — you really need to lock in. Start light, stay consistent, and talk to a doctor before pushing intensity.";

// ---------------- Workout plans ----------------

const EXERCISE_LIBRARY = {
  beginner: {
    full_body: ['Bodyweight squat 3x12', 'Incline pushup 3x10', 'Assisted row 3x12', 'Plank 3x30s', 'Glute bridge 3x15'],
    upper: ['Pushup 3x10', 'Dumbbell row 3x12', 'Shoulder press 3x10', 'Bicep curl 3x12', 'Tricep dip 3x10'],
    lower: ['Bodyweight squat 3x15', 'Lunge 3x10/leg', 'Glute bridge 3x15', 'Calf raise 3x15', 'Wall sit 3x30s'],
    push: ['Incline pushup 3x10', 'Shoulder press 3x10', 'Tricep dip 3x10'],
    pull: ['Assisted row 3x12', 'Band pulldown 3x12', 'Bicep curl 3x12'],
    legs: ['Bodyweight squat 3x15', 'Lunge 3x10/leg', 'Calf raise 3x15'],
    cardio_mobility: ['Brisk walk 20min', 'Full-body stretch 10min', 'Light cycling 15min'],
  },
  intermediate: {
    full_body: ['Goblet squat 4x10', 'Pushup 4x12', 'Dumbbell row 4x10', 'Romanian deadlift 3x10', 'Plank 3x45s'],
    upper: ['Bench press 4x8', 'Barbell row 4x8', 'Overhead press 3x10', 'Lat pulldown 3x10', 'Curl + dip superset 3x12'],
    lower: ['Back squat 4x8', 'Romanian deadlift 3x10', 'Walking lunge 3x12/leg', 'Leg press 3x10', 'Calf raise 3x15'],
    push: ['Bench press 4x8', 'Overhead press 3x10', 'Cable fly 3x12', 'Tricep pushdown 3x12'],
    pull: ['Barbell row 4x8', 'Lat pulldown 3x10', 'Face pull 3x15', 'Barbell curl 3x10'],
    legs: ['Back squat 4x8', 'Romanian deadlift 3x10', 'Walking lunge 3x12/leg', 'Calf raise 3x15'],
    cardio_mobility: ['Interval run 20min', 'Mobility flow 15min', 'Rowing machine 15min'],
  },
  advanced: {
    full_body: ['Barbell squat 5x5', 'Weighted pushup 4x8', 'Pendlay row 4x6', 'Deadlift 4x5', 'Hanging leg raise 3x15'],
    upper: ['Bench press 5x5', 'Weighted pull-up 4x6', 'Overhead press 4x6', 'Barbell row 4x8', 'Dip 4x10'],
    lower: ['Back squat 5x5', 'Deadlift 4x5', 'Bulgarian split squat 4x10/leg', 'Hip thrust 4x10', 'Calf raise 4x15'],
    push: ['Bench press 5x5', 'Overhead press 4x6', 'Weighted dip 4x8', 'Cable fly 3x12'],
    pull: ['Weighted pull-up 4x6', 'Pendlay row 4x6', 'Barbell curl 4x8', 'Face pull 3x15'],
    legs: ['Back squat 5x5', 'Bulgarian split squat 4x10/leg', 'Hip thrust 4x10', 'Calf raise 4x15'],
    cardio_mobility: ['HIIT sprints 20min', 'Sled push/carry 15min', 'Deep mobility work 15min'],
  },
};

function splitForFrequency(days) {
  if (days <= 2) return ['full_body', 'full_body'].slice(0, days);
  if (days <= 4) return ['upper', 'lower', 'upper', 'lower'].slice(0, days);
  if (days <= 6) return ['push', 'pull', 'legs', 'push', 'pull', 'legs'].slice(0, days);
  return ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'cardio_mobility'];
}

const DAY_LABELS = {
  full_body: 'Full Body',
  upper: 'Upper Body',
  lower: 'Lower Body',
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  cardio_mobility: 'Cardio & Mobility',
};

export function generateWorkoutPlan(level, daysPerWeek) {
  const lib = EXERCISE_LIBRARY[level] || EXERCISE_LIBRARY.beginner;
  const split = splitForFrequency(daysPerWeek);
  return split.map((type, i) => ({
    day: i + 1,
    focus: DAY_LABELS[type],
    exercises: lib[type] || lib.full_body,
  }));
}

// ---------------- Diet plan ----------------

export function calcBMR({ weightKg, heightCm, age, gender }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * (age || 25);
  return gender === 'female' ? base - 161 : base + 5;
}

const ACTIVITY_MULTIPLIER = { 1: 1.3, 2: 1.35, 3: 1.45, 4: 1.5, 5: 1.6, 6: 1.7, 7: 1.8 };

export function generateDietPlan({ weightKg, heightCm, age, gender, daysPerWeek, level, bmiCat }) {
  const bmr = calcBMR({ weightKg, heightCm, age, gender });
  const tdee = bmr * (ACTIVITY_MULTIPLIER[daysPerWeek] || 1.4);

  let calorieTarget = tdee;
  let goal = 'Maintenance';
  if (['obese1', 'obese2', 'obese3', 'overweight'].includes(bmiCat)) {
    calorieTarget = tdee - 500;
    goal = 'Fat loss (moderate deficit)';
  } else if (bmiCat === 'underweight') {
    calorieTarget = tdee + 350;
    goal = 'Lean mass gain (surplus)';
  } else if (level === 'advanced') {
    goal = 'Performance / recomposition';
  }

  const proteinPerKg = level === 'advanced' ? 2.0 : level === 'intermediate' ? 1.8 : 1.6;
  const proteinG = Math.round(weightKg * proteinPerKg);
  const fatG = Math.round((calorieTarget * 0.25) / 9);
  const remaining = calorieTarget - proteinG * 4 - fatG * 9;
  const carbsG = Math.round(Math.max(remaining, 0) / 4);

  return {
    goal,
    calories: Math.round(calorieTarget),
    macros: { proteinG, fatG, carbsG },
    meals: [
      'Breakfast: protein + complex carbs (e.g. eggs, oats, fruit)',
      'Lunch: lean protein + rice/grain + vegetables',
      'Snack: greek yogurt or protein shake + nuts',
      'Dinner: lean protein + vegetables + healthy fat',
    ],
    notes: bmiCat === 'obese2' || bmiCat === 'obese3'
      ? 'Prioritize whole foods, hydration, and consistency over perfection. Consider a doctor/dietitian check-in.'
      : 'Adjust portions based on progress every 2 weeks.',
  };
}
