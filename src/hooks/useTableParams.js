import { useState, useCallback } from 'react'

/**
 * Manages common table state: page, limit, search, date filters.
 * Returns params and stable setter callbacks (useCallback — safe as deps).
 */
export const useTableParams = (initialParams = {}) => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: null,
    ...initialParams,
  })

  const setPage = useCallback(
    (page) => setParams((p) => ({ ...p, page })),
    []
  )

  const setSearch = useCallback(
    (search) => setParams((p) => ({ ...p, search: search || null, page: 1 })),
    []
  )

  const setFilter = useCallback(
    (key, value) => setParams((p) => ({ ...p, [key]: value, page: 1 })),
    []
  )

  const resetParams = useCallback(
    () => setParams({ page: 1, limit: 10, search: null, ...initialParams }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return { params, setParams, setPage, setSearch, setFilter, resetParams }
}
