import express from 'express';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { initialExpensesData } from '../../src/data/initialExpenses.js';

const router = express.Router();
let localExpensesStore = { ...initialExpensesData };

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Supabase expenses fetch error:', error);
        return res.json({ data: localExpensesStore, source: 'fallback' });
      }

      if (data) {
        return res.json({
          data: {
            monthlyBudget: Number(data.monthly_budget) || localExpensesStore.monthlyBudget,
            categories: data.categories || localExpensesStore.categories,
            cards: data.cards || localExpensesStore.cards,
            transactions: localExpensesStore.transactions,
            selectedCurrency: data.selected_currency || localExpensesStore.selectedCurrency
          },
          source: 'supabase'
        });
      }
    }

    return res.json({ data: localExpensesStore, source: 'memory' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { monthlyBudget, categories, cards, selectedCurrency } = req.body;
    const userId = req.headers['x-user-id'];

    localExpensesStore = {
      ...localExpensesStore,
      monthlyBudget: monthlyBudget !== undefined ? monthlyBudget : localExpensesStore.monthlyBudget,
      categories: categories || localExpensesStore.categories,
      cards: cards || localExpensesStore.cards,
      selectedCurrency: selectedCurrency || localExpensesStore.selectedCurrency
    };

    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase
        .from('expenses')
        .upsert({
          user_id: userId,
          monthly_budget: localExpensesStore.monthlyBudget,
          categories: localExpensesStore.categories,
          cards: localExpensesStore.cards,
          selected_currency: localExpensesStore.selectedCurrency,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        return res.status(500).json({ error: error.message, savedLocally: true });
      }

      return res.json({ message: 'Expenses saved to Supabase', source: 'supabase' });
    }

    return res.json({ message: 'Expenses saved in memory', source: 'memory' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
