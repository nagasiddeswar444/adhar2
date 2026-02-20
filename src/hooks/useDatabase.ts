import { useState, useEffect, useCallback } from 'react'
import { 
  centerOperations, 
  updateTypeOperations, 
  timeSlotOperations,
  appointmentOperations,
  analyticsOperations,
  fraudLogOperations,
  centerLoadOperations,
  updateHistoryOperations,
  documentOperations,
  type Center,
  type UpdateType,
  type TimeSlot,
  type Appointment,
  type AnalyticsSummary,
  type FraudLog,
  type CenterLoad,
  type UpdateHistory,
  type Document
} from '@/lib/database'

// Hook for fetching centers
export function useCenters() {
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCenters = useCallback(async () => {
    try {
      setLoading(true)
      const data = await centerOperations.getCenters()
      setCenters(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCenters()
  }, [fetchCenters])

  return { centers, loading, error, refetch: fetchCenters }
}

// Hook for fetching update types
export function useUpdateTypes() {
  const [updateTypes, setUpdateTypes] = useState<UpdateType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUpdateTypes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await updateTypeOperations.getUpdateTypes()
      setUpdateTypes(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUpdateTypes()
  }, [fetchUpdateTypes])

  return { updateTypes, loading, error, refetch: fetchUpdateTypes }
}

// Hook for fetching time slots
export function useTimeSlots(centerId: string | null, date: string | null) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!centerId || !date) {
      setSlots([])
      return
    }

    const fetchSlots = async () => {
      try {
        setLoading(true)
        const data = await timeSlotOperations.getAvailableSlots(centerId, date)
        setSlots(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [centerId, date])

  return { slots, loading, error }
}

// Hook for fetching appointments
export function useAppointments(userId: string | null) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAppointments = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      const data = await appointmentOperations.getAppointments(userId)
      setAppointments(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  return { appointments, loading, error, refetch: fetchAppointments }
}

// Hook for fetching dashboard stats
export function useDashboardStats() {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const data = await analyticsOperations.getDashboardStats()
      setStats(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

// Hook for fetching fraud stats
export function useFraudStats() {
  const [fraudStats, setFraudStats] = useState<{ before: any; after: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFraudStats = useCallback(async () => {
    try {
      setLoading(true)
      const data = await analyticsOperations.getFraudStats()
      setFraudStats(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFraudStats()
  }, [fetchFraudStats])

  return { fraudStats, loading, error, refetch: fetchFraudStats }
}

// Hook for fetching center loads
export function useCenterLoads(date: string | null) {
  const [centerLoads, setCenterLoads] = useState<CenterLoad[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!date) {
      setCenterLoads([])
      return
    }

    const fetchCenterLoads = async () => {
      try {
        setLoading(true)
        const data = await centerLoadOperations.getAllCenterLoads(date)
        setCenterLoads(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchCenterLoads()
  }, [date])

  return { centerLoads, loading, error }
}

// Hook for fetching update history
export function useUpdateHistory(userId: string | null) {
  const [history, setHistory] = useState<UpdateHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      const data = await updateHistoryOperations.getUpdateHistory(userId)
      setHistory(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, loading, error, refetch: fetchHistory }
}

// Hook for fetching documents
export function useDocuments(userId: string | null) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDocuments = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      const data = await documentOperations.getDocuments(userId)
      setDocuments(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return { documents, loading, error, refetch: fetchDocuments }
}
