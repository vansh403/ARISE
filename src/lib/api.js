import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach JWT token to all requests if present
api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('arise-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const saveSession = (user, token) => {
  window.localStorage.setItem('arise-current-user', JSON.stringify(user));
  window.localStorage.setItem('arise-token', token);
};

const clearSession = () => {
  window.localStorage.removeItem('arise-current-user');
  window.localStorage.removeItem('arise-token');
  window.localStorage.removeItem('arise-fitness-profile');
};

export const apiClient = {
  // Auth endpoints
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    saveSession(res.data.user, res.data.token);
    return res.data;
  },

  async signup(name, email, password) {
    const res = await api.post('/auth/signup', { name, email, password, provider: 'manual' });
    saveSession(res.data.user, res.data.token);
    return res.data;
  },

  async googleAuth(email, name, sub) {
    const res = await api.post('/auth/google', { email, name, sub });
    saveSession(res.data.user, res.data.token);
    return res.data;
  },

  logout() {
    clearSession();
  },

  // User progress & stats
  async getProgress() {
    const res = await api.get('/user/progress');
    return res.data;
  },

  async onboarding(stats) {
    const res = await api.post('/user/onboarding', stats);
    return res.data;
  },

  async completeQuest(questId, xp) {
    const res = await api.post('/user/quest/complete', { questId, xp });
    return res.data;
  },

  async logSet(exerciseName, weight, reps) {
    const res = await api.post('/user/set/log', { exerciseName, weight, reps });
    return res.data;
  },

  async completeWorkout() {
    const res = await api.post('/user/workout/complete');
    return res.data;
  },

  // Workout routines
  async getRoutines() {
    const res = await api.get('/routines');
    return res.data;
  },

  async createRoutine(name) {
    const res = await api.post('/routines', { name });
    return res.data;
  },

  async deleteRoutine(id) {
    const res = await api.delete(`/routines/${id}`);
    return res.data;
  },

  // Nutrition diary
  async getNutrition(date) {
    const res = await api.get('/nutrition', { params: { date } });
    return res.data;
  },

  async addFood(date, mealKey, food) {
    const res = await api.post('/nutrition/food', { date, mealKey, food });
    return res.data;
  },

  async addWater(date, amount) {
    const res = await api.post('/nutrition/water', { date, amount });
    return res.data;
  },

  async addExercise(date, calories) {
    const res = await api.post('/nutrition/exercise', { date, calories });
    return res.data;
  },

  // Hunters directory
  async getHunters() {
    const res = await api.get('/hunters');
    return res.data;
  },

  // Standalone fitness profile
  async getFitnessProfile() {
    const res = await api.get('/fitness/profile');
    return res.data;
  },

  async saveFitnessProfile(profile) {
    const res = await api.post('/fitness/profile', profile);
    return res.data;
  },

  async addCustomWorkout(name, detail) {
    const res = await api.post('/fitness/profile/workouts', { name, detail });
    return res.data;
  },

  async deleteCustomWorkout(id) {
    const res = await api.delete(`/fitness/profile/workouts/${id}`);
    return res.data;
  }
};
