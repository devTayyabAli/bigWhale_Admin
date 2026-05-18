import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/signin', credentials)
      const user = data.data

      if (user.role !== 'admin') {
        return rejectWithValue({ message: 'No Admin privileges' })
      }

      // Persist to localStorage
      const userData = {
        email: user.email,
        accessToken: user.token,
        role: user.role,
        name: user.name,
        userName: user.userName,
        status: user.status,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
      }
      localStorage.setItem('userData', JSON.stringify(userData))
      return userData
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Login failed. Please try again.' }
      )
    }
  }
)

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/change-password', payload)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to change password.' })
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('userData')) || null
  } catch {
    return null
  }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    loading: false,
    error: null,
    changePasswordLoading: false,
    changePasswordError: null,
    changePasswordSuccess: false,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.error = null
      localStorage.removeItem('userData')
    },
    clearAuthError(state) {
      state.error = null
    },
    clearChangePasswordState(state) {
      state.changePasswordError = null
      state.changePasswordSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Change Password
      .addCase(changePasswordThunk.pending, (state) => {
        state.changePasswordLoading = true
        state.changePasswordError = null
        state.changePasswordSuccess = false
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.changePasswordLoading = false
        state.changePasswordSuccess = true
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.changePasswordLoading = false
        state.changePasswordError = action.payload
      })
  },
})

export const { logout, clearAuthError, clearChangePasswordState } = authSlice.actions
export default authSlice.reducer
