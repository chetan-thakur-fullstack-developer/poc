import express from 'express';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { initialExpensesData } from '../../src/data/initialExpenses.js';

const router = express.Router();
let localTransactions = [...(initialExpensesData.transactions || [])];

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase transactions fetch error:', error);
        return res.json({ data: localTransactions, source: 'fallback' });
      }

      if (data) {
        return res.json({
          data: data.map(t => ({
            id: t.id,
            amount: Number(t.amount),
            description: t.description,
            cardId: t.card_id,
            categoryId: t.category_id,
            date: t.date,
            isRecurring: Boolean(t.is_recurring)
          })),
          source: 'supabase'
        });
      }
    }

    return res.json({ data: localTransactions, source: 'memory' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const tx = req.body;
    const userId = req.headers['x-user-id'];

    if (!tx.id) tx.id = `tx_${Date.now()}`;
    if (!tx.date) tx.date = new Date().toISOString().slice(0, 10);

    const idx = localTransactions.findIndex(t => t.id === tx.id);
    if (idx >= 0) {
      localTransactions[idx] = { ...localTransactions[idx], ...tx };
    } else {
      localTransactions.unshift(tx);
    }

    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase
        .from('transactions')
        .upsert({
          id: tx.id,
          user_id: userId,
          amount: Number(tx.amount) || 0,
          description: tx.description || 'Transaction',
          card_id: tx.cardId || null,
          category_id: tx.categoryId || null,
          date: tx.date,
          is_recurring: Boolean(tx.isRecurring)
        });

      if (error) {
        return res.status(500).json({ error: error.message, savedLocally: true });
      }

      return res.json({ message: 'Transaction saved to Supabase', transaction: tx, source: 'supabase' });
    }

    return res.json({ message: 'Transaction saved in memory', transaction: tx, source: 'memory' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    localTransactions = localTransactions.filter(t => t.id !== id);

    if (isSupabaseConfigured() && supabase && userId) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ message: 'Transaction deleted from Supabase' });
    }

    return res.json({ message: 'Transaction deleted from memory' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
