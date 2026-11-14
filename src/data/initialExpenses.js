export const initialExpensesData = {
  monthlyBudget: 3000,
  categories: [
    {
      id: "cat_1788699891018",
      label: "Housing & Utilities",
      color: "#3b82f6",
      icon: "home",
      limit: 1200
    },
    {
      id: "cat_1788788872263",
      label: "Grocery & Dining",
      color: "#10b981",
      icon: "shopping-bag",
      limit: 800
    },
    {
      id: "cat_1788788872264",
      label: "Transportation",
      color: "#f59e0b",
      icon: "car",
      limit: 400
    },
    {
      id: "cat_1788788872265",
      label: "Entertainment & Leisure",
      color: "#ec4899",
      icon: "film",
      limit: 350
    },
    {
      id: "cat_1788788872266",
      label: "Healthcare & Wellness",
      color: "#8b5cf6",
      icon: "heart-pulse",
      limit: 250
    }
  ],
  cards: [
    {
      id: "card_1788699872709",
      name: "Chetan Chase Sapphire",
      issuer: "VISA",
      masked: "5674",
      limit: 17600,
      paid: 0,
      gradient: "from-indigo-600 to-slate-900"
    },
    {
      id: "card_1788788094313",
      name: "Chetan Chase Amazon",
      issuer: "VISA",
      masked: "3976",
      limit: 35000,
      paid: 0,
      gradient: "from-indigo-600 to-slate-900"
    },
    {
      id: "card_1788788149446",
      name: "Chetan Citi Costco",
      issuer: "VISA",
      masked: "6924",
      limit: 10200,
      paid: 0,
      gradient: "from-emerald-600 to-teal-950"
    },
    {
      id: "card_1788788234637",
      name: "Chetan Apple",
      issuer: "MASTERCARD",
      masked: "8927",
      limit: 6000,
      paid: 0,
      gradient: "from-rose-600 to-slate-950"
    },
    {
      id: "card_1788788284174",
      name: "Chetan Bofa",
      issuer: "MASTERCARD",
      masked: "6921",
      limit: 35000,
      paid: 0,
      gradient: "from-rose-600 to-slate-950"
    }
  ],
  transactions: [
    {
      id: "tx_1788699895167",
      amount: 75.00,
      description: "Balance 1st week",
      cardId: "card_1788699872709",
      categoryId: "cat_1788788872263",
      date: "2026-09-06",
      isRecurring: false
    },
    {
      id: "tx_1788699895168",
      amount: 142.50,
      description: "Whole Foods Market",
      cardId: "card_1788699872709",
      categoryId: "cat_1788788872263",
      date: "2026-09-12",
      isRecurring: false
    },
    {
      id: "tx_1788699895169",
      amount: 55.20,
      description: "Chevron Fuel",
      cardId: "card_1788788149446",
      categoryId: "cat_1788788872264",
      date: "2026-09-15",
      isRecurring: false
    },
    {
      id: "tx_1788699895170",
      amount: 15.99,
      description: "Netflix Subscription",
      cardId: "card_1788788234637",
      categoryId: "cat_1788788872265",
      date: "2026-09-18",
      isRecurring: true
    }
  ],
  selectedCurrency: "USD"
};
