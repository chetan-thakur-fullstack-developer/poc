const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (userId, token) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (userId) headers['x-user-id'] = userId;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  // Health & connection status
  getHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  },

  // Auth routes
  signup: async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (err) {
      return { error: err.message, offline: true };
    }
  },

  login: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await res.json();
    } catch (err) {
      return { error: err.message, offline: true };
    }
  },

  logout: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
      return await res.json();
    } catch (err) {
      return { error: err.message, offline: true };
    }
  },

  // Portfolio routes
  getPortfolio: async (userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/portfolio`, {
        headers: getHeaders(userId, token)
      });
      return await res.json();
    } catch (err) {
      return { source: 'local', offline: true };
    }
  },

  savePortfolio: async (portfolioData, userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/portfolio`, {
        method: 'POST',
        headers: getHeaders(userId, token),
        body: JSON.stringify(portfolioData)
      });
      return await res.json();
    } catch (err) {
      return { source: 'local', offline: true };
    }
  },

  // Accounts routes
  getAccounts: async (userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/accounts`, {
        headers: getHeaders(userId, token)
      });
      return await res.json();
    } catch (err) {
      return { source: 'local', offline: true };
    }
  },

  saveAccount: async (account, userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: getHeaders(userId, token),
        body: JSON.stringify(account)
      });
      return await res.json();
    } catch (err) {
      return { source: 'local', offline: true };
    }
  },

  deleteAccount: async (id, userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/accounts/${id}`, {
        method: 'DELETE',
        headers: getHeaders(userId, token)
      });
      return await res.json();
    } catch (err) {
      return { source: 'local', offline: true };
    }
  },

  // Expenses routes
  getExpenses: async (userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        headers: getHeaders(userId, token)
      });
      return await res.json();
    } catch (err) {
      return { source: 'local', offline: true };
    }
  },

  saveExpenses: async (expenses, userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: getHeaders(userId, token),
        body: JSON.stringify(expenses)
      });
      return await res.json();
    } catch (err) {
      return { source: 'local', offline: true };
    }
  },

  // Transactions routes
  getTransactions: async (userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        headers: getHeaders(userId, token)
      });
      return await res.json();
    } catch (err) {
      return { source: 'local', offline: true };
    }
  },

  saveTransaction: async (tx, userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: getHeaders(userId, token),
        body: JSON.stringify(tx)
      });
      return await res.json();
    } catch (err) {
      return { source: 'local', offline: true };
    }
  },

  deleteTransaction: async (id, userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
        headers: getHeaders(userId, token)
      });
      return await res.json();
    } catch (err) {
      return { source: 'local', offline: true };
    }
  },

  // Full backup & sync
  syncAll: async (payload, userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        headers: getHeaders(userId, token),
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { synced: false, source: 'local', offline: true };
    }
  }
};
