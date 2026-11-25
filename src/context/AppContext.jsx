import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialPortfolioData, getCleanPortfolio } from '../data/initialPortfolio.js';
import { initialAccountsData, getCleanAccounts } from '../data/initialAccounts.js';
import { initialExpensesData, getCleanExpenses } from '../data/initialExpenses.js';
import portfolioJson from '../data/json/portfolio-data.json';
import accountsJson from '../data/json/accounts_data.json';
import expenseJson from '../data/json/expense_tracker_data.json';
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

  const HASH_TO_TAB = {
    'dashboard': 'tab-dashboard',
    'accounts': 'tab-accounts',
    'portfolio': 'tab-overview',
    'transactions': 'tab-transactions',
    'expenses': 'tab-expenses',
    'goals': 'tab-goals',
    'tax': 'tab-tax',
    'credit': 'tab-credit',
    'blueprint': 'tab-blueprint',
    'pricing': 'tab-pricing',
    'settings': 'tab-settings',
    'login': 'tab-dashboard',
    'signup': 'tab-dashboard'
  };

  const TAB_TO_HASH = {
    'tab-dashboard': '#/dashboard',
    'tab-accounts': '#/accounts',
    'tab-overview': '#/portfolio',
    'tab-transactions': '#/transactions',
    'tab-expenses': '#/expenses',
    'tab-goals': '#/goals',
    'tab-tax': '#/tax',
    'tab-credit': '#/credit',
    'tab-blueprint': '#/blueprint/paycheck',
    'tab-pricing': '#/pricing',
    'tab-settings': '#/settings/profile'
  };

  // 2. Active Tab (Hash-based routing with route guards - 100% GitHub Pages 404 proof)
  const [currentTab, setCurrentTab] = useState(() => {
    const rawHash = window.location.hash.replace('#/', '').replace('#', '');
    const mainSegment = rawHash.split('/')[0] || 'dashboard';
    return HASH_TO_TAB[mainSegment] || 'tab-dashboard';
  });

  const navigateToHash = (hashRoute) => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const lastSlash = pathname.lastIndexOf('/');
    const dir = lastSlash !== -1 ? pathname.substring(0, lastSlash + 1) : '/';
    const target = origin + dir + hashRoute;
    if (window.location.href !== target) {
      window.location.href = target;
    }
  };

  // Strict Route Guarding & Login Redirection
  useEffect(() => {
    const rawHash = window.location.hash.replace('#/', '').replace('#', '');
    const isAuthRoute = rawHash === 'login' || rawHash === 'signup';

    if (!user) {
      if (!isAuthRoute) {
        navigateToHash('#/login');
      }
    } else {
      if (!rawHash || isAuthRoute) {
        setCurrentTab('tab-dashboard');
        navigateToHash('#/dashboard');
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const targetHash = TAB_TO_HASH[currentTab] || '#/dashboard';
    const currentKey = currentTab.replace('tab-', '').replace('overview', 'portfolio');
    if (!window.location.hash.includes(currentKey)) {
      navigateToHash(targetHash);
    }
    localStorage.setItem('ew_current_tab', currentTab);
  }, [currentTab, user]);

  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#/', '').replace('#', '');
      const isAuthRoute = rawHash === 'login' || rawHash === 'signup';
      if (!user && !isAuthRoute) {
        navigateToHash('#/login');
        return;
      }
      if (user && isAuthRoute) {
        navigateToHash('#/dashboard');
        return;
      }
      const mainSegment = rawHash.split('/')[0] || 'dashboard';
      const matched = HASH_TO_TAB[mainSegment] || 'tab-dashboard';
      if (user) {
        setCurrentTab(matched);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  // 3. Currency & Privacy
  const [currentCurrency, setCurrentCurrency] = useState(() => {
    return localStorage.getItem('ew_currency') || 'USD';
  });

  const [privacyMask, setPrivacyMask] = useState(() => {
    return localStorage.getItem('ew_privacy_mask') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('ew_privacy_mask', privacyMask);
  }, [privacyMask]);

  const currencySymbol = CURRENCY_SYMBOLS[currentCurrency] || '$';

  const formatMoney = (amount, decimals = 0) => {
    if (privacyMask) return '$••••••';
    const num = Number(amount) || 0;
    return `${currencySymbol}${num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  };

  // User storage key prefixes (separating real user from demo account)
  const getStoragePrefix = () => isDemoUser ? 'ew_demo_' : `ew_user_${user?.id || 'real'}_`;
  const isResetWorkspace = localStorage.getItem('ew_workspace_reset') === 'true';

  // 4. Portfolio State
  const [portfolioData, setPortfolioData] = useState(() => {
    if (isResetWorkspace) return getCleanPortfolio();
    if (isDemoUser) {
      const saved = localStorage.getItem('ew_demo_portfolio');
      return saved ? JSON.parse(saved) : initialPortfolioData;
    }
    const saved = localStorage.getItem(`ew_user_${user?.id}_portfolio`);
    return saved ? JSON.parse(saved) : getCleanPortfolio();
  });

  // 5. Accounts State
  const [accountsData, setAccountsData] = useState(() => {
    if (isResetWorkspace) return getCleanAccounts();
    if (isDemoUser) {
      const saved = localStorage.getItem('ew_demo_accounts');
      return saved ? JSON.parse(saved) : initialAccountsData;
    }
    const saved = localStorage.getItem(`ew_user_${user?.id}_accounts`);
    return saved ? JSON.parse(saved) : getCleanAccounts();
  });

  const linkedAccounts = accountsData?.linked || [];

  // 6. Expenses State
  const [expensesData, setExpensesData] = useState(() => {
    if (isResetWorkspace) return getCleanExpenses();
    if (isDemoUser) {
      const saved = localStorage.getItem('ew_demo_expenses');
      return saved ? JSON.parse(saved) : initialExpensesData;
    }
    const saved = localStorage.getItem(`ew_user_${user?.id}_expenses`);
    return saved ? JSON.parse(saved) : getCleanExpenses();
  });

  // 7. Transactions State
  const [transactions, setTransactions] = useState(() => {
    if (isResetWorkspace) return [];
    if (isDemoUser) {
      const saved = localStorage.getItem('ew_demo_transactions');
      const list = saved ? JSON.parse(saved) : (initialExpensesData.transactions || []);
      return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    const saved = localStorage.getItem(`ew_user_${user?.id}_transactions`);
    const list = saved ? JSON.parse(saved) : [];
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
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
      // Load sample test data for demo user from JSON files
      const p = localStorage.getItem('ew_demo_portfolio');
      const a = localStorage.getItem('ew_demo_accounts');
      const e = localStorage.getItem('ew_demo_expenses');
      const t = localStorage.getItem('ew_demo_transactions');

      setPortfolioData(p ? JSON.parse(p) : portfolioJson);
      setAccountsData(a ? JSON.parse(a) : accountsJson);
      setExpensesData(e ? JSON.parse(e) : expenseJson);
      setTransactions(t ? JSON.parse(t) : [...(expenseJson.transactions || [])].sort((a, b) => new Date(b.date) - new Date(a.date)));
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

  // Goals & Milestones State (Global root level state to prevent sidebar/header clipping)
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('ew_goals');
      if (saved) return JSON.parse(saved);
      return isDemoUser ? [
        {
          id: 'g_1',
          title: 'Emergency Reserve (6 Months)',
          category: 'Safety',
          type: 'save',
          target: 50000,
          current: 45000,
          monthly: 1200,
          date: '2026-12-31',
          color: '#10B981',
          linkedAccountId: 'acc_1',
          linkedAccountName: 'Ally High-Yield Savings',
          allocatedPct: 60,
          transactions: [
            { id: 'tx_1', date: '2026-11-01', description: 'Monthly Auto-Deposit', amount: 1200, type: 'deposit', source: 'Ally Savings' },
            { id: 'tx_2', date: '2026-10-01', description: 'Monthly Auto-Deposit', amount: 1200, type: 'deposit', source: 'Ally Savings' }
          ]
        },
        {
          id: 'g_2',
          title: 'Real Estate / Vacation Home',
          category: 'Property',
          type: 'save',
          target: 120000,
          current: 78000,
          monthly: 2500,
          date: '2027-06-30',
          color: '#3B82F6',
          linkedAccountId: 'acc_2',
          linkedAccountName: 'Marcus Invest Marcus',
          allocatedPct: 40,
          transactions: [
            { id: 'tx_3', date: '2026-11-05', description: 'Bonus Deposit', amount: 2500, type: 'deposit', source: 'Manual Entry' }
          ]
        },
        {
          id: 'g_3',
          title: 'Chase Sapphire Reserve Paydown',
          category: 'Debt',
          type: 'paydown',
          target: 8500,
          current: 2384,
          monthly: 800,
          date: '2026-08-30',
          color: '#EF4444',
          apr: 24.99,
          minPayment: 250,
          linkedAccountId: '',
          linkedAccountName: 'None',
          allocatedPct: 0,
          transactions: [
            { id: 'tx_4', date: '2026-11-10', description: 'Credit Card Payment', amount: 800, type: 'payment', source: 'Checking' }
          ]
        }
      ] : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ew_goals', JSON.stringify(goals));
    } catch (_) {}
  }, [goals]);

  const [detailGoal, setDetailGoal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [workspaceResetKey, setWorkspaceResetKey] = useState(0);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isDetailEditing, setIsDetailEditing] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Property');
  const [formType, setFormType] = useState('save');
  const [formTarget, setFormTarget] = useState('');
  const [formDate, setFormDate] = useState('2027-12-31');
  const [formAccountId, setFormAccountId] = useState('');
  const [formAllocPct, setFormAllocPct] = useState(0);
  const [formMonthly, setFormMonthly] = useState('');
  const [formColor, setFormColor] = useState('#10B981');
  const [formApr, setFormApr] = useState('18.99');
  const [formMinPayment, setFormMinPayment] = useState('150');

  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('deposit');

  const getAccountCapacity = (accountId, currentGoalId = null) => {
    const linkedAccounts = accountsData?.linked || [];
    const acc = linkedAccounts.find(a => a.id === accountId);
    if (!acc) return { total: 0, usedPct: 0, availablePct: 100, availableBal: 0 };
    const otherGoals = goals.filter(g => g.linkedAccountId === accountId && g.id !== currentGoalId);
    const usedPct = otherGoals.reduce((s, g) => s + (g.allocatedPct || 0), 0);
    const availablePct = Math.max(0, 100 - usedPct);
    const availableBal = Number(acc.balance || 0) * (availablePct / 100);
    return { total: Number(acc.balance || 0), usedPct, availablePct, availableBal };
  };

  const handleOpenCreate = (goalType = 'save') => {
    setEditingGoal(null);
    setFormTitle('');
    setFormCategory(goalType === 'save' ? 'Property' : 'Debt');
    setFormType(goalType);
    setFormTarget('');
    setFormDate('2027-12-31');
    setFormAccountId('');
    setFormAllocPct(0);
    setFormMonthly('');
    setFormColor(goalType === 'save' ? '#10B981' : '#EF4444');
    setFormApr('18.99');
    setFormMinPayment('150');
    setShowCreateModal(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormCategory(goal.category);
    setFormType(goal.type || 'save');
    setFormTarget(goal.target);
    setFormDate(goal.date);
    setFormAccountId(goal.linkedAccountId || '');
    setFormAllocPct(goal.allocatedPct || 0);
    setFormMonthly(goal.monthly || 500);
    setFormColor(goal.color || (goal.type === 'paydown' ? '#EF4444' : '#10B981'));
    setFormApr(goal.apr || '18.99');
    setFormMinPayment(goal.minPayment || '150');
    setShowCreateModal(true);
  };

  const handleOpenDetailWithEdit = (goal) => {
    setDetailGoal(goal);
    setIsDetailEditing(true);
    setFormTitle(goal.title);
    setFormCategory(goal.category);
    setFormType(goal.type || 'save');
    setFormTarget(goal.target);
    setFormDate(goal.date);
    setFormMonthly(goal.monthly || 500);
    setFormColor(goal.color || (goal.type === 'paydown' ? '#EF4444' : '#10B981'));
    setFormApr(goal.apr || '18.99');
    setFormMinPayment(goal.minPayment || '150');
  };

  const handleToggleDetailEdit = () => {
    if (!isDetailEditing && detailGoal) {
      setFormTitle(detailGoal.title);
      setFormCategory(detailGoal.category);
      setFormType(detailGoal.type || 'save');
      setFormTarget(detailGoal.target);
      setFormDate(detailGoal.date);
      setFormMonthly(detailGoal.monthly || 500);
      setFormColor(detailGoal.color || (detailGoal.type === 'paydown' ? '#EF4444' : '#10B981'));
      setFormApr(detailGoal.apr || '18.99');
      setFormMinPayment(detailGoal.minPayment || '150');
    }
    setIsDetailEditing(!isDetailEditing);
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!formTitle || !formTarget) return;

    const targetVal = parseFloat(formTarget) || 0;
    const monthlyVal = parseFloat(formMonthly) || 500;
    const linkedAccounts = accountsData?.linked || [];

    let startingSaved = 0;
    let linkedName = 'None';
    if (formAccountId) {
      const acc = linkedAccounts.find(a => a.id === formAccountId);
      if (acc) {
        linkedName = acc.name;
        startingSaved = Number(acc.balance || 0) * (formAllocPct / 100);
      }
    }

    if (detailGoal && isDetailEditing) {
      const updated = {
        ...detailGoal,
        title: formTitle,
        category: formCategory,
        type: formType,
        target: targetVal,
        monthly: monthlyVal,
        date: formDate,
        color: formColor,
        apr: formType === 'paydown' ? parseFloat(formApr) || 0 : undefined,
        minPayment: formType === 'paydown' ? parseFloat(formMinPayment) || 0 : undefined
      };
      setGoals(goals.map(g => g.id === detailGoal.id ? updated : g));
      setDetailGoal(updated);
      setIsDetailEditing(false);
      showToast(`Milestone "${formTitle}" updated successfully!`, 'success');
    } else if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? {
        ...g,
        title: formTitle,
        category: formCategory,
        type: formType,
        target: targetVal,
        monthly: monthlyVal,
        date: formDate,
        color: formColor,
        linkedAccountId: formAccountId,
        linkedAccountName: linkedName,
        allocatedPct: formAccountId ? formAllocPct : 0,
        apr: formType === 'paydown' ? parseFloat(formApr) || 0 : undefined,
        minPayment: formType === 'paydown' ? parseFloat(formMinPayment) || 0 : undefined
      } : g));
      showToast(`Goal "${formTitle}" updated successfully!`, 'success');
      setShowCreateModal(false);
    } else {
      const newGoal = {
        id: `g_${Date.now()}`,
        title: formTitle,
        category: formCategory,
        type: formType,
        target: targetVal,
        current: startingSaved,
        monthly: monthlyVal,
        date: formDate,
        color: formColor,
        linkedAccountId: formAccountId,
        linkedAccountName: linkedName,
        allocatedPct: formAccountId ? formAllocPct : 0,
        apr: formType === 'paydown' ? parseFloat(formApr) || 0 : undefined,
        minPayment: formType === 'paydown' ? parseFloat(formMinPayment) || 0 : undefined,
        transactions: [
          { id: `tx_${Date.now()}`, date: new Date().toISOString().slice(0, 10), description: formType === 'paydown' ? 'Existing Debt Balance Logged' : 'Initial Allocation', amount: startingSaved, type: 'deposit', source: linkedName }
        ]
      };
      setGoals([newGoal, ...goals]);
      showToast(formType === 'paydown' ? `💳 Debt liability "${formTitle}" added successfully!` : `🎉 Goal locked in! You're officially on the path to your ${formTitle}.`, 'success');
      setShowCreateModal(false);
    }
  };

  const applyTemplate = (tpl) => {
    if (goals.some(g => g.title === tpl.title)) {
      showToast('Goal template already exists in your active list', 'info');
      return;
    }
    const newGoal = {
      id: `g_${Date.now()}`,
      ...tpl,
      current: tpl.current || 0,
      allocatedPct: 0,
      transactions: []
    };
    setGoals([newGoal, ...goals]);
    showToast(`Added template: "${tpl.title}"`, 'success');
  };

  const handleDeletePrompt = (goal) => {
    showConfirmModal({
      title: `Delete '${goal.title}'?`,
      message: `Removing this milestone deletes your tracking and frees up its allocated account percentage (${goal.allocatedPct || 0}%), while your actual bank account balances remain completely untouched.`,
      confirmText: 'Delete Milestone',
      isDanger: true,
      onConfirm: () => {
        setGoals(goals.filter(g => g.id !== goal.id));
        if (detailGoal?.id === goal.id) setDetailGoal(null);
        showToast('Milestone removed successfully', 'info');
      }
    });
  };

  const handleDeposit = (goalId, amount = 500) => {
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        const newCurrent = g.type === 'paydown'
          ? Math.max(0, g.current - amount)
          : Math.min(g.target, g.current + amount);
        const newTx = {
          id: `tx_${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          description: g.type === 'paydown' ? 'Principal Payment' : 'Quick Deposit',
          amount,
          type: g.type === 'paydown' ? 'payment' : 'deposit',
          source: 'Manual Entry'
        };
        const updated = { ...g, current: newCurrent, transactions: [newTx, ...(g.transactions || [])] };
        if (detailGoal?.id === goalId) setDetailGoal(updated);
        return updated;
      }
      return g;
    }));
    showToast(goalId => goals.find(g => g.id === goalId)?.type === 'paydown' ? `Paid down -$${amount} principal!` : `Added +$${amount} deposit!`, 'success');
  };

  const handleAddManualTx = (e) => {
    e.preventDefault();
    if (!detailGoal || !txDesc || !txAmount) return;
    const amt = parseFloat(txAmount) || 0;

    setGoals(goals.map(g => {
      if (g.id === detailGoal.id) {
        const isPay = g.type === 'paydown';
        const newCurrent = isPay
          ? (txType === 'deposit' || txType === 'payment' ? Math.max(0, g.current - amt) : g.current + amt)
          : (txType === 'deposit' || txType === 'payment' ? Math.min(g.target, g.current + amt) : Math.max(0, g.current - amt));
        const newTx = {
          id: `tx_${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          description: txDesc,
          amount: amt,
          type: txType,
          source: 'Manual Entry'
        };
        const updated = { ...g, current: newCurrent, transactions: [newTx, ...(g.transactions || [])] };
        setDetailGoal(updated);
        return updated;
      }
      return g;
    }));
    setTxDesc('');
    setTxAmount('');
    setShowAddTxModal(false);
    showToast('Transaction recorded successfully', 'success');
  };

  const getGoalStatus = (goal) => {
    const isPaydown = goal.type === 'paydown';
    const remaining = isPaydown ? goal.current : Math.max(0, goal.target - goal.current);
    if (remaining === 0) return { label: isPaydown ? '🎉 Debt Free!' : '🎉 Achieved', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };

    const now = new Date();
    const targetD = new Date(goal.date || '2027-12-31');
    const diffMonths = (targetD.getFullYear() - now.getFullYear()) * 12 + (targetD.getMonth() - now.getMonth());

    if (diffMonths <= 0) {
      return { label: '⚠️ Target date passed', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
    }

    const requiredMonthly = remaining / diffMonths;
    const currentMonthly = goal.monthly || 500;

    if (currentMonthly >= requiredMonthly) {
      return { label: '🟢 On Track', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
    } else {
      return {
        label: `⚠️ Off Track (Need $${Math.ceil(requiredMonthly).toLocaleString()}/mo)`,
        color: 'text-amber-400 bg-amber-500/15 border-amber-500/30'
      };
    }
  };

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    isDanger: false
  });

  const showConfirmModal = ({ title, message, onConfirm, confirmText = 'Confirm', isDanger = false }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      isDanger
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

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
    let targetIndex = 0;
    let exists = false;
    setPortfolioData(prev => {
      const existing = prev.defaultAccountData || [];
      const foundIdx = existing.findIndex(y => y.year === yearStr);
      if (foundIdx !== -1) {
        targetIndex = foundIdx;
        exists = true;
        return prev;
      }
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
      const sortedList = [...existing, newYearObj].sort((a,b) => Number(a.year) - Number(b.year));
      targetIndex = sortedList.findIndex(y => y.year === yearStr);
      return {
        ...prev,
        defaultAccountData: sortedList
      };
    });
    if (exists) {
      showToast(`Year ${yearStr} already added`, 'info');
    } else {
      showToast(`Added new portfolio year: ${yearStr}`, 'success');
    }
    return targetIndex;
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

  const deletePortfolioYear = (yearIndex) => {
    setPortfolioData(prev => {
      const list = [...(prev.defaultAccountData || [])];
      if (list.length <= 1) {
        showToast('Cannot delete the last remaining year', 'error');
        return prev;
      }
      list.splice(yearIndex, 1);
      return { ...prev, defaultAccountData: list };
    });
    showToast('Portfolio year deleted', 'info');
  };

  const resetPortfolioYearValues = (yearIndex) => {
    setPortfolioData(prev => {
      const list = [...(prev.defaultAccountData || [])];
      if (list[yearIndex]) {
        const yr = list[yearIndex].year;
        const emptyBalances = {};
        const emptyInvested = {};
        const emptyContri = {};
        (prev.categories || []).forEach(c => {
          emptyBalances[c.key] = 0;
          emptyInvested[c.key] = 0;
          emptyContri[c.key] = 0;
        });
        list[yearIndex] = {
          year: yr,
          salary: 0,
          balances: emptyBalances,
          invested: emptyInvested,
          contri: emptyContri
        };
      }
      return { ...prev, defaultAccountData: list };
    });
    showToast('Portfolio year values reset to $0', 'success');
  };

  // Optional: Real user can import sample demo template if desired
  const loadDemoTemplate = () => {
    localStorage.removeItem('ew_workspace_reset');
    setPortfolioData(portfolioJson);
    setAccountsData(accountsJson);
    setExpensesData(expenseJson);
    setTransactions(expenseJson.transactions || []);
    setGoals([
      {
        id: 'g_1',
        title: 'Emergency Reserve (6 Months)',
        category: 'Safety',
        type: 'save',
        target: 50000,
        current: 45000,
        monthly: 1200,
        date: '2026-12-31',
        color: '#10B981',
        linkedAccountId: 'acc_1',
        linkedAccountName: 'Ally High-Yield Savings',
        allocatedPct: 60,
        transactions: [
          { id: 'tx_1', date: '2026-11-01', description: 'Monthly Auto-Deposit', amount: 1200, type: 'deposit', source: 'Ally Savings' },
          { id: 'tx_2', date: '2026-10-01', description: 'Monthly Auto-Deposit', amount: 1200, type: 'deposit', source: 'Ally Savings' }
        ]
      },
      {
        id: 'g_2',
        title: 'Real Estate / Vacation Home',
        category: 'Property',
        type: 'save',
        target: 120000,
        current: 78000,
        monthly: 2500,
        date: '2027-06-30',
        color: '#3B82F6',
        linkedAccountId: 'acc_2',
        linkedAccountName: 'Marcus Invest Marcus',
        allocatedPct: 40,
        transactions: [
          { id: 'tx_3', date: '2026-11-05', description: 'Bonus Deposit', amount: 2500, type: 'deposit', source: 'Manual Entry' }
        ]
      },
      {
        id: 'g_3',
        title: 'Chase Sapphire Reserve Paydown',
        category: 'Debt',
        type: 'paydown',
        target: 8500,
        current: 2384,
        monthly: 800,
        date: '2026-08-30',
        color: '#EF4444',
        apr: 24.99,
        minPayment: 250,
        linkedAccountId: '',
        linkedAccountName: 'None',
        allocatedPct: 0,
        transactions: [
          { id: 'tx_4', date: '2026-11-10', description: 'Credit Card Payment', amount: 800, type: 'payment', source: 'Checking' }
        ]
      }
    ]);
    showToast('Demo data loaded from JSON files', 'info');
  };

  // Reset to clean fresh workspace
  const resetToCleanWorkspace = () => {
    const cleanP = getCleanPortfolio();
    const cleanA = getCleanAccounts();
    const cleanE = getCleanExpenses();
    setPortfolioData(cleanP);
    setAccountsData(cleanA);
    setExpensesData(cleanE);
    setTransactions([]);
    setGoals([]);
    setWorkspaceResetKey(prev => prev + 1);
    try {
      localStorage.setItem('ew_workspace_reset', 'true');
      const prefix = getStoragePrefix();
      localStorage.setItem(prefix + 'portfolio', JSON.stringify(cleanP));
      localStorage.setItem(prefix + 'accounts', JSON.stringify(cleanA));
      localStorage.setItem(prefix + 'expenses', JSON.stringify(cleanE));
      localStorage.setItem(prefix + 'transactions', JSON.stringify([]));
      localStorage.setItem(prefix + 'goals', JSON.stringify([]));

      localStorage.removeItem('ew_demo_portfolio');
      localStorage.removeItem('ew_demo_accounts');
      localStorage.removeItem('ew_demo_expenses');
      localStorage.removeItem('ew_demo_transactions');
      localStorage.removeItem('ew_portfolio');
      localStorage.removeItem('ew_accounts');
      localStorage.removeItem('ew_expenses');
      localStorage.removeItem('ew_transactions');
      localStorage.removeItem('ew_goals');
    } catch (e) {}
    showToast('Workspace reset to clean slate ($0 / empty)', 'success');
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
        privacyMask,
        setPrivacyMask,
        portfolioData,
        setPortfolioData,
        accountsData,
        setAccountsData,
        linkedAccounts,
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
        deletePortfolioYear,
        resetPortfolioYearValues,
        goals,
        setGoals,
        detailGoal,
        setDetailGoal,
        showCreateModal,
        setShowCreateModal,
        showMenuDrawer,
        setShowMenuDrawer,
        workspaceResetKey,
        editingGoal,
        setEditingGoal,
        isDetailEditing,
        setIsDetailEditing,
        getAccountCapacity,
        handleOpenCreate,
        handleOpenEdit,
        handleOpenDetailWithEdit,
        handleToggleDetailEdit,
        handleSaveGoal,
        applyTemplate,
        handleDeletePrompt,
        handleDeposit,
        handleAddManualTx,
        getGoalStatus,
        formTitle,
        setFormTitle,
        formCategory,
        setFormCategory,
        formType,
        setFormType,
        formTarget,
        setFormTarget,
        formDate,
        setFormDate,
        formAccountId,
        setFormAccountId,
        formAllocPct,
        setFormAllocPct,
        formMonthly,
        setFormMonthly,
        formColor,
        setFormColor,
        formApr,
        setFormApr,
        formMinPayment,
        setFormMinPayment,
        showAddTxModal,
        setShowAddTxModal,
        txDesc,
        setTxDesc,
        txAmount,
        setTxAmount,
        txType,
        setTxType,
        modals,
        openModal,
        closeModal,
        confirmModal,
        showConfirmModal,
        closeConfirmModal,
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
