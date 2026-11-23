import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { AreaChart } from '../charts/AreaChart.jsx';
import { Zap, Calculator, Home, Car, Rocket, Flame, Shield, TrendingDown, Sparkles } from 'lucide-react';

export const BlueprintTab = () => {
  const { formatMoney } = useApp();
  const [activeTool, setActiveTool] = useState('paycheck');

  const tools = [
    { id: 'paycheck', label: 'Paycheck', icon: Calculator, desc: 'Take-home pay & tax withholdings' },
    { id: 'rule72', label: 'Rule of 72', icon: Zap, desc: 'Doubling time & required return' },
    { id: 'mortgage', label: 'Mortgage', icon: Home, desc: 'Accelerated payoff & amortization' },
    { id: 'vehicle', label: 'Vehicle', icon: Car, desc: 'Lease vs buy 3-year analysis' },
    { id: 'projections', label: 'Growth', icon: Rocket, desc: 'Compound interest milestones' },
    { id: 'fire', label: 'Freedom (FIRE)', icon: Flame, desc: '4% rule & retirement runway' },
    { id: 'emergency', label: 'Emergency', icon: Shield, desc: 'Liquidity runway & safety buffer' },
    { id: 'inflation', label: 'Inflation', icon: TrendingDown, desc: 'Purchasing power erosion' },
    { id: 'insights', label: 'Health Ratios', icon: Sparkles, desc: 'Tactical analysis & DTI' }
  ];

  // 1. Paycheck State
  const [salary, setSalary] = useState(150000);
  const [payFreq, setPayFreq] = useState(26);
  const [filingStatus, setFilingStatus] = useState('mfj');
  const [k401Pct, setK401Pct] = useState(8);
  const [stateTaxPct, setStateTaxPct] = useState(4.5);
  const [healthIns, setHealthIns] = useState(150);
  const [hsa, setHsa] = useState(200);

  const grossPerCheck = salary / payFreq;
  const k401PerCheck = grossPerCheck * (k401Pct / 100);
  const taxableFed = Math.max(0, grossPerCheck - k401PerCheck - Number(healthIns) - Number(hsa));
  const fedTaxRate = filingStatus === 'mfj' ? 0.12 : 0.18;
  const fedTaxCheck = taxableFed * fedTaxRate;
  const ssCheck = Math.min(grossPerCheck, 168600 / payFreq) * 0.062;
  const medCheck = grossPerCheck * 0.0145;
  const stateTaxCheck = taxableFed * (stateTaxPct / 100);
  const totalDed = k401PerCheck + Number(healthIns) + Number(hsa) + fedTaxCheck + ssCheck + medCheck + stateTaxCheck;
  const netCheck = Math.max(0, grossPerCheck - totalDed);
  const annualNet = netCheck * payFreq;
  const effTax = Math.round(((fedTaxCheck + ssCheck + medCheck + stateTaxCheck) / grossPerCheck) * 100);

  // 2. Rule of 72 State
  const [r72Principal, setR72Principal] = useState(50000);
  const [r72Rate, setR72Rate] = useState(7);
  const doublingYears = (72 / (r72Rate || 1)).toFixed(1);

  // 3. Mortgage State
  const [homePrice, setHomePrice] = useState(650000);
  const [downPct, setDownPct] = useState(20);
  const [mortRate, setMortRate] = useState(6.5);
  const [loanYears, setLoanYears] = useState(30);
  const [extraPrin, setExtraPrin] = useState(400);
  const [propTaxRate, setPropTaxRate] = useState(1.2);
  const [annualIns, setAnnualIns] = useState(1800);

  const loanAmt = homePrice * (1 - downPct / 100);
  const mRate = mortRate / 100 / 12;
  const mMonths = loanYears * 12;
  const stdPI = mRate > 0 ? (loanAmt * (mRate * Math.pow(1 + mRate, mMonths))) / (Math.pow(1 + mRate, mMonths) - 1) : loanAmt / mMonths;
  const monthlyPropTax = (homePrice * (propTaxRate / 100)) / 12;
  const monthlyIns = annualIns / 12;
  const totalMonthlyOut = stdPI + Number(extraPrin) + monthlyPropTax + monthlyIns;

  let stdInt = stdPI * mMonths - loanAmt;
  let accMonths = mMonths;
  let accInt = stdInt;
  if (extraPrin > 0 && mRate > 0) {
    let bal = loanAmt;
    let m = 0;
    let intSum = 0;
    while (bal > 0 && m < 600) {
      const im = bal * mRate;
      intSum += im;
      const prin = Math.min(bal, (stdPI - im) + Number(extraPrin));
      bal -= prin;
      m++;
    }
    accMonths = m;
    accInt = intSum;
  }
  const mortSaved = Math.max(0, stdInt - accInt);
  const yearsSaved = ((mMonths - accMonths) / 12).toFixed(1);

  // 4. Vehicle State
  const [carPrice, setCarPrice] = useState(45000);
  const [leaseMo, setLeaseMo] = useState(550);
  const [leaseDown, setLeaseDown] = useState(3000);
  const [leaseTerm, setLeaseTerm] = useState(36);
  const [leaseMiles, setLeaseMiles] = useState(12000);
  const [buyLoanRate, setBuyLoanRate] = useState(6.0);
  const [buyDown, setBuyDown] = useState(5000);

  const totalLeaseCost = leaseDown + (leaseMo * leaseTerm);
  const buyLoanAmt = carPrice - buyDown;
  const bRate = buyLoanRate / 100 / 12;
  const bMonths = leaseTerm; // 3-year analysis comparison
  const buyMoPayment = bRate > 0 ? (buyLoanAmt * (bRate * Math.pow(1 + bRate, 60))) / (Math.pow(1 + bRate, 60) - 1) : buyLoanAmt / 60;
  const totalBuyCost3Yrs = buyDown + (buyMoPayment * leaseTerm) - (carPrice * 0.55); // estimated residual value after 3 yrs (~45% depreciation)

  // 5. Projections State
  const [projInit, setProjInit] = useState(50000);
  const [projMo, setProjMo] = useState(1500);
  const [projRate, setProjRate] = useState(8);

  const calcFV = (yrs) => {
    const r = projRate / 100 / 12;
    const n = yrs * 12;
    const fvPrinc = projInit * Math.pow(1 + r, n);
    const fvPmt = projMo * ((Math.pow(1 + r, n) - 1) / r);
    return Math.round(fvPrinc + fvPmt);
  };

  // 6. FIRE State
  const [fireSpend, setFireSpend] = useState(85000);
  const [swr, setSwr] = useState(4.0);
  const [nestEgg, setNestEgg] = useState(420000);
  const fireTarget = fireSpend / (swr / 100);
  const firePct = Math.min(100, Math.round((nestEgg / fireTarget) * 100));

  // 7. Emergency State
  const [efExp, setEfExp] = useState(6000);
  const [efCash, setEfCash] = useState(45000);
  const efMonths = (efCash / (efExp || 1)).toFixed(1);

  // 8. Inflation State
  const [infCash, setInfCash] = useState(100000);
  const [infRate, setInfRate] = useState(3.5);
  const infPower = (yrs) => Math.round(infCash / Math.pow(1 + infRate / 100, yrs));

  // 9. Health Ratios State
  const [monthlyGrossIncome, setMonthlyGrossIncome] = useState(12500);
  const [monthlyDebtPay, setMonthlyDebtPay] = useState(2400);
  const dtiRatio = Math.round((monthlyDebtPay / (monthlyGrossIncome || 1)) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[var(--text-1)]">Financial Tools & Calculators</h2>
        <p className="text-xs text-[var(--text-3)]">
          Comprehensive native executive modeling suite for paychecks, mortgages, vehicle lease vs. buy, FIRE, and compound growth.
        </p>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)] border border-[var(--border)]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. PAYCHECK CALCULATOR */}
      {activeTool === 'paycheck' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-emerald-500/15 via-[var(--surface)] to-[var(--surface)] border-emerald-500/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Net Pay Per Check</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(netCheck, 2)}</div>
                <p className="text-xs text-[var(--text-3)] mt-1">Direct deposit take-home</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Annual Take-Home</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{formatMoney(annualNet, 0)}</div>
                <p className="text-xs text-[var(--text-3)] mt-1">After all taxes & deductions</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Retirement (401k)</span>
                <div className="text-2xl font-black font-mono text-purple-400 mt-1">{formatMoney(k401PerCheck, 2)}</div>
                <p className="text-xs text-[var(--text-3)] mt-1">{k401Pct}% pre-tax per check</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Effective Tax Rate</span>
                <div className="text-2xl font-black font-mono text-blue-400 mt-1">{effTax}%</div>
                <p className="text-xs text-[var(--text-3)] mt-1">Federal + FICA + State</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Compensation & Frequency</h3>
              <div>
                <label className="field-label">Annual Gross Salary: {formatMoney(salary)}</label>
                <input
                  type="range"
                  min="40000"
                  max="400000"
                  step="5000"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Pay Frequency</label>
                  <select
                    value={payFreq}
                    onChange={(e) => setPayFreq(Number(e.target.value))}
                    className="input"
                  >
                    <option value={26}>Bi-Weekly (26/yr)</option>
                    <option value={24}>Semi-Monthly (24/yr)</option>
                    <option value={12}>Monthly (12/yr)</option>
                    <option value={52}>Weekly (52/yr)</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Filing Status</label>
                  <select
                    value={filingStatus}
                    onChange={(e) => setFilingStatus(e.target.value)}
                    className="input"
                  >
                    <option value="mfj">Married Filing Jointly</option>
                    <option value="single">Single</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Advanced Pre-Tax Deductions</h3>
              <div>
                <label className="field-label">401(k) Contribution: {k401Pct}%</label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={k401Pct}
                  onChange={(e) => setK401Pct(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Health Insurance ($/check)</label>
                  <input
                    type="number"
                    value={healthIns}
                    onChange={(e) => setHealthIns(e.target.value)}
                    className="input font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="field-label">HSA / FSA ($/check)</label>
                  <input
                    type="number"
                    value={hsa}
                    onChange={(e) => setHsa(e.target.value)}
                    className="input font-mono text-xs"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-[var(--border)] text-xs space-y-1.5 text-[var(--text-2)]">
                <div className="flex justify-between font-bold">
                  <span>Gross Paycheck:</span>
                  <span className="font-mono text-[var(--text-1)]">{formatMoney(grossPerCheck, 2)}</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>- 401(k) Retirement:</span>
                  <span className="font-mono">-{formatMoney(k401PerCheck, 2)}</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>- Health Insurance:</span>
                  <span className="font-mono">-{formatMoney(Number(healthIns), 2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>- HSA / FSA Savings:</span>
                  <span className="font-mono">-{formatMoney(Number(hsa), 2)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>- Federal Tax:</span>
                  <span className="font-mono">-{formatMoney(fedTaxCheck, 2)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>- FICA (Social Security & Med):</span>
                  <span className="font-mono">-{formatMoney(ssCheck + medCheck, 2)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>- State Tax ({stateTaxPct}%):</span>
                  <span className="font-mono">-{formatMoney(stateTaxCheck, 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. RULE OF 72 */}
      {activeTool === 'rule72' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-amber-500/15 via-[var(--surface)] to-[var(--surface)] border-amber-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Doubling Time</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">{doublingYears} Years</div>
                <p className="text-xs text-[var(--text-3)] mt-1">Time required to double initial principal</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Value in {doublingYears} Yrs</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{formatMoney(r72Principal * 2, 0)}</div>
                <p className="text-xs text-[var(--text-3)] mt-1">2x capital growth</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Value in {Number(doublingYears) * 2} Yrs</span>
                <div className="text-2xl font-black font-mono text-purple-400 mt-1">{formatMoney(r72Principal * 4, 0)}</div>
                <p className="text-xs text-[var(--text-3)] mt-1">4x capital growth</p>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-sm text-[var(--text-1)]">Rule of 72 Parameters</h3>
            <div>
              <label className="field-label">Starting Principal Amount: {formatMoney(r72Principal)}</label>
              <input
                type="range"
                min="10000"
                max="500000"
                step="10000"
                value={r72Principal}
                onChange={(e) => setR72Principal(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="field-label">Annual Rate of Return: {r72Rate}%</label>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={r72Rate}
                onChange={(e) => setR72Rate(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. MORTGAGE CALCULATOR */}
      {activeTool === 'mortgage' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-blue-500/15 via-[var(--surface)] to-[var(--surface)] border-blue-500/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Total Monthly Out-of-Pocket</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(totalMonthlyOut, 2)}</div>
                <p className="text-xs text-[var(--text-3)] mt-1">P&I + Extra + Taxes + Insurance</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Interest Saved</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{formatMoney(mortSaved, 0)}</div>
                <p className="text-xs text-[var(--text-3)] mt-1">Kept in your pocket</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Time Saved Off Loan</span>
                <div className="text-2xl font-black font-mono text-purple-400 mt-1">{yearsSaved} Years</div>
                <p className="text-xs text-[var(--text-3)] mt-1">Accelerated freedom date</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Loan Amount</span>
                <div className="text-2xl font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(loanAmt, 0)}</div>
                <p className="text-xs text-[var(--text-3)] mt-1">{downPct}% down payment</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Property & Loan Details</h3>
              <div>
                <label className="field-label">Home Purchase Price: {formatMoney(homePrice)}</label>
                <input
                  type="range"
                  min="200000"
                  max="1500000"
                  step="25000"
                  value={homePrice}
                  onChange={(e) => setHomePrice(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Down Payment: {downPct}%</label>
                  <input
                    type="range"
                    min="3"
                    max="40"
                    step="1"
                    value={downPct}
                    onChange={(e) => setDownPct(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="field-label">Interest Rate: {mortRate}%</label>
                  <input
                    type="range"
                    min="3.0"
                    max="10.0"
                    step="0.1"
                    value={mortRate}
                    onChange={(e) => setMortRate(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="field-label">Loan Term</label>
                  <select
                    value={loanYears}
                    onChange={(e) => setLoanYears(Number(e.target.value))}
                    className="input"
                  >
                    <option value={30}>30 Years</option>
                    <option value={15}>15 Years</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Property Tax (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={propTaxRate}
                    onChange={(e) => setPropTaxRate(Number(e.target.value))}
                    className="input font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="field-label">Annual Insurance ($)</label>
                  <input
                    type="number"
                    step="100"
                    value={annualIns}
                    onChange={(e) => setAnnualIns(Number(e.target.value))}
                    className="input font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Accelerated Payoff & Carrying Costs</h3>
              <div>
                <label className="field-label">Extra Monthly Principal: {formatMoney(extraPrin)}/mo</label>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="100"
                  value={extraPrin}
                  onChange={(e) => setExtraPrin(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-[11px] text-[var(--text-3)]">Adding extra principal directly slashes the amortization schedule.</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Standard Monthly P&I:</span>
                  <span className="font-mono text-[var(--text-1)]">{formatMoney(stdPI, 2)}</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>Monthly Property Tax:</span>
                  <span className="font-mono">+{formatMoney(monthlyPropTax, 2)}</span>
                </div>
                <div className="flex justify-between text-indigo-400">
                  <span>Monthly Insurance:</span>
                  <span className="font-mono">+{formatMoney(monthlyIns, 2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-[var(--border)]">
                  <span>Accelerated Payoff Term:</span>
                  <span className="font-mono">{(accMonths / 12).toFixed(1)} Years (instead of {loanYears} yrs)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VEHICLE */}
      {activeTool === 'vehicle' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-indigo-500/15 via-[var(--surface)] to-[var(--surface)] border-indigo-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">3-Year Lease Total Cost</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(totalLeaseCost, 0)}</div>
                <p className="text-xs text-[var(--text-3)] mt-1">{leaseTerm} mo @ {formatMoney(leaseMo)}/mo + {formatMoney(leaseDown)} down</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">3-Year Buy Net Cost</span>
                <div className="text-2xl font-black font-mono text-purple-400 mt-1">{formatMoney(Math.round(totalBuyCost3Yrs), 0)}</div>
                <p className="text-xs text-[var(--text-3)] mt-1">Includes 45% residual value refund</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Recommendation</span>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  {totalLeaseCost < totalBuyCost3Yrs ? 'Leasing is Cheaper' : 'Buying is Cheaper'}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Based on 3-year net cash outflow</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Vehicle & Lease Parameters</h3>
              <div>
                <label className="field-label">Vehicle MSRP / Purchase Price: {formatMoney(carPrice)}</label>
                <input
                  type="range"
                  min="20000"
                  max="100000"
                  step="2500"
                  value={carPrice}
                  onChange={(e) => setCarPrice(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Monthly Lease Payment</label>
                  <input
                    type="number"
                    value={leaseMo}
                    onChange={(e) => setLeaseMo(Number(e.target.value))}
                    className="input font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="field-label">Lease Down Payment</label>
                  <input
                    type="number"
                    value={leaseDown}
                    onChange={(e) => setLeaseDown(Number(e.target.value))}
                    className="input font-mono text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Lease Term (Months)</label>
                  <select
                    value={leaseTerm}
                    onChange={(e) => setLeaseTerm(Number(e.target.value))}
                    className="input"
                  >
                    <option value={24}>24 Months</option>
                    <option value={36}>36 Months</option>
                    <option value={48}>48 Months</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Annual Mileage Allowance</label>
                  <select
                    value={leaseMiles}
                    onChange={(e) => setLeaseMiles(Number(e.target.value))}
                    className="input"
                  >
                    <option value={10000}>10,000 miles/yr</option>
                    <option value={12000}>12,000 miles/yr</option>
                    <option value={15000}>15,000 miles/yr</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Buy Loan Parameters (5-Yr Loan)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Loan Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={buyLoanRate}
                    onChange={(e) => setBuyLoanRate(Number(e.target.value))}
                    className="input font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="field-label">Loan Down Payment ($)</label>
                  <input
                    type="number"
                    step="500"
                    value={buyDown}
                    onChange={(e) => setBuyDown(Number(e.target.value))}
                    className="input font-mono text-xs"
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Monthly Buy Payment (5yr loan):</span>
                  <span className="font-mono text-[var(--text-1)]">{formatMoney(buyMoPayment, 2)}</span>
                </div>
                <div className="flex justify-between text-indigo-400">
                  <span>Estimated Residual Value (Yr 3):</span>
                  <span className="font-mono">+{formatMoney(carPrice * 0.55, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PROJECTIONS */}
      {activeTool === 'projections' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-purple-500/15 via-[var(--surface)] to-[var(--surface)] border-purple-500/30">
            <h3 className="font-bold text-base text-[var(--text-1)]">Compound Growth Projections</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="field-label">Initial Balance: {formatMoney(projInit)}</label>
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="10000"
                  value={projInit}
                  onChange={(e) => setProjInit(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="field-label">Monthly Contribution: {formatMoney(projMo)}</label>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={projMo}
                  onChange={(e) => setProjMo(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="field-label">Annual Return Rate: {projRate}%</label>
                <input
                  type="range"
                  min="4"
                  max="15"
                  step="1"
                  value={projRate}
                  onChange={(e) => setProjRate(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>
          <AreaChart
            title="30-Year Compound Growth Trajectory"
            color="#8B5CF6"
            height={260}
            data={[
              { label: 'Year 0', value: projInit },
              { label: 'Year 5', value: calcFV(5) },
              { label: 'Year 10', value: calcFV(10) },
              { label: 'Year 15', value: calcFV(15) },
              { label: 'Year 20', value: calcFV(20) },
              { label: 'Year 25', value: calcFV(25) },
              { label: 'Year 30', value: calcFV(30) }
            ]}
          />
        </div>
      )}

      {/* 6. FIRE */}
      {activeTool === 'fire' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-emerald-500/15 via-[var(--surface)] to-[var(--surface)] border-emerald-500/30">
            <h3 className="font-bold text-base text-[var(--text-1)]">Freedom / FIRE Runway</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">FIRE Target Nest Egg</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(fireTarget, 0)}</div>
                <p className="text-xs text-[var(--text-3)] mt-1">Based on {swr}% safe withdrawal rate</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Current Progress</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{firePct}% Complete</div>
                <p className="text-xs text-[var(--text-3)] mt-1">{formatMoney(nestEgg)} accumulated</p>
              </div>
              <div>
                <label className="field-label">Annual Spend: {formatMoney(fireSpend)}</label>
                <input
                  type="range"
                  min="40000"
                  max="200000"
                  step="5000"
                  value={fireSpend}
                  onChange={(e) => setFireSpend(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. EMERGENCY */}
      {activeTool === 'emergency' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-blue-500/15 via-[var(--surface)] to-[var(--surface)] border-blue-500/30">
            <h3 className="font-bold text-base text-[var(--text-1)]">Emergency Liquidity Runway</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Liquidity Runway</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">{efMonths} Months</div>
                <p className="text-xs text-[var(--text-3)] mt-1">Safety buffer coverage</p>
              </div>
              <div>
                <label className="field-label">Monthly Expenses: {formatMoney(efExp)}</label>
                <input
                  type="range"
                  min="3000"
                  max="15000"
                  step="500"
                  value={efExp}
                  onChange={(e) => setEfExp(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="field-label">Emergency Cash: {formatMoney(efCash)}</label>
                <input
                  type="range"
                  min="10000"
                  max="150000"
                  step="5000"
                  value={efCash}
                  onChange={(e) => setEfCash(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. INFLATION */}
      {activeTool === 'inflation' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-rose-500/15 via-[var(--surface)] to-[var(--surface)] border-rose-500/30">
            <h3 className="font-bold text-base text-[var(--text-1)]">Inflation Purchasing Power Erosion</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="field-label">Starting Cash Amount: {formatMoney(infCash)}</label>
                <input
                  type="range"
                  min="25000"
                  max="500000"
                  step="25000"
                  value={infCash}
                  onChange={(e) => setInfCash(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
              <div>
                <label className="field-label">Annual Inflation Rate: {infRate}%</label>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.5"
                  value={infRate}
                  onChange={(e) => setInfRate(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[var(--surface-2)]">
                <span className="text-[10px] text-[var(--text-3)] uppercase font-bold">10 Years</span>
                <p className="text-base font-black text-rose-400 mt-1">{formatMoney(infPower(10), 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-2)]">
                <span className="text-[10px] text-[var(--text-3)] uppercase font-bold">20 Years</span>
                <p className="text-base font-black text-rose-400 mt-1">{formatMoney(infPower(20), 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-2)]">
                <span className="text-[10px] text-[var(--text-3)] uppercase font-bold">30 Years</span>
                <p className="text-base font-black text-rose-400 mt-1">{formatMoney(infPower(30), 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. INSIGHTS / HEALTH RATIOS */}
      {activeTool === 'insights' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-emerald-500/15 via-[var(--surface)] to-[var(--surface)] border-emerald-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Debt-to-Income (DTI) Ratio</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">{dtiRatio}%</div>
                <p className="text-xs text-[var(--text-3)] mt-1">{dtiRatio <= 36 ? 'Healthy ratio (<36%)' : 'High debt burden (>36%)'}</p>
              </div>
              <div>
                <label className="field-label">Monthly Gross Income: {formatMoney(monthlyGrossIncome)}</label>
                <input
                  type="range"
                  min="3000"
                  max="30000"
                  step="1000"
                  value={monthlyGrossIncome}
                  onChange={(e) => setMonthlyGrossIncome(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div>
                <label className="field-label">Monthly Debt Payments: {formatMoney(monthlyDebtPay)}</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="200"
                  value={monthlyDebtPay}
                  onChange={(e) => setMonthlyDebtPay(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
