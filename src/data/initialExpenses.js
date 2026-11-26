export const initialExpensesData = {
  monthlyBudget: 4500,
  categories: [
    {
      id: "cat_groceries",
      label: "Groceries",
      color: "#10B981",
      icon: "shopping-cart",
      limit: 800
    },
    {
      id: "cat_dining",
      label: "Dining & Restaurants",
      color: "#F59E0B",
      icon: "utensils",
      limit: 500
    },
    {
      id: "cat_subs",
      label: "Subscriptions & SaaS",
      color: "#8B5CF6",
      icon: "repeat",
      limit: 150
    },
    {
      id: "cat_shopping",
      label: "Shopping & Retail",
      color: "#3B82F6",
      icon: "shopping-bag",
      limit: 600
    },
    {
      id: "cat_transport",
      label: "Transport & Gas",
      color: "#EC4899",
      icon: "car",
      limit: 300
    },
    {
      id: "cat_travel",
      label: "Travel & Lodging",
      color: "#6366F1",
      icon: "plane",
      limit: 1000
    },
    {
      id: "cat_bills",
      label: "Utilities & Bills",
      color: "#14B8A6",
      icon: "zap",
      limit: 700
    },
    {
      id: "cat_ent",
      label: "Entertainment",
      color: "#F43F5E",
      icon: "film",
      limit: 450
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
      categoryId: "cat_groceries",
      date: "2026-09-06",
      isRecurring: false
    },
    {
      id: "demo_tx_2",
      amount: 142.50,
      description: "Whole Foods Market",
      cardId: "card_1788699872709",
      categoryId: "cat_groceries",
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
      categoryId: "cat_subs",
      date: "2026-09-18",
      isRecurring: true
    }
  ],
  selectedCurrency: "USD"
};

// Clean expenses for a real user
export const getCleanExpenses = () => ({
  monthlyBudget: 0,
  categories: [
    { id: "cat_groceries", label: "Groceries", color: "#10B981", icon: "shopping-cart", limit: 800 },
    { id: "cat_dining", label: "Dining & Restaurants", color: "#F59E0B", icon: "utensils", limit: 500 },
    { id: "cat_subs", label: "Subscriptions & SaaS", color: "#8B5CF6", icon: "repeat", limit: 150 },
    { id: "cat_shopping", label: "Shopping & Retail", color: "#3B82F6", icon: "shopping-bag", limit: 600 },
    { id: "cat_transport", label: "Transport & Gas", color: "#EC4899", icon: "car", limit: 300 }
  ],
  cards: [],
  transactions: [],
  selectedCurrency: "USD"
});
