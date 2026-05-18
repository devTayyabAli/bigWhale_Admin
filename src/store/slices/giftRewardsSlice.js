import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'
import toast from 'react-hot-toast'

export const fetchGiftRewards = createAsyncThunk(
  'giftRewards/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/gift-requests', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const changeGiftStatus = createAsyncThunk(
  'giftRewards/changeStatus',
  async ({ id, body, params }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/gift-request/${id}/status`, body)
      toast.success(`Request ${body.status} successfully`)
      dispatch(fetchGiftRewards(params))
      return data
    } catch (err) {
      toast.error('Failed to update gift status')
      return rejectWithValue(err.response?.data)
    }
  }
)

const giftRewardsSlice = createSlice({
  name: 'giftRewards',
  initialState: {
    loading: false,
    data: null,
    error: null,
    updating: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGiftRewards.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGiftRewards.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchGiftRewards.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(changeGiftStatus.pending, (state) => {
        state.updating = true
      })
      .addCase(changeGiftStatus.fulfilled, (state) => {
        state.updating = false
      })
      .addCase(changeGiftStatus.rejected, (state) => {
        state.updating = false
      })
  },
})

export default giftRewardsSlice.reducer
