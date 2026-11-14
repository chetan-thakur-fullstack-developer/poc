export const initialExpensesData = {
  monthlyBudget: 3000,
  categories: [
    {
      id: "cat_housing",
      label: "Housing & Utilities",
      color: "#3b82f6",
      icon: "home",
      limit: 1200
    },
    {
      id: "cat_grocery",
      label: "Grocery & Dining",
      color: "#10b981",
      icon: "shopping-bag",
      limit: 800
    },
    {
      id: "cat_transport",
      label: "Transportation",
      color: "#f59e0b",
      icon: "car",
      limit: 400
    },
    {
      id: "cat_entertainment",
      label: "Entertainment & Leisure",
      color: "#ec4899",
      icon: "film",
      limit: 350
    },
    {
      id: "cat_healthcare",
      label: "Healthcare & Wellness",
      color: "#8b5cf6",
      icon: "heart-pulse",
      limit: 250
    }
  ],
  cards: [
    {
      id: "card_1788699872709",
      name: "Chase Sapphire Preferred",
      issuer: "VISA",
      masked: "5674",
      limit: 17600,
      paid: 0,
      gradient: "from-indigo-600 to-slate-900"
    },
    {
      id: "card_1788788094313",
      name: "Chase Amazon Prime",
      issuer: "VISA",
      masked: "3976",
      limit: 35000,
      paid: 0,
      gradient: "from-indigo-600 to-slate-900"
    },
    {
      id: "card_1788788149446",
      name: "Citi Costco Anywhere",
      issuer: "VISA",
      masked: "6924",
      limit: 10200,
      paid: 0,
      gradient: "from-emerald-600 to-teal-950"
    },
    {
      id: "card_1788788234637",
      name: "Apple Card",
      issuer: "MASTERCARD",
      masked: "8927",
      limit: 6000,
      paid: 0,
      gradient: "from-rose-600 to-slate-950"
    }
  ],
  transactions: [
    {
      id: "demo_tx_1",
      amount: 75.00,
      description: "Balance 1st week",
      cardId: "card_1788699872709",
      categoryId: "cat_grocery",
      date: "2026-09-06",
      isRecurring: false
    },
    {
      id: "demo_tx_2",
      amount: 142.50,
      description: "Whole Foods Market",
      cardId: "card_1788699872709",
      categoryId: "cat_grocery",
      date: "2026-09-12",
      isRecurring: false
    },
    {
      id: "demo_tx_3",
      amount: 55.20,
      description: "Chevron Fuel",
      cardId: "card_1788788149446",
      categoryId: "cat_transport",
      date: "2026-09-15",
      isRecurring: false
    },
    {
      id: "demo_tx_4",
      amount: 15.99,
      description: "Netflix Subscription",
      cardId: "card_1788788234637",
      categoryId: "cat_entertainment",
      date: "2026-09-18",
      isRecurring: true
    }
  ],
  selectedCurrency: "USD"
};

// Clean expenses for a real user
export const getCleanExpenses = () => ({
  monthlyBudget: 3000,
  categories: [
    { id: "cat_housing", label: "Housing & Utilities", color: "#3b82f6", icon: "home", limit: 1200 },
    { id: "cat_grocery", label: "Grocery & Dining", color: "#10b981", icon: "shopping-bag", limit: 800 },
    { id: "cat_transport", label: "Transportation", color: "#f59e0b", icon: "car", limit: 400 },
    { id: "cat_entertainment", label: "Entertainment", color: "#ec4899", icon: "film", limit: 350 },
    { id: "cat_healthcare", label: "Healthcare", color: "#8b5cf6", icon: "heart-pulse", limit: 250 }
  ],
  cards: [],
  transactions: [],
  selectedCurrency: "USD"
});
