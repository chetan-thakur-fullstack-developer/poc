import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { checkSupabaseConnection, isSupabaseConfigured } from '../../services/supabase.js';

export const SettingsTab = () => {
  const {
    currentCurrency,
    setCurrentCurrency,
    theme,
    setTheme,
    portfolioData,
    accountsData,
    expensesData,
    transactions,
    syncToCloud,
    isSyncing,
    lastSyncTime,
    showToast,
    loadDemoTemplate,
    resetToCleanWorkspace
  } = useApp();

  const { user } = useAuth();
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await checkSupabaseConnection();
      setTestResult(res);
      showToast(res.message, res.success ? 'success' : 'warning');
    } catch (e) {
      setTestResult({ success: false, message: e.message });
      showToast(e.message, 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const exportAllData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: user?.email,
      portfolio: portfolioData,
      accounts: accountsData,
      expenses: expensesData,
      transactions
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `executive-wealth-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Complete backup exported successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[var(--text-1)]">App Settings & Cloud Sync</h2>
        <p className="text-xs text-[var(--text-3)]">
          Manage your Supabase connection, database synchronization, profile, and theme.
        </p>
      </div>

      {/* Supabase Connection & Configuration Status Card */}
      <div className="card p-6 border-emerald-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-black">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-1)] flex items-center gap-2">
                <span>Supabase Account Connection</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSupabaseConfigured()
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {isSupabaseConfigured() ? 'Connected' : 'Credentials Needed in .env'}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-3)]">
                Connects directly to your PostgreSQL database hosted on Supabase.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="btn-secondary text-xs px-3 py-2 cursor-pointer"
            >
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={syncToCloud}
              disabled={isSyncing}
              className="btn-primary text-xs px-4 py-2 cursor-pointer"
            >
              {isSyncing ? 'Syncing...' : 'Push Data Now'}
            </button>
          </div>
        </div>

        {/* Test Connection Alert Box */}
        {testResult && (
          <div className={`p-3 rounded-xl border text-xs ${
            testResult.success
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <span className="font-bold">{testResult.success ? '✅ Success: ' : 'ℹ️ Status: '}</span>
            {testResult.message}
          </div>
        )}

        {/* Instructions Box */}
        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-2">
          <p className="font-semibold text-[var(--text-1)]">
            How to link your Supabase account:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[var(--text-2)] text-[11px]">
            <li>Open the <code>.env</code> file located in the root of this project.</li>
            <li>Paste your <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> from your Supabase Dashboard (<span className="text-emerald-400">Project Settings → API</span>).</li>
            <li>In your Supabase dashboard, go to <strong>SQL Editor</strong>, open <code>supabase_schema.sql</code> from this project, and click <strong>Run</strong> to set up all tables and security policies.</li>
            <li>Your data will now synchronize automatically across all devices!</li>
          </ol>
          {lastSyncTime && (
            <p className="text-[10px] text-emerald-400 font-mono pt-1">
              Last synchronized: {lastSyncTime}
            </p>
          )}
        </div>
      </div>

      {/* User Profile & Household Details */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-1)]">Household Profile</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Full Name
            </label>
            <input
              type="text"
              readOnly
              value={user?.user_metadata?.full_name || 'Chetan Thakur'}
              className="input-field text-xs bg-[var(--surface-3)]/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              readOnly
              value={user?.email || 'chetan@executivewealth.app'}
              className="input-field text-xs bg-[var(--surface-3)]/50"
            />
          </div>
        </div>
      </div>

      {/* Appearance & Currency */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-1)]">Preferences & Theme</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Base Currency
            </label>
            <select
              value={currentCurrency}
              onChange={(e) => setCurrentCurrency(e.target.value)}
              className="input-field text-xs font-semibold"
            >
              <option value="USD">$ USD - US Dollar</option>
              <option value="EUR">€ EUR - Euro</option>
              <option value="GBP">£ GBP - British Pound</option>
              <option value="INR">₹ INR - Indian Rupee</option>
              <option value="CAD">C$ CAD - Canadian Dollar</option>
              <option value="AUD">A$ AUD - Australian Dollar</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Dark', icon: '🌙' },
                { id: 'light', label: 'Light', icon: '☀️' },
                { id: 'glass', label: 'Glass', icon: '🔮' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    theme === t.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-2)]'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Export */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)]">Data Export & Backup</h3>
            <p className="text-xs text-[var(--text-3)]">
              Download your complete financial records in JSON format for offline storage.
            </p>
          </div>

          <button
            onClick={exportAllData}
            className="btn-secondary text-xs px-4 py-2 cursor-pointer self-start sm:self-auto"
          >
            📥 Export All Data (JSON)
          </button>
        </div>
      </div>

      {/* Workspace Data Separation: Real User vs Demo */}
      <div className="card p-5 space-y-4 border-amber-500/20">
        <div>
          <h3 className="font-bold text-sm text-[var(--text-1)]">Workspace Data Separation</h3>
          <p className="text-xs text-[var(--text-3)]">
            Keep real personal financial data completely separate from demo test records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="card-inner p-4 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-[var(--text-1)]">Start Clean Workspace</h4>
              <p className="text-[11px] text-[var(--text-3)] mt-0.5">
                Clears all sample cards, demo transactions, and resets account balances to 0 for your actual numbers.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Reset workspace to an empty clean slate for your actual data?')) {
                  resetToCleanWorkspace();
                }
              }}
              className="btn-secondary text-xs py-2 w-full text-rose-400 hover:text-rose-300 border-rose-500/30"
            >
              🧹 Start Clean Slate (0 Accounts / 0 Transactions)
            </button>
          </div>

          <div className="card-inner p-4 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-[var(--text-1)]">Load Demo Sandbox Template</h4>
              <p className="text-[11px] text-[var(--text-3)] mt-0.5">
                Populates sample Chase, Fidelity, Vanguard accounts, and dummy transactions to test features.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Load sample dummy data into workspace to preview features?')) {
                  loadDemoTemplate();
                }
              }}
              className="btn-secondary text-xs py-2 w-full text-emerald-400 hover:text-emerald-300 border-emerald-500/30"
            >
              📊 Load Sample Demo Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
