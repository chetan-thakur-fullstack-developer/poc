import express from 'express';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { initialAccountsData } from '../../src/data/initialAccounts.js';

const router = express.Router();
let localAccountsStore = { ...initialAccountsData };

// GET /api/accounts
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase accounts fetch error:', error);
        return res.json({ data: localAccountsStore, source: 'fallback' });
      }

      if (data && data.length > 0) {
        return res.json({
          data: {
            selectedCurrency: localAccountsStore.selectedCurrency,
            lastSync: new Date().toISOString(),
            linked: data.map(a => ({
              id: a.id,
              name: a.name,
              institution: a.institution,
              type: a.type,
              mask: a.mask,
              balance: Number(a.balance),
              color: a.color,
              source: a.source,
              accountId: a.account_id,
              lastSynced: a.last_synced,
              mapping: a.mapping || {}
            }))
          },
          source: 'supabase'
        });
      }
    }

    return res.json({ data: localAccountsStore, source: 'memory' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/accounts
router.post('/', async (req, res) => {
  try {
    const account = req.body;
    const userId = req.headers['x-user-id'];

    if (!account.id) {
      account.id = `acct_${Date.now()}`;
    }

    const idx = localAccountsStore.linked.findIndex(a => a.id === account.id);
    if (idx >= 0) {
      localAccountsStore.linked[idx] = { ...localAccountsStore.linked[idx], ...account };
    } else {
      localAccountsStore.linked.push(account);
    }

    if (isSupabaseConfigured() && supabase && userId) {
      const row = {
        id: account.id,
        user_id: userId,
        name: account.name || 'Account',
        institution: account.institution || 'Other',
        type: account.type || 'checking',
        mask: account.mask || '0000',
        balance: account.balance || 0,
        color: account.color || '#8B5CF6',
        source: account.source || 'manual',
        account_id: account.accountId || null,
        mapping: account.mapping || {},
        last_synced: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('accounts')
        .upsert(row);

      if (error) {
        return res.status(500).json({ error: error.message, savedLocally: true });
      }

      return res.json({ message: 'Account saved to Supabase', account, source: 'supabase' });
    }

    return res.json({ message: 'Account saved in memory', account, source: 'memory' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    localAccountsStore.linked = localAccountsStore.linked.filter(a => a.id !== id);

    if (isSupabaseConfigured() && supabase && userId) {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.json({ message: 'Account deleted from Supabase' });
    }

    return res.json({ message: 'Account deleted from memory' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
