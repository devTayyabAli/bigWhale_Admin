import { useState, useEffect, useRef } from 'react'

/**
 * Debounces a value by the given delay (ms).
 * Uses a ref for the timer so it survives re-renders without being a dependency.
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timerRef.current)
  }, [value, delay])

  return debouncedValue
}
