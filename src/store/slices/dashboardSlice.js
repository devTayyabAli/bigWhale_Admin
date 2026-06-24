import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/statistics', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchStakeRewards = createAsyncThunk(
  'dashboard/fetchStakeRewards',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/today-stake-reward', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchSaleKGC = createAsyncThunk(
  'dashboard/fetchSales',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/today-sale', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

// ── Report pages — these endpoints were added to the server ──────────

export const fetchCashInflow = createAsyncThunk(
  'dashboard/fetchCashInflow',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/cash-inflow', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchCashOutflow = createAsyncThunk(
  'dashboard/fetchCashOutflow',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/cash-outflow', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchGlobalTurnover = createAsyncThunk(
  'dashboard/fetchGlobalTurnover',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/global-turnover', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchSalaryRankHistory = createAsyncThunk(
  'dashboard/fetchSalaryRankHistory',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/salary-rank-history', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

const asyncState = () => ({ loading: false, data: null, error: null })

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: asyncState(),
    stakeRewards: asyncState(),
    saleKGC: asyncState(),
    cashInflow: asyncState(),
    cashOutflow: asyncState(),
    globalTurnover: asyncState(),
    salaryRankHistory: asyncState(),
  },
  reducers: {},
  extraReducers: (builder) => {
    const addAsync = (thunk, key) => {
      builder
        .addCase(thunk.pending, (state) => {
          state[key] = { loading: true, data: null, error: null }
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state[key] = { loading: false, data: action.payload, error: null }
        })
        .addCase(thunk.rejected, (state, action) => {
          state[key] = { loading: false, data: null, error: action.payload }
        })
    }

    addAsync(fetchDashboardStats, 'stats')
    addAsync(fetchStakeRewards, 'stakeRewards')
    addAsync(fetchSaleKGC, 'saleKGC')
    addAsync(fetchCashInflow, 'cashInflow')
    addAsync(fetchCashOutflow, 'cashOutflow')
    addAsync(fetchGlobalTurnover, 'globalTurnover')
    addAsync(fetchSalaryRankHistory, 'salaryRankHistory')
  },
})

export default dashboardSlice.reducer
