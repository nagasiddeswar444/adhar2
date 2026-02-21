import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authOperations, appointmentOperations } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

// Biometric update is required at ages: 5, 15, and once after 15 (every 10 years)
const BIOMETRIC_UPDATE_AGES = [5, 15, 25, 35, 45, 55, 65, 75, 85];

export interface UserProfile {
  id: string;
  name: string;
  aadhaarNumber: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  lastBiometricUpdate?: Date;
  address: string;
  state?: string;
  city?: string;
  pincode?: string;
}

export interface ScheduledAppointment {
  id: string;
  center: any;
  slot: any;
  updateType: any;
  scheduledDate: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  autoBooked: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  appointments: ScheduledAppointment[];
  loading: boolean;
  addAppointment: (appointment: Omit<ScheduledAppointment, 'id' | 'scheduledDate' | 'status'>) => void;
  needsBiometricUpdate: boolean;
  pendingAutoBooking: ScheduledAppointment | null;
  clearPendingAutoBooking: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Calculate age from date of birth
const calculateAge = (dob: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// Check if user needs biometric update based on age
const checkBiometricNeeded = (dob: Date, lastUpdate?: Date): boolean => {
  const age = calculateAge(dob);
  
  // Find if current age matches any biometric milestone
  const needsUpdate = BIOMETRIC_UPDATE_AGES.some(milestone => {
    // Within 1 year of milestone age
    return age >= milestone && age < milestone + 1;
  });
  
  if (!needsUpdate) return false;
  
  // Check if already updated this year
  if (lastUpdate) {
    const updateYear = lastUpdate.getFullYear();
    const currentYear = new Date().getFullYear();
    if (updateYear === currentYear) return false;
  }
  
  return true;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>([]);
  const [pendingAutoBooking, setPendingAutoBooking] = useState<ScheduledAppointment | null>(null);
  const [loading, setLoading] = useState(true);

  const needsBiometricUpdate = user ? checkBiometricNeeded(user.dateOfBirth, user.lastBiometricUpdate) : false;

  // Fetch user profile and appointments from database
  const refreshUser = async () => {
    if (!authUser?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get user data from database
      const userData = await authOperations.getUser(authUser.id);
      
      if (userData) {
        // Get aadhaar record for full profile
        const aadhaarRecord = await authOperations.getAadhaarRecord(userData.aadhaar_record_id);
        
        if (aadhaarRecord) {
          setUser({
            id: userData.id,
            name: aadhaarRecord.full_name || '',
            aadhaarNumber: aadhaarRecord.aadhaar_number || '',
            email: userData.email || '',
            phone: aadhaarRecord.phone || userData.phone || '',
            dateOfBirth: aadhaarRecord.date_of_birth ? new Date(aadhaarRecord.date_of_birth) : new Date(),
            lastBiometricUpdate: aadhaarRecord.last_biometric_update ? new Date(aadhaarRecord.last_biometric_update) : undefined,
            address: aadhaarRecord.address || '',
            state: aadhaarRecord.state || '',
            city: aadhaarRecord.city || '',
            pincode: aadhaarRecord.pincode || '',
          });
        } else {
          // Fallback if no aadhaar record
          setUser({
            id: userData.id,
            name: '',
            aadhaarNumber: '',
            email: userData.email || '',
            phone: userData.phone || '',
            dateOfBirth: new Date(),
            address: '',
          });
        }
      }

      // Get appointments from database
      if (userData?.aadhaar_record_id) {
        const dbAppointments = await appointmentOperations.getAppointments(userData.aadhaar_record_id);
        
        if (dbAppointments && dbAppointments.length > 0) {
          const mappedAppointments: ScheduledAppointment[] = dbAppointments.map((apt: any) => ({
            id: apt.id,
            center: {
              id: apt.center_id,
              name: apt.center_name || '',
              city: apt.center_city || '',
              state: apt.center_state || '',
              address: '',
              capacity: 0,
            },
            slot: {
              id: apt.time_slot_id,
              time: apt.start_time || '',
              available: 0,
              total: 0,
            },
            updateType: {
              id: apt.update_type_id,
              name: apt.update_type_name || '',
              riskLevel: 'medium',
            },
            scheduledDate: new Date(apt.scheduled_date),
            status: apt.status,
            autoBooked: apt.is_auto_assigned || false,
          }));
          setAppointments(mappedAppointments);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when auth user changes
  useEffect(() => {
    refreshUser();
  }, [authUser?.id]);

  // Auto-book slot if biometric update is needed
  useEffect(() => {
    if (needsBiometricUpdate && !appointments.some(a => a.autoBooked && a.status === 'scheduled')) {
      // For now, don't auto-book - just show the need
      // Auto-book functionality can be implemented later
    }
  }, [needsBiometricUpdate, appointments]);

  const addAppointment = (appointment: Omit<ScheduledAppointment, 'id' | 'scheduledDate' | 'status'>) => {
    const newAppointment: ScheduledAppointment = {
      ...appointment,
      id: `ADH-${Date.now().toString(36).toUpperCase()}`,
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'scheduled',
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const clearPendingAutoBooking = () => {
    setPendingAutoBooking(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        appointments,
        loading,
        addAppointment,
        needsBiometricUpdate,
        pendingAutoBooking,
        clearPendingAutoBooking,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
