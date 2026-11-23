import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { checkSupabaseConnection, isSupabaseConfigured } from '../../services/supabase.js';
import { LogOut } from 'lucide-react';

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

  const { user, isDemoUser, signOut } = useAuth();

  // Active Settings Sub-Tab with URL path sync
  const [activeSection, setActiveSection] = useState(() => {
    const pathname = window.location.pathname;
    const parts = pathname.split('/');
    if (parts[1] === 'settings' && parts[2]) {
      return parts[2];
    }
    return localStorage.getItem('ew_active_settings_section') || 'profile';
  });

  const handleSetActiveSection = (id) => {
    setActiveSection(id);
    try {
      localStorage.setItem('ew_active_settings_section', id);
      window.history.pushState({ section: id }, '', `/settings/${id}`);
    } catch (e) {}
  };

  useEffect(() => {
    const handlePop = () => {
      const pathname = window.location.pathname;
      const parts = pathname.split('/');
      if (parts[1] === 'settings' && parts[2]) {
        setActiveSection(parts[2]);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Sub-navigation sections
  const sections = [
    { id: 'profile', label: 'Profile', icon: '👤', desc: 'Name, handle & avatar' },
    { id: 'household', label: 'Household', icon: '👥', desc: 'Co-owners & invite codes' },
    { id: 'salary', label: 'Income & Paycheck', icon: '💼', desc: 'Salary, frequency & filing' },
    { id: 'subscription', label: 'Subscription', icon: '👑', desc: 'Plans, trials & entitlements' },
    { id: 'categories', label: 'Categories', icon: '🏷️', desc: 'Expense categories & limits' },
    { id: 'currency', label: 'Currency', icon: '🌐', desc: 'Display currency & formatting' },
    { id: 'appearance', label: 'Appearance', icon: '🎨', desc: 'Themes & visual density' },
    { id: 'privacy', label: 'Privacy Mode', icon: '🔒', desc: 'Mask numbers & hide balances' },
    { id: 'data', label: 'Data & Backup', icon: '💾', desc: 'Export, import & reset' },
    { id: 'cloud', label: 'Cloud Sync', icon: '⚡', desc: 'Supabase PostgreSQL sync' },
    { id: 'about', label: 'About', icon: 'ℹ️', desc: 'Version & local encryption' }
  ];

  // 1. Profile State
  const [name, setName] = useState(user?.user_metadata?.full_name || 'Alex Morgan');
  const [email, setEmail] = useState(user?.email || 'alex@example.com');
  const [handle, setHandle] = useState(user?.user_metadata?.handle || 'alex_m');
  const [avatarColor, setAvatarColor] = useState('#10B981');

  // 2. Household State
  const [inviteCode, setInviteCode] = useState('7KX-4P2');
  const [members, setMembers] = useState([
    { id: 'm1', name: name, email: email, role: 'owner', joined: 'Oct 2026' },
    { id: 'm2', name: 'Jordan Morgan', email: 'jordan@example.com', role: 'coowner', joined: 'Nov 2026' }
  ]);

  // 3. Salary & Income State
  const [annualSalary, setAnnualSalary] = useState(150000);
  const [payFreq, setPayFreq] = useState(26);
  const [filingStatus, setFilingStatus] = useState('mfj');
  const [k401Pct, setK401Pct] = useState(10);

  // 4. Subscription State
  const [currentPlan, setCurrentPlan] = useState(isDemoUser ? 'pro' : 'free');
  const [isTrialActive, setIsTrialActive] = useState(false);

  // 5. Privacy Masking
  const [privacyMask, setPrivacyMask] = useState(false);

  // 6. Supabase Test Connection
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
      version: '4.5.1',
      exportedAt: new Date().toISOString(),
      user: email,
      profile: { name, email, handle },
      household: { inviteCode, members },
      salary: { annualSalary, payFreq, filingStatus, k401Pct },
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

  const handleCopyInviteCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteCode);
      showToast(`Invite code ${inviteCode} copied to clipboard!`, 'success');
    }
  };

  const handleSaveProfile = () => {
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--text-1)]">Settings & Preferences</h2>
          <p className="text-xs text-[var(--text-3)]">
            Manage your personal profile, household co-owners, income configuration, and backups.
          </p>
        </div>

        {/* Sign Out Action */}
        <button
          onClick={() => {
            if (confirm('Sign out of your session? Your local data will be preserved.')) {
              signOut();
            }
          }}
          className="btn text-xs !py-2 !px-3.5 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 self-start sm:self-auto cursor-pointer flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Settings Grid: Sub-nav on Left, Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-nav */}
        <div className="lg:col-span-4 card p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
            Settings Sections
          </div>
          {sections.map((s) => {
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleSetActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <span className="text-base shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <div className="font-bold truncate">{s.label}</div>
                  <div className="text-[10px] text-[var(--text-3)] truncate">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-8 space-y-6">

          {/* ─────────────────────────────────────────────────────────────
              1. PROFILE SECTION
              ───────────────────────────────────────────────────────────── */}
          {activeSection === 'profile' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-1)]">User Profile</h3>
                  <p className="text-xs text-[var(--text-3)]">Your household display identity and avatar badge.</p>
                </div>
                <span className="badge badge-emerald">Active</span>
              </div>

              {/* Profile Card Preview */}
              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md"
                  style={{ backgroundColor: avatarColor }}
                >
                  {(name || 'EW').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-[var(--text-1)] truncate">{name}</div>
                  <div className="text-xs text-[var(--text-3)] truncate">{email}</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">@{handle} • Primary Owner</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="field-label">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Username / Handle</label>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="field-label">Avatar Accent Color</label>
                    <div className="flex items-center gap-2 pt-1">
                      {['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setAvatarColor(c)}
                          className={`w-7 h-7 rounded-xl transition-all cursor-pointer ${
                            avatarColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="btn btn-primary text-xs !py-2.5 !px-5"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              2. HOUSEHOLD SECTION
              ───────────────────────────────────────────────────────────── */}
          {activeSection === 'household' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[var(--border)] pb-4">
                <h3 className="font-bold text-base text-[var(--text-1)]">Household & Co-Owners</h3>
                <p className="text-xs text-[var(--text-3)]">
                  Invite a spouse or partner to share portfolios and budgets under one single source of truth.
                </p>
              </div>

              {/* Invite Code Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-[var(--surface-2)] to-emerald-500/15 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">Your Household Invite Code</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    6-Char Code
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 font-mono text-lg font-black tracking-widest text-white">
                    {inviteCode}
                  </div>
                  <button
                    onClick={handleCopyInviteCode}
                    className="btn btn-primary text-xs !py-2.5 !px-4 cursor-pointer"
                  >
                    Copy Invite Code
                  </button>
                </div>
                <p className="text-[11px] text-[var(--text-3)]">
                  Your partner enters this code during account sign-up to automatically join your household.
                </p>
              </div>

              {/* Members Roster */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--text-1)] uppercase tracking-wider">
                  Household Members ({members.length} / 2)
                </h4>
                <div className="space-y-2">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[var(--text-1)] flex items-center gap-2">
                            <span>{m.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-[var(--text-3)] font-mono uppercase">
                              {m.role}
                            </span>
                          </div>
                          <div className="text-[10px] text-[var(--text-3)]">{m.email} • Joined {m.joined}</div>
                        </div>
                      </div>
                      <span className="badge badge-emerald">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              3. SALARY & INCOME SETTINGS
              ───────────────────────────────────────────────────────────── */}
          {activeSection === 'salary' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[var(--border)] pb-4">
                <h3 className="font-bold text-base text-[var(--text-1)]">Salary & Income Parameters</h3>
                <p className="text-xs text-[var(--text-3)]">
                  Powers the paycheck withholding calculator, budget baselines, and savings rates across the app.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="field-label">Annual Gross Household Income ($)</label>
                  <input
                    type="number"
                    step="5000"
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(Number(e.target.value))}
                    className="input text-base font-bold font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Paycheck Frequency</label>
                    <select
                      value={payFreq}
                      onChange={(e) => setPayFreq(Number(e.target.value))}
                      className="input"
                    >
                      <option value={26}>Bi-Weekly (26 Paychecks/Year)</option>
                      <option value={24}>Semi-Monthly (24 Paychecks/Year)</option>
                      <option value={12}>Monthly (12 Paychecks/Year)</option>
                      <option value={52}>Weekly (52 Paychecks/Year)</option>
                    </select>
                  </div>

                  <div>
                    <label className="field-label">IRS Tax Filing Status</label>
                    <select
                      value={filingStatus}
                      onChange={(e) => setFilingStatus(e.target.value)}
                      className="input"
                    >
                      <option value="mfj">Married Filing Jointly (MFJ)</option>
                      <option value="single">Single</option>
                      <option value="hoh">Head of Household (HoH)</option>
                      <option value="mfs">Married Filing Separately (MFS)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="field-label">401(k) / Pre-Tax Contribution: {k401Pct}%</label>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={k401Pct}
                    onChange={(e) => setK401Pct(Number(e.target.value))}
                    className="ps-slider"
                    style={{
                      background: `linear-gradient(to right, var(--accent) ${(k401Pct / 25) * 100}%, var(--surface-3) ${(k401Pct / 25) * 100}%)`
                    }}
                  />
                </div>

                <button
                  onClick={() => showToast('Income parameters saved!', 'success')}
                  className="btn btn-primary text-xs !py-2.5 !px-5"
                >
                  Update Income Settings
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              4. SUBSCRIPTION & PLANS
              ───────────────────────────────────────────────────────────── */}
          {activeSection === 'subscription' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[var(--border)] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-1)]">Subscription & Entitlements</h3>
                  <p className="text-xs text-[var(--text-3)]">Manage your tier privileges and household access.</p>
                </div>
                <span className="badge badge-purple uppercase font-bold tracking-wider">{currentPlan} Plan</span>
              </div>

              {/* Current Status Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-purple-500/15 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-black text-[var(--text-1)]">
                    {currentPlan === 'pro' ? 'Pro Tier Active' : 'Free Community Tier'}
                  </div>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    {currentPlan === 'pro'
                      ? 'All 9 Blueprint calculators, Plaid sync & unlimited history unlocked.'
                      : 'Basic portfolio tracking enabled. Upgrade for full planning calculators.'}
                  </p>
                </div>

                {currentPlan === 'free' && (
                  <button
                    onClick={() => {
                      setCurrentPlan('pro');
                      setIsTrialActive(true);
                      showToast('7-Day Pro Trial activated!', 'success');
                    }}
                    className="btn btn-primary text-xs !py-2 !px-4 cursor-pointer shrink-0"
                  >
                    Start 7-Day Pro Trial
                  </button>
                )}
              </div>

              {/* Plan Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className={`p-4 rounded-xl border ${currentPlan === 'free' ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--border)] bg-[var(--surface-2)]'}`}>
                  <h4 className="font-bold text-[var(--text-1)]">Free Tier</h4>
                  <p className="text-lg font-black font-mono mt-1">$0</p>
                  <ul className="space-y-1.5 mt-3 text-[11px] text-[var(--text-2)]">
                    <li>✓ Manual account tracking</li>
                    <li>✓ Basic portfolio metrics</li>
                    <li>✓ 1 User profile</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-xl border ${currentPlan === 'basic' ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--border)] bg-[var(--surface-2)]'}`}>
                  <h4 className="font-bold text-[var(--text-1)]">Basic Household</h4>
                  <p className="text-lg font-black font-mono mt-1">$9 <span className="text-[10px] text-[var(--text-3)]">/mo</span></p>
                  <ul className="space-y-1.5 mt-3 text-[11px] text-[var(--text-2)]">
                    <li>✓ Co-owner household sync</li>
                    <li>✓ Paycheck & FIRE calculators</li>
                    <li>✓ Recurring subscription alerts</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-xl border ${currentPlan === 'pro' ? 'border-purple-500 bg-purple-500/10' : 'border-[var(--border)] bg-[var(--surface-2)]'}`}>
                  <h4 className="font-bold text-purple-300">Executive Pro</h4>
                  <p className="text-lg font-black font-mono mt-1">$19 <span className="text-[10px] text-[var(--text-3)]">/mo</span></p>
                  <ul className="space-y-1.5 mt-3 text-[11px] text-[var(--text-2)]">
                    <li>✓ All 9 Blueprint calculators</li>
                    <li>✓ Automated Plaid bank sync</li>
                    <li>✓ Multi-year tax bracket engine</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              5. EXPENSE CATEGORIES
              ───────────────────────────────────────────────────────────── */}
          {activeSection === 'categories' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[var(--border)] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-1)]">Expense Categories</h3>
                  <p className="text-xs text-[var(--text-3)]">Customize categories, emoji icons, and monthly budget caps.</p>
                </div>
                <button
                  onClick={() => showToast('Category saved!', 'info')}
                  className="btn btn-ghost text-xs !py-1.5 !px-3"
                >
                  + Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Housing & Rent', emoji: '🏠', cap: 2800, group: 'Essentials' },
                  { name: 'Groceries & Markets', emoji: '🛒', cap: 950, group: 'Essentials' },
                  { name: 'Utilities & Power', emoji: '⚡', cap: 350, group: 'Essentials' },
                  { name: 'Dining Out & Drinks', emoji: '🍽️', cap: 600, group: 'Lifestyle' },
                  { name: 'Transportation & Gas', emoji: '🚗', cap: 450, group: 'Essentials' },
                  { name: 'Health & Medical', emoji: '🩺', cap: 250, group: 'Essentials' },
                  { name: 'Entertainment & Fun', emoji: '🎬', cap: 400, group: 'Lifestyle' },
                  { name: 'Travel & Vacations', emoji: '✈️', cap: 800, group: 'Lifestyle' }
                ].map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{c.emoji}</span>
                      <div>
                        <div className="font-bold text-[var(--text-1)]">{c.name}</div>
                        <div className="text-[10px] text-[var(--text-3)]">{c.group}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400">${c.cap}/mo</div>
                      <span className="text-[9px] text-[var(--text-3)]">Limit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              6. CURRENCY & FORMATS
              ───────────────────────────────────────────────────────────── */}
          {activeSection === 'currency' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[var(--border)] pb-4">
                <h3 className="font-bold text-base text-[var(--text-1)]">Currency & Regional Settings</h3>
                <p className="text-xs text-[var(--text-3)]">Select the primary currency used for valuations and exports.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="field-label">Active Primary Currency</label>
                  <select
                    value={currentCurrency}
                    onChange={(e) => {
                      setCurrentCurrency(e.target.value);
                      showToast(`Currency changed to ${e.target.value}`, 'success');
                    }}
                    className="input text-base font-bold"
                  >
                    <option value="USD">USD ($) — United States Dollar</option>
                    <option value="EUR">EUR (€) — Euro</option>
                    <option value="GBP">GBP (£) — British Pound</option>
                    <option value="INR">INR (₹) — Indian Rupee</option>
                    <option value="CAD">CAD (C$) — Canadian Dollar</option>
                    <option value="AUD">AUD (A$) — Australian Dollar</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-2)] text-xs space-y-2 text-[var(--text-2)]">
                  <div className="flex justify-between">
                    <span>Currency Symbol:</span>
                    <span className="font-mono font-bold text-[var(--text-1)]">{currentCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sample Formatting:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {currentCurrency === 'USD' ? '$124,500.00' : `${currentCurrency} 124,500.00`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              7. APPEARANCE & THEME
              ───────────────────────────────────────────────────────────── */}
          {activeSection === 'appearance' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[var(--border)] pb-4">
                <h3 className="font-bold text-base text-[var(--text-1)]">Appearance & Visual Themes</h3>
                <p className="text-xs text-[var(--text-3)]">Tailor the look and feel to your workspace setup.</p>
              </div>

              <div className="space-y-4">
                <label className="field-label">Theme Palette</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => { setTheme('dark'); showToast('Dark theme activated', 'info'); }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      theme === 'dark' ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--border)] bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="text-lg">🌙</div>
                    <div className="font-bold text-xs text-[var(--text-1)] mt-1">Dark Mode</div>
                    <p className="text-[10px] text-[var(--text-3)] mt-0.5">High contrast, deep slate tones.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setTheme('light'); showToast('Light theme activated', 'info'); }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      theme === 'light' ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--border)] bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="text-lg">☀️</div>
                    <div className="font-bold text-xs text-[var(--text-1)] mt-1">Light Mode</div>
                    <p className="text-[10px] text-[var(--text-3)] mt-0.5">Clean paper-white aesthetics.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setTheme('glass'); showToast('Glassmorphic theme activated', 'info'); }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      theme === 'glass' ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--border)] bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="text-lg">🔮</div>
                    <div className="font-bold text-xs text-[var(--text-1)] mt-1">Glassmorphic</div>
                    <p className="text-[10px] text-[var(--text-3)] mt-0.5">Frosted glass & glowing aura.</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              8. PRIVACY MODE
              ───────────────────────────────────────────────────────────── */}
          {activeSection === 'privacy' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[var(--border)] pb-4">
                <h3 className="font-bold text-base text-[var(--text-1)]">Privacy & Shielding</h3>
                <p className="text-xs text-[var(--text-3)]">Protect your net worth and account numbers in public spaces.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-1)]">Mask Balances ($••••)</h4>
                  <p className="text-[11px] text-[var(--text-3)]">Replaces numeric values with blurred privacy masks.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrivacyMask(!privacyMask);
                    showToast(privacyMask ? 'Privacy mask disabled' : 'Privacy mask enabled', 'info');
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    privacyMask ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      privacyMask ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              9. DATA & BACKUPS
              ───────────────────────────────────────────────────────────── */}
          {activeSection === 'data' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[var(--border)] pb-4">
                <h3 className="font-bold text-base text-[var(--text-1)]">Data Management & Backups</h3>
                <p className="text-xs text-[var(--text-3)]">Export your complete financial history or restore templates.</p>
              </div>

              <div className="space-y-4">
                {/* Export */}
                <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-1)]">Export Full JSON Backup</h4>
                    <p className="text-[11px] text-[var(--text-3)]">Download all accounts, holdings, budgets, and transactions.</p>
                  </div>
                  <button
                    onClick={exportAllData}
                    className="btn btn-primary text-xs !py-2 !px-4 cursor-pointer"
                  >
                    Export JSON
                  </button>
                </div>

                {/* Restore Sample Data */}
                <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-1)]">Load Sample Demo Template</h4>
                    <p className="text-[11px] text-[var(--text-3)]">Populate with demo accounts, transactions, and holdings.</p>
                  </div>
                  <button
                    onClick={loadDemoTemplate}
                    className="btn text-xs !py-2 !px-4 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 cursor-pointer"
                  >
                    Load Sample Data
                  </button>
                </div>

                {/* Reset Clean Workspace */}
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-rose-300">Wipe to Clean Slate</h4>
                    <p className="text-[11px] text-rose-400/80">Clears sample data and returns to an empty personal workspace.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Reset your entire workspace to a clean empty slate?')) {
                        resetToCleanWorkspace();
                      }
                    }}
                    className="btn text-xs !py-2 !px-4 bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30 cursor-pointer"
                  >
                    Reset Workspace
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              10. CLOUD SYNC & SUPABASE
              ───────────────────────────────────────────────────────────── */}
          {activeSection === 'cloud' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[var(--border)] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-1)]">Supabase Cloud Sync</h3>
                  <p className="text-xs text-[var(--text-3)]">PostgreSQL cloud persistence across devices.</p>
                </div>
                <span className={`badge ${isSupabaseConfigured() ? 'badge-emerald' : 'badge-amber'}`}>
                  {isSupabaseConfigured() ? 'Connected' : 'Credentials Needed'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-1)]">Database Status</span>
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="btn btn-ghost text-xs !py-1 !px-2.5 cursor-pointer"
                  >
                    {testingConnection ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
                {testResult && (
                  <div className={`p-2.5 rounded-lg text-xs font-semibold ${
                    testResult.success ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                  }`}>
                    {testResult.message}
                  </div>
                )}
                <div className="flex justify-between text-xs text-[var(--text-3)] pt-2 border-t border-[var(--border)]">
                  <span>Last Cloud Sync:</span>
                  <span className="font-mono text-[var(--text-1)]">{lastSyncTime || 'Not yet synced'}</span>
                </div>
              </div>

              <button
                onClick={syncToCloud}
                disabled={isSyncing}
                className="btn btn-primary text-xs !py-2.5 !px-5 cursor-pointer"
              >
                {isSyncing ? 'Syncing...' : 'Sync All Data to Supabase'}
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              11. ABOUT
              ───────────────────────────────────────────────────────────── */}
          {activeSection === 'about' && (
            <div className="card p-6 space-y-4 animate-fadeIn">
              <div className="border-b border-[var(--border)] pb-4">
                <h3 className="font-bold text-base text-[var(--text-1)]">About LedgerJourney</h3>
                <p className="text-xs text-[var(--text-3)]">Personal Finance OS for serious households.</p>
              </div>

              <div className="space-y-2 text-xs text-[var(--text-2)] leading-relaxed">
                <p>
                  <b>LedgerJourney v2.5.0 (Fintech Edition)</b> is designed to give couples and individuals institutional-grade visibility over their net worth, portfolios, cash flows, and long-term financial independence horizons.
                </p>
                <p>
                  Built with React, Vite, Tailwind CSS, and local-first encryption with optional Supabase cloud synchronization.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
