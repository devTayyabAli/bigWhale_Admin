import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'
import toast from 'react-hot-toast'

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/user-list', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchSingleUser = createAsyncThunk(
  'users/fetchSingle',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/user-detail/${id}`)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchUserStakingList = createAsyncThunk(
  'users/fetchStaking',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/stake-list/${userId}`, { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchUserTeam = createAsyncThunk(
  'users/fetchTeam',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/teams/${userId}`, { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchUserRewards = createAsyncThunk(
  'users/fetchRewards',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/reward-list/${userId}`, { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchUserWithdrawals = createAsyncThunk(
  'users/fetchWithdrawals',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/withdrawals-list/${userId}`, { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchUserSales = createAsyncThunk(
  'users/fetchSales',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/sellToken-list/${userId}`, { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchUserFundTransfers = createAsyncThunk(
  'users/fetchFundTransfers',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/fundTransfer-list/${userId}`, { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchUserProfile = createAsyncThunk(
  'users/fetchProfile',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/profile/${userId}`, { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchStakeHistory = createAsyncThunk(
  'users/fetchStakeHistory',
  async ({ stakeId, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/stakeReward/${stakeId}`, { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchUserTeamReward = createAsyncThunk(
  'users/fetchTeamReward',
  async ({ userId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/admin/teamTotalReward/${userId}?startDate=${startDate}&endDate=${endDate}`
      )
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchDailyUsers = createAsyncThunk(
  'users/fetchDaily',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/today-users', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchBannedUsers = createAsyncThunk(
  'users/fetchBanned',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/today-banned-users', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ id, body, persistedParams }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/${id}/status`, body)
      dispatch(fetchAllUsers(persistedParams))
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const updateWithdrawStatus = createAsyncThunk(
  'users/updateWithdrawStatus',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/${id}/withdrawstatus`, body)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const updateLevelIncomeRewardStatus = createAsyncThunk(
  'users/updateLevelIncomeStatus',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/${id}/levelIncomeStatus`, body)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const updateStakeStatus = createAsyncThunk(
  'users/updateStakeStatus',
  async ({ id, body, userId }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/updateStaking/${id}/status`, body)
      dispatch(fetchUserStakingList({ userId }))
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchUserRank = createAsyncThunk(
  'users/fetchRank',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/get-rank-status/${userId}`)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

// Banner actions
export const addBanner = createAsyncThunk(
  'users/addBanner',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/banner/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data?.success) toast.success('News Banner updated successfully')
      return data
    } catch (err) {
      toast.error('Error while adding news banner')
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchBanners = createAsyncThunk(
  'users/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/banner')
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const deleteBanner = createAsyncThunk(
  'users/deleteBanner',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/banner/${id}`)
      if (data?.success) toast.success('News Banner deleted successfully')
      return id
    } catch (err) {
      toast.error('Error while deleting news banner')
      return rejectWithValue(err.response?.data)
    }
  }
)

// ─── Helper to build async state ─────────────────────────────────────────────
const asyncState = () => ({ loading: false, data: null, error: null })

// ─── Slice ────────────────────────────────────────────────────────────────────
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    allUsers: asyncState(),
    singleUser: asyncState(),
    staking: asyncState(),
    team: asyncState(),
    rewards: asyncState(),
    withdrawals: asyncState(),
    sales: asyncState(),
    fundTransfers: asyncState(),
    profile: asyncState(),
    stakeHistory: asyncState(),
    teamReward: asyncState(),
    dailyUsers: asyncState(),
    bannedUsers: asyncState(),
    updateUser: asyncState(),
    updateStake: asyncState(),
    banners: asyncState(),
    userRank: asyncState(),
  },
  reducers: {
    resetUpdateUser(state) {
      state.updateUser = asyncState()
    },
    resetUpdateStake(state) {
      state.updateStake = asyncState()
    },
    resetSingleUser(state) {
      state.singleUser = asyncState()
    },
  },
  extraReducers: (builder) => {
    // Generic helper to add async cases
    const addAsync = (thunk, stateKey) => {
      builder
        .addCase(thunk.pending, (state) => {
          state[stateKey] = { loading: true, data: null, error: null }
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state[stateKey] = { loading: false, data: action.payload, error: null }
        })
        .addCase(thunk.rejected, (state, action) => {
          state[stateKey] = { loading: false, data: null, error: action.payload }
        })
    }

    addAsync(fetchAllUsers, 'allUsers')
    addAsync(fetchSingleUser, 'singleUser')
    addAsync(fetchUserStakingList, 'staking')
    addAsync(fetchUserTeam, 'team')
    addAsync(fetchUserRewards, 'rewards')
    addAsync(fetchUserWithdrawals, 'withdrawals')
    addAsync(fetchUserSales, 'sales')
    addAsync(fetchUserFundTransfers, 'fundTransfers')
    addAsync(fetchUserProfile, 'profile')
    addAsync(fetchStakeHistory, 'stakeHistory')
    addAsync(fetchUserTeamReward, 'teamReward')
    addAsync(fetchDailyUsers, 'dailyUsers')
    addAsync(fetchBannedUsers, 'bannedUsers')
    addAsync(updateUserStatus, 'updateUser')
    addAsync(updateStakeStatus, 'updateStake')
    addAsync(fetchBanners, 'banners')
    addAsync(fetchUserRank, 'userRank')

    // Banner delete — remove from list on success
    builder.addCase(deleteBanner.fulfilled, (state, action) => {
      if (state.banners.data?.banners) {
        state.banners.data.banners = state.banners.data.banners.filter(
          (b) => b._id !== action.payload
        )
      }
    })
  },
})

export const { resetUpdateUser, resetUpdateStake, resetSingleUser } = usersSlice.actions
export default usersSlice.reducer
