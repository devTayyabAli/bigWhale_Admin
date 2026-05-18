import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import PageLoader from '@/components/ui/PageLoader'

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const Login          = lazy(() => import('@/pages/auth/Login'))
const ChangePassword = lazy(() => import('@/pages/auth/ChangePassword'))
const Dashboard      = lazy(() => import('@/pages/dashboard/Dashboard'))
const AllUsers       = lazy(() => import('@/pages/users/AllUsers'))
const UserDetails    = lazy(() => import('@/pages/users/UserDetails'))
const UserTeamDetails = lazy(() => import('@/pages/users/UserTeamDetails'))
const UserStakingHistory = lazy(() => import('@/pages/users/UserStakingHistory'))
const TeamsView      = lazy(() => import('@/pages/users/TeamsView'))
const GiftRewards    = lazy(() => import('@/pages/gift-rewards/GiftRewards'))
const AccountsDetails = lazy(() => import('@/pages/accounts/AccountsDetails'))
const BannedUsers    = lazy(() => import('@/pages/reports/BannedUsers'))
const CashInflow     = lazy(() => import('@/pages/reports/CashInflow'))
const CashOutflow    = lazy(() => import('@/pages/reports/CashOutflow'))
const GlobalTurnover = lazy(() => import('@/pages/reports/GlobalTurnover'))
const SetRate        = lazy(() => import('@/pages/set-rate/SetRate'))
const StakeUsers     = lazy(() => import('@/pages/stake-users/StakeUsers'))
const Banner         = lazy(() => import('@/pages/banner/Banner'))
const SupportTickets = lazy(() => import('@/pages/support/SupportTickets'))
const TicketView     = lazy(() => import('@/pages/support/TicketView'))
const NotFound       = lazy(() => import('@/pages/misc/NotFound'))

// ─── Route tree ───────────────────────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Users */}
          <Route path="/users/all-users" element={<AllUsers />} />
          <Route path="/users/user-details/:id" element={<UserDetails />} />
          <Route path="/users/user-team-details/:id" element={<UserTeamDetails />} />
          <Route path="/users/user-stakinghistory/:id" element={<UserStakingHistory />} />
          <Route path="/users/user-teams/:id" element={<TeamsView />} />

          {/* Features */}
          <Route path="/gift-rewards" element={<GiftRewards />} />
          <Route path="/users-details" element={<AccountsDetails />} />
          <Route path="/banner" element={<Banner />} />

          {/* Reports */}
          <Route path="/banned-user" element={<BannedUsers />} />
          <Route path="/cash-inflow" element={<CashInflow />} />
          <Route path="/cash-outflow" element={<CashOutflow />} />
          <Route path="/global-turnover" element={<GlobalTurnover />} />

          {/* Web3 */}
          <Route path="/set-rate" element={<SetRate />} />
          <Route path="/stake-users" element={<StakeUsers />} />

          {/* Support */}
          <Route path="/support-history" element={<SupportTickets />} />
          <Route path="/support/ticket-details/:id" element={<TicketView />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
