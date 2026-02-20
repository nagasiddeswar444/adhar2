// Mock data for the Aadhaar Update Platform
// All data is synthetic and anonymized - no real PII

export interface Center {
  id: string;
  name: string;
  city: string;
  state: string;
  capacity: number;
  currentLoad: number;
  predictedLoad: number;
  coordinates: { lat: number; lng: number };
}

export interface DemandForecast {
  date: string;
  predicted: number;
  actual?: number;
  capacity: number;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: number;
  total: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface UpdateType {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresVerification: boolean;
  estimatedTime: string;
  isBiometric?: boolean; // If true, AI auto-assigns slot
  canDoOnline?: boolean; // If true, can be completed online with document verification
  requiredDocuments?: string[]; // Documents required for this update
}

export interface BookingStats {
  totalBookings: number;
  completedUpdates: number;
  fraudPrevented: number;
  avgWaitTime: number;
  satisfactionRate: number;
}

// Centers data
export const centers: Center[] = [
  { id: 'CTR001', name: 'Delhi Central Hub', city: 'New Delhi', state: 'Delhi', capacity: 500, currentLoad: 320, predictedLoad: 450, coordinates: { lat: 28.6139, lng: 77.2090 } },
  { id: 'CTR002', name: 'Mumbai Gateway Center', city: 'Mumbai', state: 'Maharashtra', capacity: 600, currentLoad: 480, predictedLoad: 550, coordinates: { lat: 19.0760, lng: 72.8777 } },
  { id: 'CTR003', name: 'Bangalore Tech Park', city: 'Bangalore', state: 'Karnataka', capacity: 450, currentLoad: 280, predictedLoad: 380, coordinates: { lat: 12.9716, lng: 77.5946 } },
  { id: 'CTR004', name: 'Chennai Marina', city: 'Chennai', state: 'Tamil Nadu', capacity: 400, currentLoad: 350, predictedLoad: 390, coordinates: { lat: 13.0827, lng: 80.2707 } },
  { id: 'CTR005', name: 'Kolkata Heritage Center', city: 'Kolkata', state: 'West Bengal', capacity: 380, currentLoad: 200, predictedLoad: 280, coordinates: { lat: 22.5726, lng: 88.3639 } },
  { id: 'CTR006', name: 'Hyderabad Hi-Tech', city: 'Hyderabad', state: 'Telangana', capacity: 420, currentLoad: 310, predictedLoad: 400, coordinates: { lat: 17.3850, lng: 78.4867 } },
];

// Monthly demand forecast
export const monthlyForecast: DemandForecast[] = [
  { date: '2024-01', predicted: 12500, actual: 12800, capacity: 15000 },
  { date: '2024-02', predicted: 11200, actual: 11500, capacity: 15000 },
  { date: '2024-03', predicted: 13800, actual: 14200, capacity: 15000 },
  { date: '2024-04', predicted: 15200, actual: 15000, capacity: 16000 },
  { date: '2024-05', predicted: 14500, actual: 14300, capacity: 16000 },
  { date: '2024-06', predicted: 16800, actual: 16500, capacity: 18000 },
  { date: '2024-07', predicted: 18200, actual: 17800, capacity: 18000 },
  { date: '2024-08', predicted: 17500, actual: 17200, capacity: 18000 },
  { date: '2024-09', predicted: 19500, capacity: 20000 },
  { date: '2024-10', predicted: 21000, capacity: 22000 },
  { date: '2024-11', predicted: 22500, capacity: 24000 },
  { date: '2024-12', predicted: 24000, capacity: 25000 },
];

// Daily forecast for current week
export const weeklyForecast: DemandForecast[] = [
  { date: 'Mon', predicted: 850, actual: 820, capacity: 1000 },
  { date: 'Tue', predicted: 920, actual: 950, capacity: 1000 },
  { date: 'Wed', predicted: 780, actual: 800, capacity: 1000 },
  { date: 'Thu', predicted: 890, actual: 870, capacity: 1000 },
  { date: 'Fri', predicted: 950, actual: 980, capacity: 1000 },
  { date: 'Sat', predicted: 1100, capacity: 1200 },
  { date: 'Sun', predicted: 650, capacity: 800 },
];

// Available time slots
export const timeSlots: TimeSlot[] = [
  { id: 'TS01', time: '09:00 AM - 10:00 AM', available: 15, total: 25, riskLevel: 'low' },
  { id: 'TS02', time: '10:00 AM - 11:00 AM', available: 8, total: 25, riskLevel: 'low' },
  { id: 'TS03', time: '11:00 AM - 12:00 PM', available: 3, total: 25, riskLevel: 'medium' },
  { id: 'TS04', time: '12:00 PM - 01:00 PM', available: 0, total: 20, riskLevel: 'high' },
  { id: 'TS05', time: '02:00 PM - 03:00 PM', available: 12, total: 25, riskLevel: 'low' },
  { id: 'TS06', time: '03:00 PM - 04:00 PM', available: 6, total: 25, riskLevel: 'medium' },
  { id: 'TS07', time: '04:00 PM - 05:00 PM', available: 20, total: 25, riskLevel: 'low' },
  { id: 'TS08', time: '05:00 PM - 06:00 PM', available: 18, total: 25, riskLevel: 'low' },
];

// Update types with risk levels
// isBiometric = true means AI auto-assigns optimal slot (no manual selection)
// canDoOnline = true means simple updates that can be completed online with document upload
export const updateTypes: UpdateType[] = [
  { 
    id: 'UT01', 
    name: 'Address Update', 
    description: 'Change your registered address', 
    riskLevel: 'low', 
    requiresVerification: false, 
    estimatedTime: '10 mins', 
    isBiometric: false,
    canDoOnline: true,
    requiredDocuments: ['Proof of Address (Passport/Utility Bill/Bank Statement)', 'Original Aadhaar Card']
  },
  { 
    id: 'UT02', 
    name: 'Mobile Number Update', 
    description: 'Update linked mobile number', 
    riskLevel: 'medium', 
    requiresVerification: true, 
    estimatedTime: '15 mins', 
    isBiometric: false,
    canDoOnline: true,
    requiredDocuments: ['Original Aadhaar Card', 'New Mobile Number for OTP verification']
  },
  { 
    id: 'UT03', 
    name: 'Email Update', 
    description: 'Change registered email address', 
    riskLevel: 'low', 
    requiresVerification: false, 
    estimatedTime: '10 mins', 
    isBiometric: false,
    canDoOnline: true,
    requiredDocuments: ['Original Aadhaar Card', 'New Email ID for verification']
  },
  { 
    id: 'UT04', 
    name: 'Name Correction', 
    description: 'Correct spelling or update name', 
    riskLevel: 'medium', 
    requiresVerification: true, 
    estimatedTime: '20 mins', 
    isBiometric: false,
    requiredDocuments: ['Original Aadhaar Card', 'Proof of Name (Passport/PAN Card/Voter ID)', 'Marriage Certificate (if applicable)']
  },
  { 
    id: 'UT05', 
    name: 'Date of Birth Correction', 
    description: 'Correct your date of birth', 
    riskLevel: 'high', 
    requiresVerification: true, 
    estimatedTime: '25 mins', 
    isBiometric: false,
    requiredDocuments: ['Original Aadhaar Card', 'Birth Certificate', 'School Leaving Certificate/Passport']
  },
  { 
    id: 'UT06', 
    name: 'Gender Update', 
    description: 'Update gender information', 
    riskLevel: 'high', 
    requiresVerification: true, 
    estimatedTime: '25 mins', 
    isBiometric: false,
    requiredDocuments: ['Original Aadhaar Card', 'Medical Certificate from authorized hospital', 'Affidavit']
  },
  { 
    id: 'UT07', 
    name: 'Photo Update', 
    description: 'Update biometric photograph', 
    riskLevel: 'medium', 
    requiresVerification: true, 
    estimatedTime: '15 mins', 
    isBiometric: true,
    requiredDocuments: ['Original Aadhaar Card', 'Any valid ID proof with photo']
  },
  { 
    id: 'UT08', 
    name: 'Fingerprint Update', 
    description: 'Update biometric fingerprints', 
    riskLevel: 'high', 
    requiresVerification: true, 
    estimatedTime: '20 mins', 
    isBiometric: true,
    requiredDocuments: ['Original Aadhaar Card', 'Any valid ID proof with photo']
  },
  { 
    id: 'UT09', 
    name: 'Iris Scan Update', 
    description: 'Update biometric iris data', 
    riskLevel: 'high', 
    requiresVerification: true, 
    estimatedTime: '20 mins', 
    isBiometric: true,
    requiredDocuments: ['Original Aadhaar Card', 'Any valid ID proof with photo']
  },
];

// Statistics
export const bookingStats: BookingStats = {
  totalBookings: 245890,
  completedUpdates: 238456,
  fraudPrevented: 1247,
  avgWaitTime: 12,
  satisfactionRate: 94.5,
};

// Fraud statistics for comparison
export const fraudStats = {
  beforeSystem: {
    monthlyFraudAttempts: 2500,
    successfulFrauds: 850,
    avgDetectionTime: 72, // hours
    financialLoss: 15000000, // in INR
  },
  afterSystem: {
    monthlyFraudAttempts: 2200,
    successfulFrauds: 120,
    avgDetectionTime: 2, // hours
    financialLoss: 1800000, // in INR
  },
};

// Risk distribution data
export const riskDistribution = [
  { name: 'Low Risk', value: 68, color: 'hsl(145, 65%, 42%)' },
  { name: 'Medium Risk', value: 24, color: 'hsl(38, 92%, 50%)' },
  { name: 'High Risk', value: 8, color: 'hsl(0, 72%, 51%)' },
];

// Hourly load data
export const hourlyLoad = [
  { hour: '9AM', load: 45, capacity: 100 },
  { hour: '10AM', load: 72, capacity: 100 },
  { hour: '11AM', load: 88, capacity: 100 },
  { hour: '12PM', load: 95, capacity: 100 },
  { hour: '1PM', load: 35, capacity: 80 },
  { hour: '2PM', load: 65, capacity: 100 },
  { hour: '3PM', load: 78, capacity: 100 },
  { hour: '4PM', load: 82, capacity: 100 },
  { hour: '5PM', load: 55, capacity: 100 },
];
