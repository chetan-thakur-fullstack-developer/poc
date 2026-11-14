export const initialAccountsData = {
  selectedCurrency: "USD",
  lastSync: "2026-02-10T14:32:00.000Z",
  linked: [
    {
      id: "demo_chase_checking",
      name: "Total Checking",
      institution: "Chase",
      type: "checking",
      mask: "4821",
      balance: 8420.55,
      color: "#8B5CF6",
      source: "plaid",
      accountId: "plaid_acct_chase_check_001",
      lastSynced: "2026-02-10T14:32:00.000Z",
      mapping: { portfolioKey: "cd", year: "2026", enabled: true }
    },
    {
      id: "demo_chase_sapphire",
      name: "Sapphire Credit Card",
      institution: "Chase",
      type: "credit",
      mask: "7712",
      balance: 2384.19,
      color: "#FB7185",
      source: "plaid",
      accountId: "plaid_acct_chase_sapphire_002",
      lastSynced: "2026-02-10T14:32:00.000Z"
    },
    {
      id: "demo_fidelity_brokerage",
      name: "Brokerage",
      institution: "Fidelity",
      type: "investment",
      mask: "4402",
      balance: 127340.88,
      color: "#8B5CF6",
      source: "plaid",
      accountId: "plaid_acct_fidelity_broker_003",
      lastSynced: "2026-02-10T14:32:00.000Z",
      mapping: { portfolioKey: "espp", year: "2026", enabled: true }
    },
    {
      id: "demo_vanguard_401k",
      name: "401(k)",
      institution: "Vanguard",
      type: "retirement",
      mask: "2210",
      balance: 136638.00,
      color: "#8B5CF6",
      source: "plaid",
      accountId: "plaid_acct_vanguard_401k_004",
      lastSynced: "2026-02-10T14:32:00.000Z",
      mapping: { portfolioKey: "k401", year: "2026", enabled: true }
    }
  ]
};

// Clean accounts for a real user
export const getCleanAccounts = () => ({
  selectedCurrency: "USD",
  lastSync: null,
  linked: []
});
