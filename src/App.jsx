import React from 'react';
import { useApp } from './context/AppContext.jsx';
import { useAuth } from './context/AuthContext.jsx';

import { LoginView } from './components/LoginView.jsx';
import { Header } from './components/Header.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { MobileNav } from './components/MobileNav.jsx';
import { Toast } from './components/Toast.jsx';

import { DashboardTab } from './components/tabs/DashboardTab.jsx';
import { AccountsTab } from './components/tabs/AccountsTab.jsx';
import { PortfolioTab } from './components/tabs/PortfolioTab.jsx';
import { TransactionsTab } from './components/tabs/TransactionsTab.jsx';
import { ExpensesTab } from './components/tabs/ExpensesTab.jsx';
import { GoalsTab } from './components/tabs/GoalsTab.jsx';
import { TaxTab } from './components/tabs/TaxTab.jsx';
import { CreditTab } from './components/tabs/CreditTab.jsx';
import { BlueprintTab } from './components/tabs/BlueprintTab.jsx';
import { PricingTab } from './components/tabs/PricingTab.jsx';
import { SettingsTab } from './components/tabs/SettingsTab.jsx';

import { AuthModal } from './components/modals/AuthModal.jsx';
import { AddAccountModal } from './components/modals/AddAccountModal.jsx';
import { AddTransactionModal } from './components/modals/AddTransactionModal.jsx';
import { QuickAddModal } from './components/modals/QuickAddModal.jsx';
import { CommandMenu } from './components/modals/CommandMenu.jsx';
import { TourModal } from './components/TourModal.jsx';
import { ConfirmModal } from './components/modals/ConfirmModal.jsx';
import { CreateGoalModal } from './components/modals/CreateGoalModal.jsx';
import { GoalDetailModal } from './components/modals/GoalDetailModal.jsx';

export const App = () => {
  const { currentTab, modals, closeModal } = useApp();
  const { user } = useAuth();
  const mainScrollRef = React.useRef(null);

  React.useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentTab]);

  // If user is not authenticated, display full-screen Login View
  if (!user) {
    return (
      <>
        <LoginView />
        <Toast />
      </>
    );
  }

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'tab-dashboard':
        return <DashboardTab />;
      case 'tab-accounts':
        return <AccountsTab />;
      case 'tab-overview':
        return <PortfolioTab />;
      case 'tab-transactions':
        return <TransactionsTab />;
      case 'tab-expenses':
        return <ExpensesTab />;
      case 'tab-goals':
        return <GoalsTab />;
      case 'tab-tax':
        return <TaxTab />;
      case 'tab-credit':
        return <CreditTab />;
      case 'tab-blueprint':
        return <BlueprintTab />;
      case 'tab-pricing':
        return <PricingTab />;
      case 'tab-settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text-1)] select-none">
      {/* Left Sidebar (Desktop) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Bar */}
        <Header />

        {/* Scrollable View Container */}
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {renderActiveTab()}

            {/* Financial Disclaimer Footer */}
            <footer className="pt-6 border-t border-[var(--border)] text-center text-[10px] text-[var(--text-4)] leading-relaxed max-w-3xl mx-auto pb-4">
              <p>
                <strong className="text-[var(--text-3)]">Financial Disclaimer:</strong> LedgerJourney is a personal finance modeling, budgeting, and educational tool. We are not a registered investment advisor or broker-dealer. All projections, calculations, and simulations are for informational and educational purposes only and do not constitute formal financial, tax, or legal advice.
              </p>
            </footer>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Modals & Dialogs */}
      <AuthModal />
      <AddAccountModal />
      <AddTransactionModal />
      <QuickAddModal />
      <CommandMenu />
      <TourModal isOpen={modals.tour} onClose={() => closeModal('tour')} />

      {/* Toast Notification Container & Custom Modals */}
      <Toast />
      <ConfirmModal />
      <CreateGoalModal />
      <GoalDetailModal />
    </div>
  );
};
