import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Button, Card, Badge } from '../ui';

export const PricingTab = () => {
  const { showToast } = useApp();

  const handleSelectPlan = (plan) => {
    showToast(`Selected ${plan} Plan (Sandbox preview)`, 'success');
  };

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever free',
      desc: 'Essential portfolio tracking for individual investors.',
      features: [
        'Up to 3 linked bank accounts',
        'Basic 401(k) and IRA tracker',
        'Monthly budget planner',
        'Local device storage',
        'Community support'
      ],
      current: false,
      cta: 'Current Plan'
    },
    {
      name: 'Executive Pro',
      price: '$19',
      period: 'per month',
      desc: 'Complete financial operating system with automated cloud sync.',
      features: [
        'Unlimited bank & brokerage accounts',
        'Full Supabase cloud synchronization',
        'IRS tax bracket & deduction simulator',
        'Interactive FIRE & mortgage tools',
        'Automated daily balance updates',
        'Priority encrypted backups'
      ],
      current: true,
      popular: true,
      cta: 'Upgrade to Pro'
    },
    {
      name: 'Executive Household',
      price: '$39',
      period: 'per month',
      desc: 'Designed for high-net-worth couples and family offices.',
      features: [
        'Everything in Pro, plus:',
        'Unlimited co-owners & spouse logins',
        'Financial advisor view-only access',
        'Multi-entity & trust tracking',
        'Dedicated account concierge',
        'Custom export & reporting schemas'
      ],
      current: false,
      cta: 'Get Household Suite'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <Badge variant="success">PLANS & BILLING</Badge>
        <h2 className="text-2xl font-black text-[var(--text-1)]">
          Track your wealth without spreadsheets.
        </h2>
        <p className="text-xs text-[var(--text-3)]">
          Simple, transparent plans tailored for disciplined households. Cancel or pause anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {plans.map(p => (
          <Card
            key={p.name}
            className={`p-6 flex flex-col justify-between relative transition-all ${
              p.popular
                ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                : ''
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-1)]">{p.name}</h3>
                <p className="text-xs text-[var(--text-3)] mt-1">{p.desc}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black font-mono text-[var(--text-1)]">{p.price}</span>
                <span className="text-xs text-[var(--text-3)]">{p.period}</span>
              </div>

              <div className="pt-4 border-t border-[var(--border)] space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
                  Included Capabilities:
                </span>
                <ul className="space-y-2 text-xs text-[var(--text-2)]">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[var(--border)]">
              <Button
                variant={p.current ? 'secondary' : 'primary'}
                className="w-full"
                onClick={() => handleSelectPlan(p.name)}
              >
                {p.cta}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
