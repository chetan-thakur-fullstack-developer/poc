import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';

export const AuthModal = () => {
  const { modals, closeModal, showToast } = useApp();
  const { user, isDemoUser, isCloudAuthAvailable, signIn, signUp, loginAsDemo, signOut } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('owner');
  const [submitting, setSubmitting] = useState(false);

  if (!modals.auth) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        await signUp({ email, password, fullName, role });
        showToast('Real account created! Your workspace is private and clean.', 'success');
      } else {
        await signIn({ email, password });
        showToast('Signed in to your personal account', 'success');
      }
      closeModal('auth');
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    showToast('Signed out of session', 'info');
    closeModal('auth');
  };

  const handleDemoSwitch = () => {
    loginAsDemo();
    showToast('Switched to Demo Preview Account with sample data', 'info');
    closeModal('auth');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="card relative w-full max-w-md p-6 bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => closeModal('auth')}
          className="absolute top-4 right-4 text-[var(--text-3)] hover:text-[var(--text-1)] text-lg"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-black mb-2 border border-emerald-500/30">
            💎
          </div>
          <h2 className="text-lg font-bold text-[var(--text-1)]">
            {isDemoUser ? 'Demo Sandbox Active' : 'Your Personal Account'}
          </h2>
          <p className="text-xs text-[var(--text-3)] mt-1">
            {isDemoUser
              ? 'Using sample demo data. Create or sign in to your real account for private records.'
              : 'Logged into your private Supabase workspace.'}
          </p>
        </div>

        {/* If REAL USER is logged in */}
        {user && !isDemoUser ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-lg">
              {(user?.user_metadata?.full_name || user?.email || 'U')[0]}
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--text-1)]">
                {user?.user_metadata?.full_name || 'Personal Member'}
              </h3>
              <p className="text-xs text-[var(--text-3)]">{user?.email}</p>
              <div className="inline-block mt-2 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🔒 Private Supabase Workspace
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex gap-3 justify-center">
              <button
                type="button"
                onClick={handleDemoSwitch}
                className="btn-secondary text-xs px-3 py-2"
              >
                Switch to Demo Mode
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-primary text-xs px-4 py-2 bg-rose-600 hover:bg-rose-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-[var(--border)] mb-4">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                Sign In to Real Account
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                New Real Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chetan Thakur"
                    className="input-field text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@executivewealth.app"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field text-xs"
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="owner">Primary Owner</option>
                    <option value="coowner">Co-Owner / Partner</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary text-xs py-2.5 mt-2"
              >
                {submitting
                  ? 'Connecting...'
                  : mode === 'signup'
                  ? 'Create Clean Personal Account'
                  : 'Sign In to My Personal Account'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleDemoSwitch}
                  className="text-xs text-[var(--text-3)] hover:text-emerald-400 font-medium underline"
                >
                  ⚡ Continue with Demo Sandbox (Sample Data)
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
