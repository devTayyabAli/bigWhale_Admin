/**
 * SocketProvider
 *
 * Manages the socket.io-client connection for the admin panel.
 * - Connects once when the admin is authenticated.
 * - Listens for "admin-events" and pushes rank-achievement notifications
 *   into the Redux notifications slice in real-time.
 * - Disconnects cleanly on logout / unmount.
 */
import { createContext, useContext, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { selectIsAuthenticated } from '@/store/selectors'
import { pushNotification } from '@/store/slices/notificationsSlice'

const SocketContext = createContext(null)

export function useSocket() {
  return useContext(SocketContext)
}

export default function SocketProvider({ children }) {
  const dispatch        = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const socketRef       = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect if admin logs out
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    // Avoid duplicate connections (React StrictMode double-effect)
    if (socketRef.current?.connected) return

    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

    socketRef.current = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socketRef.current.on('connect', () => {
      console.log('[AdminSocket] connected:', socketRef.current.id)
    })

    socketRef.current.on('disconnect', (reason) => {
      console.log('[AdminSocket] disconnected:', reason)
    })

    /**
     * "admin-events" payload shape (from server):
     * {
     *   type:        "rank_achieved" | "Rank Gift Request" | ...
     *   title:       string
     *   description: string
     *   userId?:     string
     *   rankTitle?:  string
     *   starKey?:    number
     *   createdAt:   Date
     * }
     */
    socketRef.current.on('admin-events', (payload) => {
      if (payload?.type === 'rank_achieved') {
        dispatch(
          pushNotification({
            _id:          `rt-${Date.now()}`,   // temporary local id
            notificationType: 'Rank Updation',
            description:  payload.description,
            userId:       { _id: payload.userId },
            rankTitle:    payload.rankTitle,
            starKey:      payload.starKey,
            readByAdmin:  false,
            createdAt:    payload.createdAt || new Date().toISOString(),
            realTime:     true,
          })
        )
      }
    })

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [isAuthenticated, dispatch])

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  )
}
