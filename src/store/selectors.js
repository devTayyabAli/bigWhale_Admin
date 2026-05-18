/**
 * Memoised selectors using RTK's built-in createSelector (re-export of reselect).
 * Prevents unnecessary re-renders when unrelated state slices change.
 */
import { createSelector } from '@reduxjs/toolkit'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const selectAuth = (s) => s.auth
export const selectUser = createSelector(selectAuth, (a) => a.user)
export const selectAuthLoading = createSelector(selectAuth, (a) => a.loading)
export const selectAuthError = createSelector(selectAuth, (a) => a.error)
export const selectIsAuthenticated = createSelector(selectUser, (u) => Boolean(u?.accessToken))

// ─── Customizer ───────────────────────────────────────────────────────────────
export const selectCustomizer = (s) => s.customizer
export const selectTheme = createSelector(selectCustomizer, (c) => c.theme)
export const selectSidebarCollapsed = createSelector(selectCustomizer, (c) => c.sidebarCollapsed)
export const selectSidebarMobileOpen = createSelector(selectCustomizer, (c) => c.sidebarMobileOpen)

// ─── Users ────────────────────────────────────────────────────────────────────
export const selectUsers = (s) => s.users
export const selectAllUsers = createSelector(selectUsers, (u) => u.allUsers)
export const selectAllUsersData = createSelector(selectAllUsers, (u) => u.data?.data ?? [])
export const selectAllUsersPaginate = createSelector(selectAllUsers, (u) => u.data?.paginate ?? {})
export const selectAllUsersLoading = createSelector(selectAllUsers, (u) => u.loading)

export const selectSingleUser = createSelector(selectUsers, (u) => u.singleUser)
export const selectUserRank = createSelector(selectUsers, (u) => u.userRank)
export const selectBanners = createSelector(selectUsers, (u) => u.banners)
export const selectDailyUsers = createSelector(selectUsers, (u) => u.dailyUsers)
export const selectBannedUsers = createSelector(selectUsers, (u) => u.bannedUsers)

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const selectDashboard = (s) => s.dashboard
export const selectDashboardStats = createSelector(selectDashboard, (d) => d.stats)
export const selectStakeRewards = createSelector(selectDashboard, (d) => d.stakeRewards)
export const selectSaleKGC = createSelector(selectDashboard, (d) => d.saleKGC)
export const selectCashInflow = createSelector(selectDashboard, (d) => d.cashInflow)
export const selectCashOutflow = createSelector(selectDashboard, (d) => d.cashOutflow)
export const selectGlobalTurnover = createSelector(selectDashboard, (d) => d.globalTurnover)

// ─── Gift Rewards ─────────────────────────────────────────────────────────────
export const selectGiftRewards = (s) => s.giftRewards

// ─── Support ──────────────────────────────────────────────────────────────────
export const selectSupport = (s) => s.support
export const selectSupportDashboard = createSelector(selectSupport, (s) => s.dashboard)
export const selectSupportTickets = createSelector(selectSupport, (s) => s.tickets)
export const selectActiveTicket = createSelector(selectSupport, (s) => s.activeTicket)
