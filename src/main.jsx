// ─── Reown AppKit — MUST be imported first to call createAppKit() ─────────────
import '@/config/appkit'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store } from './store'
import WalletProvider from './context/WalletProvider'
import './styles/globals.css'

// TanStack Query client
// NOTE: QueryClientProvider MUST wrap WalletProvider (which contains WagmiProvider)
// because wagmi's internal hooks (useDisconnect, etc.) require a QueryClient ancestor.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <App />
        </WalletProvider>
      </QueryClientProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            border: '1px solid #374151',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#F9FAFB' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#F9FAFB' } },
        }}
      />
    </Provider>
  </React.StrictMode>
)
