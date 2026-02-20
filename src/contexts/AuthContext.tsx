import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { authOperations, AadhaarRecord } from '@/lib/database';

export interface AuthUser {
  id: string;
  aadharNumber: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  aadhaarRecord: AadhaarRecord | null;
  isAuthenticated: boolean;
  isSecureVerified: boolean;
  login: (aadharNumber: string, password: string) => Promise<boolean>;
  signup: (aadharNumber: string, password: string, email: string, phone: string, personalInfo: { fullName: string; dateOfBirth: string; gender: string; address: string; state: string; district?: string; city?: string; pincode: string }) => Promise<boolean>;
  sendOtp: (target: string, method: 'sms' | 'email', type?: string, phone?: string) => Promise<boolean>;
  verifyOtp: (otp: string, aadhaarNumber: string, type?: string) => Promise<boolean>;
  logout: () => void;
  secureVerify: (password: string) => Promise<boolean>;
  secureVerifyOtp: (otp: string, aadhaarNumber: string) => Promise<boolean>;
  clearSecureVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for localStorage
const saveAuthToStorage = (user: AuthUser | null, aadhaarRecord: AadhaarRecord | null) => {
  if (user) {
    localStorage.setItem('aadhaar_auth_user', JSON.stringify(user));
    if (aadhaarRecord) {
      localStorage.setItem('aadhaar_record', JSON.stringify(aadhaarRecord));
    }
  } else {
    localStorage.removeItem('aadhaar_auth_user');
    localStorage.removeItem('aadhaar_record');
  }
};

const loadAuthFromStorage = (): { user: AuthUser | null; aadhaarRecord: AadhaarRecord | null } => {
  try {
    const storedUser = localStorage.getItem('aadhaar_auth_user');
    const storedRecord = localStorage.getItem('aadhaar_record');
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      aadhaarRecord: storedRecord ? JSON.parse(storedRecord) : null,
    };
  } catch {
    return { user: null, aadhaarRecord: null };
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthFromStorage().user);
  const [aadhaarRecord, setAadhaarRecord] = useState<AadhaarRecord | null>(() => loadAuthFromStorage().aadhaarRecord);
  const [isSecureVerified, setIsSecureVerified] = useState(false);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    saveAuthToStorage(user, aadhaarRecord);
  }, [user, aadhaarRecord]);

  const login = useCallback(async (aadharNumber: string, password: string): Promise<boolean> => {
    try {
      // Call database auth operation
      const result = await authOperations.login(aadharNumber, password);
      
      if (result) {
        const { user: dbUser, aadhaarRecord: record } = result;
        
        // Map database user to AuthUser format
        const authUser: AuthUser = {
          id: dbUser.id,
          aadharNumber: aadharNumber,
          email: dbUser.email,
          phone: dbUser.phone,
        };
        
        setUser(authUser);
        setAadhaarRecord(record);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const signup = useCallback(async (
    aadharNumber: string, 
    password: string,
    email: string,
    phone: string,
    personalInfo: {
      fullName: string;
      dateOfBirth: string;
      gender: string;
      address: string;
      state: string;
      district?: string;
      city?: string;
      pincode: string;
    }
  ): Promise<boolean> => {
    try {
      // Call database auth operation
      const result = await authOperations.signup(
        aadharNumber,
        password,
        email,
        phone,
        personalInfo
      );
      
      if (result) {
        const { user: dbUser, aadhaarRecord: record } = result;
        
        // Map database user to AuthUser format
        const authUser: AuthUser = {
          id: dbUser.id,
          aadharNumber: aadharNumber,
          email: dbUser.email,
          phone: dbUser.phone,
        };
        
        setUser(authUser);
        setAadhaarRecord(record);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  }, []);

  const sendOtp = useCallback(async (target: string, method: 'sms' | 'email', type: string = 'login', phone?: string): Promise<boolean> => {
    try {
      // Call the backend API to send OTP
      const result = await authOperations.sendOTP(target, method, type, phone);
      if (result.otp) {
        // Store OTP in sessionStorage for development/testing
        sessionStorage.setItem('current_otp', result.otp);
        console.log('OTP sent:', result.otp); // For development
      }
      return result.otp !== null || result.message.includes('sent');
    } catch (error) {
      console.error('Send OTP error:', error);
      return false;
    }
  }, []);

  const verifyOtp = useCallback(async (otp: string, aadhaarNumber: string, type: string = 'login'): Promise<boolean> => {
    try {
      // Call the backend API to verify OTP
      const result = await authOperations.verifyOTP(otp, aadhaarNumber, type);
      if (result.valid) {
        // If no user yet (mobile login), create one
        if (!user) {
          setUser({
            id: `USR${Date.now().toString(36)}`,
            aadharNumber: aadhaarNumber,
          });
        }
      }
      return result.valid;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return false;
    }
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setAadhaarRecord(null);
    setIsSecureVerified(false);
    saveAuthToStorage(null, null);
  }, []);

  const secureVerify = useCallback(async (password: string): Promise<boolean> => {
    try {
      // Call the backend API for secure verification
      // For now, we'll use a simple implementation
      const storedUser = user;
      if (storedUser && storedUser.id) {
        setIsSecureVerified(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Secure verify error:', error);
      return false;
    }
  }, [user]);

  const secureVerifyOtp = useCallback(async (otp: string, aadhaarNumber: string): Promise<boolean> => {
    try {
      // Call the backend API to verify OTP for secure verification
      const result = await authOperations.verifyOTP(otp, aadhaarNumber, 'mobile_verification');
      if (result.valid) {
        setIsSecureVerified(true);
      }
      return result.valid;
    } catch (error) {
      console.error('Secure verify OTP error:', error);
      return false;
    }
  }, []);

  const clearSecureVerification = useCallback(() => {
    setIsSecureVerified(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        aadhaarRecord,
        isAuthenticated: !!user,
        isSecureVerified,
        login,
        signup,
        sendOtp,
        verifyOtp,
        logout,
        secureVerify,
        secureVerifyOtp,
        clearSecureVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
