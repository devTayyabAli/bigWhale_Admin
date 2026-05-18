import { createSlice } from '@reduxjs/toolkit'

const savedTheme = localStorage.getItem('bw-theme') || 'dark'
const savedSidebarCollapsed = localStorage.getItem('bw-sidebar-collapsed') === 'true'

const customizerSlice = createSlice({
  name: 'customizer',
  initialState: {
    theme: savedTheme,           // 'dark' | 'light'
    sidebarCollapsed: savedSidebarCollapsed,
    sidebarMobileOpen: false,
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('bw-theme', state.theme)
      // Apply to <html> element for Tailwind dark mode
      document.documentElement.classList.toggle('dark', state.theme === 'dark')
    },
    setTheme(state, action) {
      state.theme = action.payload
      localStorage.setItem('bw-theme', action.payload)
      document.documentElement.classList.toggle('dark', action.payload === 'dark')
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
      localStorage.setItem('bw-sidebar-collapsed', String(state.sidebarCollapsed))
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload
      localStorage.setItem('bw-sidebar-collapsed', String(action.payload))
    },
    toggleMobileSidebar(state) {
      state.sidebarMobileOpen = !state.sidebarMobileOpen
    },
    closeMobileSidebar(state) {
      state.sidebarMobileOpen = false
    },
  },
})

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  closeMobileSidebar,
} = customizerSlice.actions

export default customizerSlice.reducer
