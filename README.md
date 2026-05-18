# BW Admin Panel

BigWhale Admin Dashboard — fully migrated from CRA to **Vite + React 18 + Tailwind CSS + Redux Toolkit**.

## Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite 5 |
| UI | React 18 + Tailwind CSS 3 |
| State | Redux Toolkit + React Redux |
| Routing | React Router DOM v6 |
| Forms | React Hook Form + Yup |
| Animations | Framer Motion |
| API | Axios (with interceptors) |
| Data Fetching | TanStack Query v5 |
| Notifications | React Hot Toast |
| Charts | Recharts |
| Web3 | Web3.js 1.9 |

## Project Structure

```
src/
├── animations/       # Framer Motion variants
├── assets/           # Static assets
├── components/
│   └── ui/           # Reusable: Button, Card, Table, Modal, Pagination…
├── constants/        # NAV_ITEMS, filter options, limits
├── contract/         # Web3 ABI + staking/KGC helpers
├── hooks/            # useAuth, useDebounce, useTableParams, useWeb3
├── layouts/          # MainLayout, AuthLayout, Sidebar, Navbar
├── pages/            # One folder per feature
│   ├── auth/
│   ├── dashboard/
│   ├── users/
│   ├── gift-rewards/
│   ├── accounts/
│   ├── reports/
│   ├── set-rate/
│   ├── stake-users/
│   ├── banner/
│   ├── support/
│   └── misc/
├── routes/           # AppRoutes + ProtectedRoute
├── services/         # api.js (Axios), setRate.js, staking.js
├── store/            # Redux store + RTK slices
├── styles/           # globals.css (Tailwind)
└── utils/            # formatDate, capitalizeWords, getStatusBadge…
```

## Getting Started

```bash
# 1. Copy env file
cp .env.example .env
# Fill in VITE_API_BASE_URL, VITE_ADMIN_WALLET_ADDRESS, VITE_CHAIN_ID, VITE_MAIN_ADDRESS

# 2. Install dependencies
npm install

# 3. Start dev server (port 3001)
npm run dev

# 4. Production build
npm run build

# 5. Preview production build
npm run preview
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_ADMIN_WALLET_ADDRESS` | Admin MetaMask wallet address |
| `VITE_CHAIN_ID` | Required chain ID (56 = BSC Mainnet, 97 = Testnet) |
| `VITE_MAIN_ADDRESS` | Staking contract address |

## Key Changes from Old Project

- **CRA → Vite**: ~10× faster HMR, no webpack config
- **Redux → RTK**: `createSlice` + `createAsyncThunk` replaces manual action/reducer boilerplate
- **React Router v5 → v6**: `Routes`/`Route`, `useNavigate`, no `history` object
- **Bootstrap/SCSS → Tailwind**: utility-first, no SCSS files
- **Reactstrap → custom components**: `Card`, `Button`, `Modal`, `Table` all in `src/components/ui/`
- **`process.env` → `import.meta.env`**: all env vars prefixed with `VITE_`
- **Class components → functional**: `VerticalLayout` and all layouts rewritten as hooks
- **react-toastify → react-hot-toast**: already used in original, now consistent everywhere
