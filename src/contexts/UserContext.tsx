import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TimeSlot, Center, UpdateType, centers, timeSlots } from '@/data/mockData';

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
}

export interface ScheduledAppointment {
  id: string;
  center: Center;
  slot: TimeSlot;
  updateType: UpdateType;
  scheduledDate: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  autoBooked: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  appointments: ScheduledAppointment[];
  addAppointment: (appointment: Omit<ScheduledAppointment, 'id' | 'scheduledDate' | 'status'>) => void;
  needsBiometricUpdate: boolean;
  pendingAutoBooking: ScheduledAppointment | null;
  clearPendingAutoBooking: () => void;
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

// Auto-assign optimal slot for biometric
const autoAssignSlot = (): TimeSlot => {
  const availableSlots = timeSlots.filter(slot => slot.available > 0);
  const sortedSlots = [...availableSlots].sort((a, b) => {
    const riskOrder = { low: 0, medium: 1, high: 2 };
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return b.available - a.available;
  });
  return sortedSlots[0] || timeSlots[0];
};

export function UserProvider({ children }: { children: ReactNode }) {
  // Mock user profile - in real app this would come from auth/API
  const [user] = useState<UserProfile>({
    id: 'USR001',
    name: 'Rahul Sharma',
    aadhaarNumber: 'XXXX-XXXX-1234',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210',
    dateOfBirth: new Date(2011, 0, 15), // 15 years old - biometric update needed
    lastBiometricUpdate: new Date(2020, 5, 10), // Last updated when 5 years old
    address: '123, MG Road, Bangalore, Karnataka 560001',
  });

  const [appointments, setAppointments] = useState<ScheduledAppointment[]>([]);
  const [pendingAutoBooking, setPendingAutoBooking] = useState<ScheduledAppointment | null>(null);

  const needsBiometricUpdate = user ? checkBiometricNeeded(user.dateOfBirth, user.lastBiometricUpdate) : false;

  // Auto-book slot if biometric update is needed
  useEffect(() => {
    if (needsBiometricUpdate && !appointments.some(a => a.autoBooked && a.status === 'scheduled')) {
      // Auto-book for Photo Update (biometric)
      const autoSlot = autoAssignSlot();
      const nearestCenter = centers[0]; // Pick first center, could be smarter
      
      const autoAppointment: ScheduledAppointment = {
        id: `AUTO-${Date.now().toString(36).toUpperCase()}`,
        center: nearestCenter,
        slot: autoSlot,
        updateType: {
          id: 'UT07',
          name: 'Photo Update',
          description: 'Update biometric photograph (Age-based mandatory update)',
          riskLevel: 'medium',
          requiresVerification: true,
          estimatedTime: '15 mins',
          isBiometric: true,
        },
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'scheduled',
        autoBooked: true,
      };
      
      setPendingAutoBooking(autoAppointment);
      setAppointments(prev => [...prev, autoAppointment]);
    }
  }, [needsBiometricUpdate, appointments]);

  const addAppointment = (appointment: Omit<ScheduledAppointment, 'id' | 'scheduledDate' | 'status'>) => {
    const newAppointment: ScheduledAppointment = {
      ...appointment,
      id: `ADH-${Date.now().toString(36).toUpperCase()}`,
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
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
        addAppointment,
        needsBiometricUpdate,
        pendingAutoBooking,
        clearPendingAutoBooking,
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
