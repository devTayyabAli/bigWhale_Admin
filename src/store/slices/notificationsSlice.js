import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

// ─── Thunks ──────────────────────────────────────────────────────────────────

/** Fetch the latest 20 rank-achievement notifications from the server */
export const fetchAdminNotifications = createAsyncThunk(
  'notifications/fetchAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/notifications/admin?limit=20')
      return data.data // { notifications, total, page, limit }
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch notifications.' })
    }
  }
)

/** Mark all notifications as read */
export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/notifications/admin/mark-read')
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark as read.' })
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],       // array of notification objects
    total: 0,
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    /**
     * Push a real-time notification received via socket.
     * Keeps the list capped at 50 items to avoid memory growth.
     */
    pushNotification(state, action) {
      state.items.unshift(action.payload)
      if (state.items.length > 50) state.items = state.items.slice(0, 50)
      state.unreadCount += 1
      state.total += 1
    },
    clearUnread(state) {
      state.unreadCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminNotifications
      .addCase(fetchAdminNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload?.notifications ?? []
        state.total = action.payload?.total ?? 0
        // Count records not yet read by admin
        state.unreadCount = state.items.filter((n) => !n.readByAdmin).length
      })
      .addCase(fetchAdminNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // markAllRead
      .addCase(markAllRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, readByAdmin: true }))
        state.unreadCount = 0
      })
  },
})

export const { pushNotification, clearUnread } = notificationsSlice.actions
export default notificationsSlice.reducer
