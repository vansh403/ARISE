import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { db } from '../lib/data-store.js';

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'shadow_monarch_secret_key_2026',
    { expiresIn: '30d' }
  );
};

// Check if email ends with @gmail.com
const isGmailAddress = (email) => /^[^\s@]+@gmail\.com$/i.test(email.trim());

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, provider } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    if (!isGmailAddress(email)) {
      return res.status(400).json({ error: 'Please enter a valid Gmail address (@gmail.com).' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = db.findOne('users', { email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'A hunter profile with this email already exists.' });
    }

    let passwordHash = '';
    if (provider !== 'google') {
      if (!password || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }
      passwordHash = await bcrypt.hash(password, 10);
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      provider: provider || 'manual',
      joinedAt: new Date().toISOString(),
    };

    db.insert('users', newUser);

    // Remove hash before sending user profile
    const { passwordHash: _, ...userWithoutHash } = newUser;
    const token = generateToken(newUser);

    return res.status(201).json({
      user: userWithoutHash,
      token,
    });
  } catch (e) {
    console.error('Signup error:', e);
    return res.status(500).json({ error: 'Internal system error during sign-up.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.findOne('users', { email: normalizedEmail });

    if (!user || user.provider === 'google') {
      return res.status(401).json({ error: 'Invalid Gmail address or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid Gmail address or password.' });
    }

    const { passwordHash: _, ...userWithoutHash } = user;
    const token = generateToken(user);

    return res.json({
      user: userWithoutHash,
      token,
    });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Internal system error during login.' });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { email, name, sub } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Google email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = db.findOne('users', { email: normalizedEmail });

    if (!user) {
      // Create a new user automatically
      user = {
        id: sub || crypto.randomUUID(),
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        passwordHash: '',
        provider: 'google',
        joinedAt: new Date().toISOString(),
      };
      db.insert('users', user);
    } else if (user.provider !== 'google') {
      // If manual user exists, link / switch them to google provider (or just let them login with google too)
      user.provider = 'google';
      db.update('users', { email: normalizedEmail }, { provider: 'google' });
    }

    const { passwordHash: _, ...userWithoutHash } = user;
    const token = generateToken(user);

    return res.json({
      user: userWithoutHash,
      token,
    });
  } catch (e) {
    console.error('Google auth error:', e);
    return res.status(500).json({ error: 'Internal system error during Google authentication.' });
  }
});

export default router;
