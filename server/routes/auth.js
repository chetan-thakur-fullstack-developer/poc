import express from 'express';
import { supabase, isSupabaseConfigured } from '../supabase.js';

const router = express.Router();

// Mock store for when Supabase is not configured yet
let mockUsers = [
  { id: 'usr_demo_1', email: 'demo@executivewealth.app', full_name: 'Executive Member', handle: 'demo' }
];

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, handle, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name || email.split('@')[0],
            handle: handle || email.split('@')[0],
            role: role || 'owner'
          }
        }
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({
        message: 'Account created successfully with Supabase Auth',
        user: data.user,
        session: data.session
      });
    }

    // Fallback: Local demo simulation if Supabase credentials are not yet entered
    const existing = mockUsers.find(u => u.email === email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      email,
      full_name: full_name || email.split('@')[0],
      handle: handle || email.split('@')[0],
      role: role || 'owner'
    };
    mockUsers.push(newUser);

    return res.status(201).json({
      message: 'Account created (Demo Mode - connect Supabase in .env for persistent cloud auth)',
      user: newUser,
      session: { access_token: `mock_jwt_${Date.now()}`, user: newUser }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({ error: error.message });
      }

      return res.json({
        message: 'Login successful via Supabase',
        user: data.user,
        session: data.session
      });
    }

    // Demo Mode login fallback
    let user = mockUsers.find(u => u.email === email);
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        handle: email.split('@')[0]
      };
      mockUsers.push(user);
    }

    return res.json({
      message: 'Logged in (Demo Mode - configure Supabase in .env for cloud auth)',
      user,
      session: { access_token: `mock_jwt_${Date.now()}`, user }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    return res.json({ message: 'Signed out successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/user
router.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.replace(/^Bearer\s+/, '');

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.getUser(token);
      if (error) return res.status(401).json({ error: error.message });
      return res.json({ user: data.user });
    }

    return res.json({ user: mockUsers[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
