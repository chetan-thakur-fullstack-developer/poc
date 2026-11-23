import express from 'express';
import { supabase, isSupabaseConfigured } from '../supabase.js';

const router = express.Router();

let localSubscriptionsStore = [
  { id: 'sub_1', merchant_name: 'Netflix', estimated_monthly_amount: 15.99, last_charged_date: '2026-11-10', status: 'active' },
  { id: 'sub_2', merchant_name: 'Spotify Premium', estimated_monthly_amount: 11.99, last_charged_date: '2026-11-12', status: 'active' },
  { id: 'sub_3', merchant_name: 'GitHub Copilot', estimated_monthly_amount: 10.00, last_charged_date: '2026-11-01', status: 'active' },
  { id: 'sub_4', merchant_name: 'Amazon Prime', estimated_monthly_amount: 14.99, last_charged_date: '2026-11-05', status: 'active' }
];

// GET /api/subscriptions
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase
        .from('recurring_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        return res.json({ data, source: 'supabase' });
      }
    }

    return res.json({ data: localSubscriptionsStore, source: 'memory' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions/detect
router.post('/detect', async (req, res) => {
  try {
    res.json({ success: true, subscriptions: localSubscriptionsStore });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/subscriptions/:id/cancel
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    localSubscriptionsStore = localSubscriptionsStore.map(s =>
      s.id === id ? { ...s, status: 'cancelled' } : s
    );
    res.json({ success: true, subscriptions: localSubscriptionsStore });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
