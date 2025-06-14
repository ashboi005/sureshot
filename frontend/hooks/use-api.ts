import { useState, useEffect, useCallback } from 'react'
import { useToast } from './use-toast'

interface UseApiOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (...args: any[]) => Promise<T | void>
  reset: () => void
}

/**
 * Custom hook for API calls with loading, error, and success states
 * Provides automatic error handling and toast notifications
 */
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await apiFunction(...args)
        setData(result)
        
        if (options.onSuccess) {
          options.onSuccess(result)
        }
        
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unexpected error occurred')
        setError(error)
        
        if (options.onError) {
          options.onError(error)
        } else {
          // Default error handling with toast
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, options, toast]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [execute, options.immediate])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T>(
  apiFunction: (skip: number, limit: number, ...args: any[]) => Promise<{ items?: T[], total: number } | T[]>,
  itemsPerPage = 10
) {
  const [items, setItems] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const fetchPage = useCallback(
    async (page: number, ...args: any[]) => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await apiFunction(page * itemsPerPage, itemsPerPage, ...args)
        
        if (Array.isArray(result)) {
          setItems(result)
          setTotal(result.length)
        } else {
          setItems(result.items || [])
          setTotal(result.total)
        }
        
        setCurrentPage(page)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch data')
        setError(error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, itemsPerPage, toast]
  )

  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(total / itemsPerPage)
    if (currentPage < totalPages - 1) {
      fetchPage(currentPage + 1)
    }
  }, [currentPage, total, itemsPerPage, fetchPage])

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      fetchPage(currentPage - 1)
    }
  }, [currentPage, fetchPage])

  const goToPage = useCallback(
    (page: number) => {
      const totalPages = Math.ceil(total / itemsPerPage)
      if (page >= 0 && page < totalPages) {
        fetchPage(page)
      }
    },
    [total, itemsPerPage, fetchPage]
  )

  return {
    items,
    total,
    currentPage,
    loading,
    error,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
    totalPages: Math.ceil(total / itemsPerPage),
    hasNext: currentPage < Math.ceil(total / itemsPerPage) - 1,
    hasPrev: currentPage > 0,
  }
}
