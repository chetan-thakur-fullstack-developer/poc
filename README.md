# Executive Wealth · React + Node.js API + Supabase OS

A complete personal finance and household wealth management operating system converted from a monolithic single-file application into a modern, ready-to-deploy **React 18 SPA**, **Node.js Express API**, and **Supabase PostgreSQL** cloud backend.

---

## 🚀 Key Features Converted

- **Modern React 18 Architecture**: Clean component modularity, React Hooks, Context API, responsive Tailwind CSS design.
- **Node.js Express Backend (`server/`)**: Dedicated API server with endpoints for authentication, portfolios, linked accounts, expenses, transactions, and full cloud synchronization.
- **Supabase PostgreSQL Integration**: Direct connection with Supabase for cloud auth, encrypted storage, and real-time database queries with Row Level Security (RLS).
- **Credentials & Login Separation (`.env`)**: All sensitive keys, tokens, and database URLs are stored securely in `.env` (with `.env.example` template) and excluded from git.
- **Executive Wealth Suite (All 11 Views)**:
  1. **Dashboard**: Live net worth KPIs, asset allocation mix, budget pace, recent transactions.
  2. **Accounts**: Linked checking, savings, credit cards, and brokerage accounts with balances.
  3. **Portfolio**: Multi-year (2023–2026) tracker for 401(k), Roth IRA, Trad IRA, HSA, ESPP, CD/Cash, and 529.
  4. **Transactions**: Searchable, filterable ledger with category tagging and receipt logging.
  5. **Budget & Spend**: Monthly budget target, category limits, card utilization, and spending burn.
  6. **Goals**: Milestone tracking (Emergency Reserve, Down Payment, FIRE $1M target).
  7. **Tax Planning**: IRS limit tracker, pre-tax 401(k) / HSA deduction and tax shield simulator.
  8. **Credit Health**: VantageScore monitor, credit factor analysis, Debt Avalanche payoff calculator.
  9. **Calculators & Blueprint**: 4% Rule FIRE model, mortgage amortization, compound interest projection.
  10. **Plans & Billing**: Tier comparisons (Free, Pro, Executive Household).
  11. **Settings & Cloud Sync**: Profile settings, Supabase connection status, test tool, manual backup, currency switcher, and 3 themes (Dark, Light, Glass).

---

## 📁 Project Structure

```
├── .env                  # Secure Supabase & Node.js login credentials (ignored by Git)
├── .env.example          # Template environment file with instructions
├── .gitignore            # Git exclusion for secrets and build artifacts
├── supabase_schema.sql   # Complete PostgreSQL database schema for Supabase
├── package.json          # Project scripts and dependencies
├── vite.config.js        # Vite build tool config with API proxy
├── tailwind.config.js    # Tailwind styling system
├── postcss.config.js     # Postcss config
├── vercel.json           # 1-Click cloud deployment configuration
├── index.html            # Vite React entry point
├── index.legacy.html     # Backup of original monolithic index.html
├── server/               # Node.js API Backend
│   ├── index.js          # Express app entry point
│   ├── supabase.js       # Supabase client connector
│   └── routes/           # REST API endpoints
│       ├── auth.js       # Supabase Auth routes (signup, login, user, session)
│       ├── portfolio.js  # Portfolio CRUD operations
│       ├── accounts.js   # Linked accounts management
│       ├── expenses.js   # Budget and cards operations
│       ├── transactions.js # Transaction ledger
│       └── sync.js       # Full cloud state synchronization
└── src/                  # React Frontend
    ├── main.jsx          # React DOM root
    ├── App.jsx           # App layout and view router
    ├── index.css         # Theme CSS variables (Dark, Light, Glass)
    ├── context/          # React Contexts (AuthContext, AppContext)
    ├── services/         # Supabase & Node.js API services
    ├── data/             # Seeded initial data (Portfolio, Accounts, Expenses)
    └── components/
        ├── Header.jsx    # Top bar (Search ⌘K, Currency, Theme, Cloud Sync)
        ├── Sidebar.jsx   # Collapsible sidebar navigation
        ├── MobileNav.jsx # Bottom mobile navigation dock
        ├── Toast.jsx     # Floating notifications
        ├── modals/       # AuthModal, AddAccount, AddTransaction, QuickAdd, CommandMenu
        └── tabs/         # 11 Dedicated views for each feature
```

---

## 🔑 Supabase Connection & Credentials Setup

All login credentials and secret keys are stored in `.env`.

### Step 1: Get your Supabase credentials
1. Create or log in to your account at [Supabase](https://supabase.com/).
2. Select your project (or create a new project).
3. Navigate to **Project Settings** → **API** in the left sidebar.
4. Copy your:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (secret)

### Step 2: Configure `.env`
Open the `.env` file in the root directory and replace the placeholders:

```env
# Backend Node.js Port
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase Credentials for Node.js API Backend
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase & Backend API URLs for Frontend React (Vite)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Run the Database Schema in Supabase
1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Copy and paste the entire contents of `supabase_schema.sql` from this project.
4. Click **Run**.
5. This creates all tables (`profiles`, `portfolios`, `accounts`, `expenses`, `transactions`, `goals`), enables Row Level Security (RLS) policies, and configures automated user profile creation!

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Both Frontend & Node.js Backend Concurrently
```bash
npm run dev
```
- React frontend runs at: `http://localhost:5173`
- Node.js API runs at: `http://localhost:5000`

### 3. Run Backend Server Only
```bash
npm run server
```

### 4. Build for Production
```bash
npm run build
```
Creates an optimized, production-ready static bundle in `dist/`.

---

## ☁️ Deployment Guide

### Deploying to Vercel
1. Push your repository to GitHub.
2. In Vercel, import your repository.
3. In Project Settings → **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**. Vercel will build Vite and serve the app using the included `vercel.json`.

### Deploying to Netlify / Render / Railway
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- Add environment variables in the provider dashboard matching your `.env` file.

---

## 🛡️ Security & Privacy
- **Zero Hardcoded Secrets**: No sensitive keys are committed to Git.
- **Row Level Security (RLS)**: Enforced directly on Supabase PostgreSQL so users can only ever access their own financial records.
- **Graceful Fallback Mode**: If Supabase keys are not set yet, the app runs cleanly in local demo mode so you can preview all calculators and dashboards without errors.
