import express from 'express';
import { supabase, isSupabaseConfigured } from '../supabase.js';

const router = express.Router();

// POST /api/sync
router.post('/', async (req, res) => {
  try {
    const { portfolio, accounts, expenses, transactions } = req.body;
    const userId = req.headers['x-user-id'];

    if (!isSupabaseConfigured() || !supabase) {
      return res.json({
        message: 'Sync acknowledged in Memory Mode. Configure SUPABASE_URL and SUPABASE_ANON_KEY in .env for persistent cloud sync.',
        synced: false,
        source: 'memory'
      });
    }

    if (!userId) {
      return res.status(400).json({ error: 'x-user-id header is required for cloud synchronization' });
    }

    const results = {
      portfolio: false,
      accounts: false,
      expenses: false,
      transactions: false
    };

    // 1. Sync Portfolio
    if (portfolio && Array.isArray(portfolio.defaultAccountData)) {
      const rows = portfolio.defaultAccountData.map(item => ({
        user_id: userId,
        year: String(item.year),
        salary: item.salary || 0,
        balances: item.balances || {},
        invested: item.invested || {},
        contri: item.contri || {},
        categories: portfolio.categories || [],
        irs_limits: portfolio.irsBaseLimits || {},
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('portfolios').upsert(rows, { onConflict: 'user_id,year' });
      results.portfolio = !error;
    }

    // 2. Sync Accounts
    if (accounts && Array.isArray(accounts.linked)) {
      const rows = accounts.linked.map(a => ({
        id: a.id,
        user_id: userId,
        name: a.name || 'Account',
        institution: a.institution || 'Other',
        type: a.type || 'checking',
        mask: a.mask || '0000',
        balance: a.balance || 0,
        color: a.color || '#8B5CF6',
        source: a.source || 'manual',
        account_id: a.accountId || null,
        mapping: a.mapping || {},
        last_synced: new Date().toISOString()
      }));

      const { error } = await supabase.from('accounts').upsert(rows);
      results.accounts = !error;
    }

    // 3. Sync Expenses
    if (expenses) {
      const { error } = await supabase.from('expenses').upsert({
        user_id: userId,
        monthly_budget: expenses.monthlyBudget || 3000,
        categories: expenses.categories || [],
        cards: expenses.cards || [],
        selected_currency: expenses.selectedCurrency || 'USD',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      results.expenses = !error;
    }

    // 4. Sync Transactions
    if (transactions && Array.isArray(transactions)) {
      const rows = transactions.map(t => ({
        id: t.id,
        user_id: userId,
        amount: Number(t.amount) || 0,
        description: t.description || 'Transaction',
        card_id: t.cardId || null,
        category_id: t.categoryId || null,
        date: t.date || new Date().toISOString().slice(0, 10),
        is_recurring: Boolean(t.isRecurring)
      }));

      const { error } = await supabase.from('transactions').upsert(rows);
      results.transactions = !error;
    }

    return res.json({
      message: 'Cloud sync complete',
      synced: true,
      source: 'supabase',
      results
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
