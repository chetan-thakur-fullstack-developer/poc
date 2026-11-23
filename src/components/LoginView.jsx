import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';

export const LoginView = () => {
  const { signIn, signUp, loginAsDemo } = useAuth();
  const { showToast } = useApp();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('owner'); // 'owner' | 'coowner'
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      if (email.toLowerCase().trim() === 'demo@execwealth.local' && password === 'demo123') {
        loginAsDemo();
        showToast('Welcome to the Demo Workspace!', 'success');
        return;
      }
      await signIn({ email: email.trim(), password });
      showToast('Welcome back!', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Try using demo mode below.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (role === 'coowner' && !inviteCode.trim()) {
      setErrorMsg('Please enter the household invite code (e.g. 7KX-4P2).');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
        inviteCode: inviteCode.trim().toUpperCase()
      });
      showToast('Account created successfully! Welcome to Executive Wealth.', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemo = () => {
    setDemoLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      loginAsDemo();
      showToast('Demo mode active! Pro features & sample portfolios loaded.', 'success');
      setDemoLoading(false);
    }, 400);
  };

  const handlePrefillDemo = () => {
    setEmail('demo@execwealth.local');
    setPassword('demo123');
    setErrorMsg('');
    showToast('Demo credentials filled. Click Sign In or press Enter.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B1120] text-slate-100 flex flex-col justify-center select-none">
      {/* Background Aurora Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      <div className="relative w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
          
          {/* LEFT: Hero & Brand Panel */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/25">
                💎
              </span>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">Executive Wealth</h1>
                <p className="text-xs font-semibold text-emerald-400">Personal Finance OS</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                BUILT FOR SERIOUS HOUSEHOLDS
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Master your money. <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                  Design your future.
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Clarity, not complexity. Your portfolios, budgets, calculators, and retirement horizons held to the highest standard.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-sm shrink-0">
                  ⚡
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">Every account, one command center</h4>
                  <p className="text-[11px] text-slate-400">Plaid sandbox sync, asset allocations & live net worth tracking.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-sm shrink-0">
                  🔥
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">Deep Financial Planning</h4>
                  <p className="text-[11px] text-slate-400">FIRE calculators, accelerated mortgages, Rule of 72 & compound engines.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-sm shrink-0">
                  👥
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">Built for Households</h4>
                  <p className="text-[11px] text-slate-400">Two owners, instant invite codes, one single source of truth.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 pt-2 border-t border-white/10">
              <span>v4.5.1</span>
              <span>•</span>
              <span>Household Edition</span>
              <span>•</span>
              <span className="text-emerald-400">Encrypted Local-First</span>
            </div>
          </div>

          {/* RIGHT: Form Panel */}
          <div className="lg:col-span-6 bg-slate-900/80 rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl">
            {/* Tab Toggle */}
            <div className="flex rounded-xl bg-slate-800/80 p-1 border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'signin' ? (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Email or Username <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Password <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-800 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '👁️' : '🔒'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 text-emerald-500 focus:ring-0" />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    Pro Ready
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block animate-spin">⏳</span>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>

                {/* Instant Demo Sandbox Access */}
                <div className="pt-4 border-t border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">Explore Without Signing Up</span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Instant Access
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleInstantDemo}
                    disabled={demoLoading}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 hover:from-emerald-500/30 hover:via-teal-500/30 hover:to-blue-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white transition-all duration-200 shadow-md hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {demoLoading ? (
                      <span className="inline-block animate-spin mr-1">⏳</span>
                    ) : (
                      <span className="text-base">✨</span>
                    )}
                    <span>Launch Full Demo Workspace</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handlePrefillDemo}
                      className="text-[11px] font-medium text-slate-400 hover:text-purple-300 hover:underline transition-colors cursor-pointer"
                    >
                      Or prefill demo credentials (demo@execwealth.local / demo123)
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Create Account Form */
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Full Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    autoComplete="name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Email Address <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Password <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-800 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '👁️' : '🔒'}
                    </button>
                  </div>
                </div>

                {/* Account Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Household Membership
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('owner')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        role === 'owner'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>👑</span>
                      <span>Primary Owner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('coowner')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        role === 'coowner'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🤝</span>
                      <span>Co-Owner</span>
                    </button>
                  </div>
                </div>

                {role === 'coowner' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Household Invite Code <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. 7KX-4P2"
                      maxLength={8}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white font-mono uppercase tracking-widest text-xs focus:outline-none focus:border-emerald-500 transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Ask your primary owner for the 6-character code in Settings.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block animate-spin">⏳</span>
                  ) : (
                    <span>Create Free Account</span>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-500">
                  Data stored securely in encrypted local browser storage or Supabase cloud.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
