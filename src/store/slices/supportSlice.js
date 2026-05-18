import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'
import toast from 'react-hot-toast'

export const fetchSupportDashboard = createAsyncThunk(
  'support/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/support/counts')
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchSupportTickets = createAsyncThunk(
  'support/fetchTickets',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/support/', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchTicketById = createAsyncThunk(
  'support/fetchTicketById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/support/tickets/${id}`)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const updateTicketStatus = createAsyncThunk(
  'support/updateStatus',
  async ({ id, body, params }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.put(`/support/${id}`, body)
      toast.success('Ticket status updated')
      dispatch(fetchSupportTickets(params))
      return data
    } catch (err) {
      toast.error('Failed to update ticket status')
      return rejectWithValue(err.response?.data)
    }
  }
)

const asyncState = () => ({ loading: false, data: null, error: null })

const supportSlice = createSlice({
  name: 'support',
  initialState: {
    dashboard: asyncState(),
    tickets: asyncState(),
    activeTicket: asyncState(),
  },
  reducers: {
    clearActiveTicket(state) {
      state.activeTicket = asyncState()
    },
  },
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

    addAsync(fetchSupportDashboard, 'dashboard')
    addAsync(fetchSupportTickets, 'tickets')
    addAsync(fetchTicketById, 'activeTicket')
  },
})

export const { clearActiveTicket } = supportSlice.actions
export default supportSlice.reducer
