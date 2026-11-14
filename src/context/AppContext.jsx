import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialPortfolioData } from '../data/initialPortfolio.js';
import { initialAccountsData } from '../data/initialAccounts.js';
import { initialExpensesData } from '../data/initialExpenses.js';
import { useAuth } from './AuthContext.jsx';
import { api } from '../services/api.js';
import { isSupabaseConfigured, supabase } from '../services/supabase.js';

const AppContext = createContext();

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$'
};

export const AppProvider = ({ children }) => {
  const { user, session } = useAuth();

  // 1. Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ew_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'glass-theme');
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'glass') {
      root.classList.add('glass-theme');
    }
    localStorage.setItem('ew_theme', theme);
  }, [theme]);

  // 2. Active Tab
  const [currentTab, setCurrentTab] = useState('tab-dashboard');

  // 3. Currency
  const [currentCurrency, setCurrentCurrency] = useState(() => {
    return localStorage.getItem('ew_currency') || 'USD';
  });

  const currencySymbol = CURRENCY_SYMBOLS[currentCurrency] || '$';

  const formatMoney = (amount, decimals = 0) => {
    const num = Number(amount) || 0;
    return `${currencySymbol}${num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  };

  // 4. Portfolio State
  const [portfolioData, setPortfolioData] = useState(() => {
    const saved = localStorage.getItem('ew_portfolio_data');
    return saved ? JSON.parse(saved) : initialPortfolioData;
  });

  // 5. Accounts State
  const [accountsData, setAccountsData] = useState(() => {
    const saved = localStorage.getItem('ew_accounts_data');
    return saved ? JSON.parse(saved) : initialAccountsData;
  });

  // 6. Expenses State
  const [expensesData, setExpensesData] = useState(() => {
    const saved = localStorage.getItem('ew_expenses_data');
    return saved ? JSON.parse(saved) : initialExpensesData;
  });

  // 7. Transactions State
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('ew_transactions_data');
    return saved ? JSON.parse(saved) : (initialExpensesData.transactions || []);
  });

  // 8. Modals Visibility State
  const [modals, setModals] = useState({
    auth: false,
    addAccount: false,
    addTx: false,
    quickAdd: false,
    category: false,
    commandMenu: false
  });

  const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => setModals(prev => ({ ...prev, [name]: false }));

  // 9. Toast Notifications
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  // 10. Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem('ew_portfolio_data', JSON.stringify(portfolioData));
  }, [portfolioData]);

  useEffect(() => {
    localStorage.setItem('ew_accounts_data', JSON.stringify(accountsData));
  }, [accountsData]);

  useEffect(() => {
    localStorage.setItem('ew_expenses_data', JSON.stringify(expensesData));
  }, [expensesData]);

  useEffect(() => {
    localStorage.setItem('ew_transactions_data', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ew_currency', currentCurrency);
  }, [currentCurrency]);

  // 11. Cloud Synchronization (Direct Supabase + Node.js API fallback)
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => localStorage.getItem('ew_last_sync') || null);

  const syncToCloud = async () => {
    setIsSyncing(true);
    try {
      const payload = {
        portfolio: portfolioData,
        accounts: accountsData,
        expenses: expensesData,
        transactions
      };

      const userId = user?.id || 'demo_user_001';
      const token = session?.access_token || null;

      // 1. Direct Supabase sync (ideal for static GitHub Pages!)
      if (isSupabaseConfigured() && supabase && user?.id) {
        let errorOccurred = false;
        try {
          if (portfolioData?.defaultAccountData) {
            const rows = portfolioData.defaultAccountData.map(item => ({
              user_id: user.id,
              year: String(item.year),
              salary: item.salary || 0,
              balances: item.balances || {},
              invested: item.invested || {},
              contri: item.contri || {},
              categories: portfolioData.categories || [],
              irs_limits: portfolioData.irsBaseLimits || {},
              updated_at: new Date().toISOString()
            }));
            await supabase.from('portfolios').upsert(rows, { onConflict: 'user_id,year' });
          }

          if (accountsData?.linked) {
            const rows = accountsData.linked.map(a => ({
              id: a.id,
              user_id: user.id,
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
            await supabase.from('accounts').upsert(rows);
          }

          if (expensesData) {
            await supabase.from('expenses').upsert({
              user_id: user.id,
              monthly_budget: expensesData.monthlyBudget || 3000,
              categories: expensesData.categories || [],
              cards: expensesData.cards || [],
              selected_currency: currentCurrency || 'USD',
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
          }
        } catch (supabaseErr) {
          console.warn('Direct Supabase sync warning:', supabaseErr);
          errorOccurred = true;
        }

        const now = new Date().toLocaleTimeString();
        setLastSyncTime(now);
        localStorage.setItem('ew_last_sync', now);

        if (!errorOccurred) {
          showToast('Data synchronized with Supabase!', 'success');
        } else {
          showToast('Saved locally. Ensure database tables exist in Supabase.', 'info');
        }
      } else {
        // 2. Try Node.js API server
        const result = await api.syncAll(payload, userId, token);
        const now = new Date().toLocaleTimeString();
        setLastSyncTime(now);
        localStorage.setItem('ew_last_sync', now);

        if (result && result.synced) {
          showToast('All data securely synchronized with Supabase!', 'success');
        } else {
          showToast('Saved locally. Connect Supabase in .env or Settings for cloud backup.', 'info');
        }
      }
    } catch (err) {
      console.warn('Sync notice:', err);
      showToast('Saved to local storage.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  // Account operations
  const addAccount = async (newAccount) => {
    const accountWithId = {
      ...newAccount,
      id: newAccount.id || `acct_${Date.now()}`,
      lastSynced: new Date().toISOString()
    };

    setAccountsData(prev => ({
      ...prev,
      linked: [accountWithId, ...(prev.linked || [])]
    }));

    showToast(`Account "${newAccount.name}" added successfully`, 'success');

    // Async sync in background
    if (user?.id) {
      api.saveAccount(accountWithId, user.id, session?.access_token).catch(() => {});
    }
  };

  const deleteAccount = async (id) => {
    setAccountsData(prev => ({
      ...prev,
      linked: (prev.linked || []).filter(a => a.id !== id)
    }));
    showToast('Account removed', 'info');

    if (user?.id) {
      api.deleteAccount(id, user.id, session?.access_token).catch(() => {});
    }
  };

  // Transaction operations
  const addTransaction = async (newTx) => {
    const tx = {
      ...newTx,
      id: newTx.id || `tx_${Date.now()}`,
      date: newTx.date || new Date().toISOString().slice(0, 10)
    };

    setTransactions(prev => [tx, ...prev]);
    showToast(`Recorded transaction: ${currencySymbol}${tx.amount}`, 'success');

    if (user?.id) {
      api.saveTransaction(tx, user.id, session?.access_token).catch(() => {});
    }
  };

  const deleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transaction deleted', 'info');

    if (user?.id) {
      api.deleteTransaction(id, user.id, session?.access_token).catch(() => {});
    }
  };

  // Portfolio operations
  const updatePortfolioYear = (yearIndex, field, key, value) => {
    setPortfolioData(prev => {
      const updated = { ...prev };
      const list = [...updated.defaultAccountData];
      if (list[yearIndex]) {
        list[yearIndex] = {
          ...list[yearIndex],
          [field]: {
            ...list[yearIndex][field],
            [key]: Number(value) || 0
          }
        };
      }
      updated.defaultAccountData = list;
      return updated;
    });
  };

  // Keyboard shortcut for Command Menu (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setModals(prev => ({ ...prev, commandMenu: !prev.commandMenu }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        currentTab,
        setCurrentTab,
        currentCurrency,
        setCurrentCurrency,
        currencySymbol,
        formatMoney,
        portfolioData,
        setPortfolioData,
        accountsData,
        setAccountsData,
        addAccount,
        deleteAccount,
        expensesData,
        setExpensesData,
        transactions,
        setTransactions,
        addTransaction,
        deleteTransaction,
        updatePortfolioYear,
        modals,
        openModal,
        closeModal,
        toasts,
        showToast,
        isSyncing,
        lastSyncTime,
        syncToCloud
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
