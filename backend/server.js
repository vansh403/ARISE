import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environmental variables
dotenv.config();

// Initialize routers
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import routineRoutes from './routes/routines.js';
import nutritionRoutes from './routes/nutrition.js';
import huntersRoutes from './routes/hunters.js';
import fitnessRoutes from './routes/fitness.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable cross-origin resource sharing & JSON parsing
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Register routers
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/hunters', huntersRoutes);
app.use('/api/fitness', fitnessRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong inside the system.' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`   ARISE Ranked Gym Protocol Backend`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`========================================`);
  });
}

export default app;
