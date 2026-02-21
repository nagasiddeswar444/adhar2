import { 
  centerOperations, 
  updateTypeOperations, 
  timeSlotOperations,
  appointmentOperations,
  analyticsOperations,
  type Center,
  type UpdateType,
  type TimeSlot,
  type Appointment
} from '@/lib/database'
import { 
  type Center as MockCenter,
  type UpdateType as MockUpdateType,
  type TimeSlot as MockTimeSlot
} from '@/data/mockData'

// Flag to check if we're using database (always true now since we're connecting to real database)
let useDatabase = true

// Initialize database connection
export async function initDatabase(): Promise<boolean> {
  // Always use the Node.js API database connection
  useDatabase = true
  return useDatabase
}

// Get current mode
export function isUsingDatabase(): boolean {
  return useDatabase
}

// Convert mock center to database format
function convertMockCenter(center: MockCenter): Partial<Center> {
  return {
    id: center.id,
    name: center.name,
    city: center.city,
    state: center.state,
    capacity: center.capacity,
    address: '',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Convert mock update type to database format
function convertMockUpdateType(type: MockUpdateType): Partial<UpdateType> {
  return {
    id: type.id,
    name: type.name,
    description: type.description,
    risk_level: type.riskLevel,
    requires_verification: type.requiresVerification,
    requires_biometric: type.isBiometric || false,
    can_do_online: type.canDoOnline || false,
    estimated_time_minutes: parseInt(type.estimatedTime) || 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Convert mock time slot to database format
function convertMockTimeSlot(slot: MockTimeSlot, centerId: string, date: string): Partial<TimeSlot> {
  return {
    id: slot.id,
    center_id: centerId,
    date,
    time: slot.time,
    available: slot.available,
    total: slot.total,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// ============ UNIFIED DATA OPERATIONS ============

export const dataService = {
  // Centers
  async getCenters(): Promise<MockCenter[]> {
    if (useDatabase) {
      try {
        const dbCenters = await centerOperations.getCenters()
        return dbCenters.map(c => ({
          id: c.id,
          name: c.name,
          city: c.city,
          state: c.state,
          capacity: c.capacity,
          currentLoad: Math.floor(c.capacity * 0.6),
          predictedLoad: Math.floor(c.capacity * 0.8),
          coordinates: { lat: c.latitude || 0, lng: c.longitude || 0 }
        }))
      } catch (error) {
        console.error('Failed to fetch centers from database:', error)
        return []
      }
    }
    return []
  },

  async getCenterById(id: string): Promise<MockCenter | undefined> {
    if (useDatabase) {
      try {
        const center = await centerOperations.getCenterById(id)
        if (center) {
          return {
            id: center.id,
            name: center.name,
            city: center.city,
            state: center.state,
            capacity: center.capacity,
            currentLoad: Math.floor(center.capacity * 0.6),
            predictedLoad: Math.floor(center.capacity * 0.8),
            coordinates: { lat: center.latitude || 0, lng: center.longitude || 0 }
          }
        }
      } catch (error) {
        console.error('Failed to fetch center from database:', error)
      }
    }
    return undefined
  },

  // Update Types
  async getUpdateTypes(): Promise<MockUpdateType[]> {
    if (useDatabase) {
      try {
        const dbTypes = await updateTypeOperations.getUpdateTypes()
        return dbTypes.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          riskLevel: t.risk_level,
          requiresVerification: t.requires_verification,
          estimatedTime: `${t.estimated_time_minutes || 15} mins`,
          isBiometric: t.requires_biometric,
          canDoOnline: t.can_do_online,
          requiredDocuments: []
        }))
      } catch (error) {
        console.error('Failed to fetch update types from database:', error)
        return []
      }
    }
    return []
  },

  // Time Slots
  async getTimeSlots(centerId: string, date: string): Promise<MockTimeSlot[]> {
    if (useDatabase) {
      try {
        const dbSlots = await timeSlotOperations.getAvailableSlots(centerId, date)
        return dbSlots.map(s => ({
          id: s.id,
          time: s.time,
          available: s.available,
          total: s.total,
          riskLevel: 'low' as const
        }))
      } catch (error) {
        console.error('Failed to fetch time slots from database:', error)
        return []
      }
    }
    return []
  },

  // Appointments
  async createAppointment(appointment: {
    userId: string
    centerId: string
    updateTypeId: string
    timeSlotId: string
    scheduledDate: string
    bookingId: string
    mode: 'in-person' | 'online'
    isAutoAssigned: boolean
  }): Promise<Appointment | null> {
    if (useDatabase) {
      try {
        const result = await appointmentOperations.createAppointment({
          user_id: appointment.userId,
          center_id: appointment.centerId,
          update_type_id: appointment.updateTypeId,
          time_slot_id: appointment.timeSlotId,
          booking_id: appointment.bookingId,
          scheduled_date: appointment.scheduledDate,
          status: 'scheduled',
          mode: appointment.mode,
          is_auto_assigned: appointment.isAutoAssigned
        })
        return result
      } catch (error) {
        console.error('Failed to create appointment in database:', error)
        return null
      }
    }
    return null
  },

  async getAppointments(userId: string): Promise<any[]> {
    if (useDatabase) {
      try {
        return await appointmentOperations.getAppointments(userId)
      } catch (error) {
        console.error('Failed to fetch appointments from database:', error)
        return []
      }
    }
    return []
  },

  // Analytics
  async getBookingStats(): Promise<any> {
    if (useDatabase) {
      try {
        const stats = await analyticsOperations.getDashboardStats()
        if (stats) {
          return {
            totalBookings: stats.total_bookings,
            completedUpdates: stats.completed_updates,
            fraudPrevented: stats.fraud_prevented,
            avgWaitTime: stats.avg_wait_time_minutes,
            satisfactionRate: stats.satisfaction_rate
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats from database:', error)
      }
    }
    return null
  },

  async getFraudStats(): Promise<any> {
    if (useDatabase) {
      try {
        const stats = await analyticsOperations.getFraudStats()
        return stats
      } catch (error) {
        console.error('Failed to fetch fraud stats from database:', error)
      }
    }
    return null
  }
}
