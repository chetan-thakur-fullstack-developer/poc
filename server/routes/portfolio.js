import express from 'express';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { initialPortfolioData } from '../../src/data/initialPortfolio.js';

const router = express.Router();
let localPortfolioStore = { ...initialPortfolioData };

// GET /api/portfolio
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: true });

      if (error) {
        console.error('Supabase portfolio fetch error:', error);
        return res.json({ data: localPortfolioStore, source: 'fallback' });
      }

      if (data && data.length > 0) {
        const defaultAccountData = data.map(row => ({
          year: row.year,
          salary: Number(row.salary) || 0,
          balances: row.balances || {},
          invested: row.invested || {},
          contri: row.contri || {}
        }));

        const categories = data[0].categories && data[0].categories.length > 0
          ? data[0].categories
          : localPortfolioStore.categories;

        const irsBaseLimits = data[0].irs_limits && Object.keys(data[0].irs_limits).length > 0
          ? data[0].irs_limits
          : localPortfolioStore.irsBaseLimits;

        return res.json({
          data: {
            selectedCurrency: localPortfolioStore.selectedCurrency,
            categories,
            irsBaseLimits,
            defaultAccountData
          },
          source: 'supabase'
        });
      }
    }

    return res.json({ data: localPortfolioStore, source: 'memory' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/portfolio
router.post('/', async (req, res) => {
  try {
    const { selectedCurrency, categories, irsBaseLimits, defaultAccountData } = req.body;
    const userId = req.headers['x-user-id'];

    localPortfolioStore = {
      selectedCurrency: selectedCurrency || localPortfolioStore.selectedCurrency,
      categories: categories || localPortfolioStore.categories,
      irsBaseLimits: irsBaseLimits || localPortfolioStore.irsBaseLimits,
      defaultAccountData: defaultAccountData || localPortfolioStore.defaultAccountData
    };

    if (isSupabaseConfigured() && supabase && userId && Array.isArray(defaultAccountData)) {
      // Upsert rows per year in portfolios table
      const rows = defaultAccountData.map(item => ({
        user_id: userId,
        year: String(item.year),
        salary: item.salary || 0,
        balances: item.balances || {},
        invested: item.invested || {},
        contri: item.contri || {},
        categories: categories || localPortfolioStore.categories,
        irs_limits: irsBaseLimits || localPortfolioStore.irsBaseLimits,
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('portfolios')
        .upsert(rows, { onConflict: 'user_id,year' });

      if (error) {
        console.error('Supabase portfolio upsert error:', error);
        return res.status(500).json({ error: error.message, savedLocally: true });
      }

      return res.json({ message: 'Portfolio saved to Supabase', data, source: 'supabase' });
    }

    return res.json({ message: 'Portfolio updated in memory (Configure Supabase in .env for cloud sync)', source: 'memory' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
