import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialPortfolioData, getCleanPortfolio } from '../data/initialPortfolio.js';
import { initialAccountsData, getCleanAccounts } from '../data/initialAccounts.js';
import { initialExpensesData, getCleanExpenses } from '../data/initialExpenses.js';
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
  const { user, session, isDemoUser } = useAuth();

  // 1. Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ew_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'glass-theme');
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'glass') {
      root.classList.add('glass-theme');
    }
    localStorage.setItem('ew_theme', theme);
  }, [theme]);

  // 2. Active Tab (Persisted in localStorage and URL hash)
  const [currentTab, setCurrentTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash.startsWith('tab-')) return hash;
    return localStorage.getItem('ew_current_tab') || 'tab-dashboard';
  });

  useEffect(() => {
    localStorage.setItem('ew_current_tab', currentTab);
    if (currentTab) {
      window.location.hash = currentTab;
    }
  }, [currentTab]);

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

  // User storage key prefixes (separating real user from demo account)
  const getStoragePrefix = () => isDemoUser ? 'ew_demo_' : `ew_user_${user?.id || 'real'}_`;

  // 4. Portfolio State
  const [portfolioData, setPortfolioData] = useState(() => {
    if (isDemoUser) {
      const saved = localStorage.getItem('ew_demo_portfolio');
      return saved ? JSON.parse(saved) : initialPortfolioData;
    }
    const saved = localStorage.getItem(`ew_user_${user?.id}_portfolio`);
    return saved ? JSON.parse(saved) : getCleanPortfolio();
  });

  // 5. Accounts State
  const [accountsData, setAccountsData] = useState(() => {
    if (isDemoUser) {
      const saved = localStorage.getItem('ew_demo_accounts');
      return saved ? JSON.parse(saved) : initialAccountsData;
    }
    const saved = localStorage.getItem(`ew_user_${user?.id}_accounts`);
    return saved ? JSON.parse(saved) : getCleanAccounts();
  });

  // 6. Expenses State
  const [expensesData, setExpensesData] = useState(() => {
    if (isDemoUser) {
      const saved = localStorage.getItem('ew_demo_expenses');
      return saved ? JSON.parse(saved) : initialExpensesData;
    }
    const saved = localStorage.getItem(`ew_user_${user?.id}_expenses`);
    return saved ? JSON.parse(saved) : getCleanExpenses();
  });

  // 7. Transactions State
  const [transactions, setTransactions] = useState(() => {
    if (isDemoUser) {
      const saved = localStorage.getItem('ew_demo_transactions');
      return saved ? JSON.parse(saved) : (initialExpensesData.transactions || []);
    }
    const saved = localStorage.getItem(`ew_user_${user?.id}_transactions`);
    return saved ? JSON.parse(saved) : [];
  });

  // 8. Notifications State
  const [notifications, setNotifications] = useState(() => {
    return [
      {
        id: '1',
        title: 'Welcome to LedgerJourney 👋',
        message: 'Use the dashboard checklist to set up your workspace. Tap the bell anytime to see important alerts.',
        time: 'Just now',
        type: 'info'
      },
      {
        id: '2',
        title: 'Portfolio Sync Complete 📈',
        message: 'All 401(k), IRA, and linked depository accounts successfully synchronized.',
        time: '1h ago',
        type: 'success'
      }
    ];
  });

  const pushNotification = (notif) => {
    setNotifications(prev => [
      { id: Date.now().toString(), time: 'Just now', type: 'info', ...notif },
      ...prev
    ]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Load user data on user switch (Demo vs Real User)
  useEffect(() => {
    if (isDemoUser) {
      // Load sample test data for demo user
      const p = localStorage.getItem('ew_demo_portfolio');
      const a = localStorage.getItem('ew_demo_accounts');
      const e = localStorage.getItem('ew_demo_expenses');
      const t = localStorage.getItem('ew_demo_transactions');

      setPortfolioData(p ? JSON.parse(p) : initialPortfolioData);
      setAccountsData(a ? JSON.parse(a) : initialAccountsData);
      setExpensesData(e ? JSON.parse(e) : initialExpensesData);
      setTransactions(t ? JSON.parse(t) : (initialExpensesData.transactions || []));
    } else if (user?.id) {
      // Real user: fetch their private data from Supabase
      if (isSupabaseConfigured() && supabase) {
        Promise.all([
          supabase.from('portfolios').select('*').eq('user_id', user.id).order('year', { ascending: true }),
          supabase.from('accounts').select('*').eq('user_id', user.id),
          supabase.from('expenses').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false })
        ]).then(([pRes, aRes, eRes, tRes]) => {
          // Portfolios
          if (pRes.data && pRes.data.length > 0) {
            setPortfolioData({
              selectedCurrency: currentCurrency,
              categories: pRes.data[0].categories || getCleanPortfolio().categories,
              irsBaseLimits: pRes.data[0].irs_limits || getCleanPortfolio().irsBaseLimits,
              defaultAccountData: pRes.data.map(r => ({
                year: r.year,
                salary: Number(r.salary) || 0,
                balances: r.balances || {},
                invested: r.invested || {},
                contri: r.contri || {}
              }))
            });
          } else {
            const saved = localStorage.getItem(`ew_user_${user.id}_portfolio`);
            setPortfolioData(saved ? JSON.parse(saved) : getCleanPortfolio());
          }

          // Accounts
          if (aRes.data && aRes.data.length > 0) {
            setAccountsData({
              selectedCurrency: currentCurrency,
              lastSync: new Date().toISOString(),
              linked: aRes.data.map(a => ({
                id: a.id,
                name: a.name,
                institution: a.institution,
                type: a.type,
                mask: a.mask,
                balance: Number(a.balance),
                color: a.color,
                source: a.source,
                lastSynced: a.last_synced,
                mapping: a.mapping || {}
              }))
            });
          } else {
            const saved = localStorage.getItem(`ew_user_${user.id}_accounts`);
            setAccountsData(saved ? JSON.parse(saved) : getCleanAccounts());
          }

          // Expenses
          if (eRes.data) {
            setExpensesData({
              monthlyBudget: Number(eRes.data.monthly_budget) || 3000,
              categories: eRes.data.categories || getCleanExpenses().categories,
              cards: eRes.data.cards || [],
              selectedCurrency: eRes.data.selected_currency || currentCurrency
            });
          } else {
            const saved = localStorage.getItem(`ew_user_${user.id}_expenses`);
            setExpensesData(saved ? JSON.parse(saved) : getCleanExpenses());
          }

          // Transactions
          if (tRes.data && tRes.data.length > 0) {
            setTransactions(tRes.data.map(t => ({
              id: t.id,
              amount: Number(t.amount),
              description: t.description,
              cardId: t.card_id,
              categoryId: t.category_id,
              date: t.date,
              isRecurring: Boolean(t.is_recurring)
            })));
          } else {
            const saved = localStorage.getItem(`ew_user_${user.id}_transactions`);
            setTransactions(saved ? JSON.parse(saved) : []);
          }
        }).catch(err => {
          console.warn('Supabase fetch error for user:', err);
        });
      } else {
        // Fallback local storage for user
        const p = localStorage.getItem(`ew_user_${user.id}_portfolio`);
        const a = localStorage.getItem(`ew_user_${user.id}_accounts`);
        const e = localStorage.getItem(`ew_user_${user.id}_expenses`);
        const t = localStorage.getItem(`ew_user_${user.id}_transactions`);

        setPortfolioData(p ? JSON.parse(p) : getCleanPortfolio());
        setAccountsData(a ? JSON.parse(a) : getCleanAccounts());
        setExpensesData(e ? JSON.parse(e) : getCleanExpenses());
        setTransactions(t ? JSON.parse(t) : []);
      }
    }
  }, [user?.id, isDemoUser]);

  // Persist to user-specific localStorage
  useEffect(() => {
    const prefix = getStoragePrefix();
    localStorage.setItem(`${prefix}portfolio`, JSON.stringify(portfolioData));
  }, [portfolioData, isDemoUser, user?.id]);

  useEffect(() => {
    const prefix = getStoragePrefix();
    localStorage.setItem(`${prefix}accounts`, JSON.stringify(accountsData));
  }, [accountsData, isDemoUser, user?.id]);

  useEffect(() => {
    const prefix = getStoragePrefix();
    localStorage.setItem(`${prefix}expenses`, JSON.stringify(expensesData));
  }, [expensesData, isDemoUser, user?.id]);

  useEffect(() => {
    const prefix = getStoragePrefix();
    localStorage.setItem(`${prefix}transactions`, JSON.stringify(transactions));
  }, [transactions, isDemoUser, user?.id]);

  // Modals Visibility State
  const [modals, setModals] = useState({
    auth: false,
    addAccount: false,
    addTx: false,
    quickAdd: false,
    category: false,
    commandMenu: false,
    tour: false
  });

  const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => setModals(prev => ({ ...prev, [name]: false }));

  // Toast Notifications
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  // Cloud Synchronization (Direct Supabase + Node.js API fallback)
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

      const userId = user?.id || (isDemoUser ? '00000000-0000-0000-0000-000000000000' : 'demo_user_001');

      // 1. Direct Supabase sync
      if (isSupabaseConfigured() && supabase) {
        let errorOccurred = false;
        try {
          if (portfolioData?.defaultAccountData) {
            const rows = portfolioData.defaultAccountData.map(item => ({
              user_id: userId,
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
            if (rows.length > 0) {
              await supabase.from('accounts').upsert(rows);
            }
          }

          if (expensesData) {
            await supabase.from('expenses').upsert({
              user_id: userId,
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
          showToast(isDemoUser ? 'Demo data synced to sandbox' : 'Your personal data is synced with Supabase!', 'success');
        } else {
          showToast('Saved locally. Ensure database tables exist in Supabase.', 'info');
        }
      } else {
        // 2. Try Node.js API server
        const result = await api.syncAll(payload, userId, session?.access_token);
        const now = new Date().toLocaleTimeString();
        setLastSyncTime(now);
        localStorage.setItem('ew_last_sync', now);

        if (result && result.synced) {
          showToast('Data securely synchronized with Supabase!', 'success');
        } else {
          showToast('Saved locally.', 'info');
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

    if (user?.id && !isDemoUser && isSupabaseConfigured() && supabase) {
      supabase.from('accounts').upsert({
        ...accountWithId,
        user_id: user.id
      }).catch(() => {});
    }
  };

  const deleteAccount = async (id) => {
    setAccountsData(prev => ({
      ...prev,
      linked: (prev.linked || []).filter(a => a.id !== id)
    }));
    showToast('Account removed', 'info');

    if (user?.id && !isDemoUser && isSupabaseConfigured() && supabase) {
      supabase.from('accounts').delete().eq('id', id).eq('user_id', user.id).catch(() => {});
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

    if (user?.id && !isDemoUser && isSupabaseConfigured() && supabase) {
      supabase.from('transactions').upsert({
        id: tx.id,
        user_id: user.id,
        amount: Number(tx.amount) || 0,
        description: tx.description,
        card_id: tx.cardId,
        category_id: tx.categoryId,
        date: tx.date,
        is_recurring: Boolean(tx.isRecurring)
      }).catch(() => {});
    }
  };

  const deleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transaction deleted', 'info');

    if (user?.id && !isDemoUser && isSupabaseConfigured() && supabase) {
      supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id).catch(() => {});
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

  const addNewPortfolioYear = (yearStr) => {
    setPortfolioData(prev => {
      if ((prev.defaultAccountData || []).some(y => y.year === yearStr)) return prev;
      const categories = prev.categories || [];
      const emptyBalances = {};
      const emptyInvested = {};
      const emptyContri = {};
      categories.forEach(c => {
        emptyBalances[c.key] = 0;
        emptyInvested[c.key] = 0;
        emptyContri[c.key] = 0;
      });
      const newYearObj = {
        year: yearStr,
        salary: 0,
        balances: emptyBalances,
        invested: emptyInvested,
        contri: emptyContri
      };
      return {
        ...prev,
        defaultAccountData: [...(prev.defaultAccountData || []), newYearObj].sort((a,b) => Number(a.year) - Number(b.year))
      };
    });
    showToast(`Added new portfolio year: ${yearStr}`, 'success');
  };

  const addNewPortfolioCategory = (label, type = 'taxable', color = '#10B981') => {
    const key = 'cat_' + Date.now();
    setPortfolioData(prev => {
      const updatedCategories = [...(prev.categories || []), { key, label, color, type }];
      const updatedYears = (prev.defaultAccountData || []).map(y => ({
        ...y,
        balances: { ...(y.balances || {}), [key]: 0 },
        invested: { ...(y.invested || {}), [key]: 0 },
        contri: { ...(y.contri || {}), [key]: 0 }
      }));
      return {
        ...prev,
        categories: updatedCategories,
        defaultAccountData: updatedYears
      };
    });
    showToast(`Added new category: "${label}"`, 'success');
  };

  // Optional: Real user can import sample demo template if desired
  const loadDemoTemplate = () => {
    setPortfolioData(initialPortfolioData);
    setAccountsData(initialAccountsData);
    setExpensesData(initialExpensesData);
    setTransactions(initialExpensesData.transactions || []);
    showToast('Sample template data loaded into workspace', 'info');
  };

  // Reset to clean fresh workspace
  const resetToCleanWorkspace = () => {
    setPortfolioData(getCleanPortfolio());
    setAccountsData(getCleanAccounts());
    setExpensesData(getCleanExpenses());
    setTransactions([]);
    showToast('Workspace reset to clean slate', 'info');
  };

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
        notifications,
        pushNotification,
        clearNotifications,
        addTransaction,
        deleteTransaction,
        updatePortfolioYear,
        addNewPortfolioYear,
        addNewPortfolioCategory,
        modals,
        openModal,
        closeModal,
        toasts,
        showToast,
        isSyncing,
        lastSyncTime,
        syncToCloud,
        loadDemoTemplate,
        resetToCleanWorkspace
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
