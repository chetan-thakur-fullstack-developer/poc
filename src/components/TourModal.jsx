import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Sparkles, ArrowRight, X, ShieldCheck, TrendingUp, LayoutDashboard, Zap } from 'lucide-react';

export const TourModal = ({ isOpen, onClose }) => {
  const { setCurrentTab } = useApp();
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to Executive Wealth OS 💎',
      desc: 'Your command center for executive-grade personal finance. Designed for absolute clarity, high-speed tracking, and privacy.',
      tab: 'tab-dashboard',
      badge: 'Step 1 of 4: Dashboard Overview',
      icon: LayoutDashboard,
      focus: 'Focus on your Net Worth KPI cards, live monthly budget pace, and quick setup checklist.'
    },
    {
      title: 'Linked Accounts & Bank Sync 💳',
      desc: 'Connect checking accounts, savings, brokerages, and credit lines in one unified ledger.',
      tab: 'tab-accounts',
      badge: 'Step 2 of 4: Asset & Debt Tracking',
      icon: ShieldCheck,
      focus: 'Focus on keeping your depository and investment balances up to date with direct cloud sync.'
    },
    {
      title: 'Multi-Year Portfolio Tracker 📈',
      desc: 'Monitor compound growth across 401(k), Roth IRA, HSA, and ESPP with year-by-year asset allocation charts.',
      tab: 'tab-overview',
      badge: 'Step 3 of 4: Wealth Building',
      icon: TrendingUp,
      focus: 'Focus on your category breakdown table and multi-year historical growth curves.'
    },
    {
      title: 'FIRE & Financial Calculators ⚡',
      desc: 'Simulate retirement horizons, mortgage payoff schedules, and inflation purchasing power using 9 professional calculators.',
      tab: 'tab-blueprint',
      badge: 'Step 4 of 4: Advanced Modeling',
      icon: Zap,
      focus: 'Focus on the FIRE milestone calculator and mortgage acceleration simulator to design your future.'
    }
  ];

  const current = tourSteps[step];
  const IconComponent = current.icon;

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setCurrentTab(tourSteps[nextStep].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      setCurrentTab(tourSteps[prevStep].tab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="card w-full max-w-lg p-6 sm:p-8 space-y-6 bg-[var(--app-bg-2)] border border-emerald-500/30 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              {current.badge}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-1)] mt-0.5">{current.title}</h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed">
          {current.desc}
        </p>

        {/* Pro Focus Tip Box */}
        <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[var(--text-1)]">Pro Focus: </span>
            <span className="text-[var(--text-3)]">{current.focus}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-[var(--text-3)]">
            <span>Progress</span>
            <span>{Math.round(((step + 1) / tourSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-[var(--surface-3)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={`btn-secondary text-xs px-4 py-2 ${step === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Previous
          </button>

          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary text-xs px-3 py-2 cursor-pointer">
              End Tour
            </button>
            <button onClick={handleNext} className="btn-primary text-xs px-5 py-2 cursor-pointer flex items-center gap-1.5">
              <span>{step === tourSteps.length - 1 ? 'Get Started 🎉' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
