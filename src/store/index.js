import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import customizerReducer from './slices/customizerSlice'
import usersReducer from './slices/usersSlice'
import dashboardReducer from './slices/dashboardSlice'
import giftRewardsReducer from './slices/giftRewardsSlice'
import supportReducer from './slices/supportSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customizer: customizerReducer,
    users: usersReducer,
    dashboard: dashboardReducer,
    giftRewards: giftRewardsReducer,
    support: supportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in these paths (e.g. Error objects from API)
        ignoredActions: ['auth/loginFail', 'users/fetchAllUsersFail'],
        ignoredPaths: ['auth.error', 'users.error'],
      },
    }),
  devTools: import.meta.env.DEV,
})
