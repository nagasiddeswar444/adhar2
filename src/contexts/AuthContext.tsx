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
  sendOtp: (target: string, method: 'sms' | 'email') => Promise<boolean>;
  verifyOtp: (otp: string, phone?: string, email?: string) => Promise<boolean>;
  logout: () => void;
  secureVerify: (password: string) => Promise<boolean>;
  secureVerifyOtp: (otp: string) => Promise<boolean>;
  clearSecureVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock OTP (always 123456) - for demo purposes
const MOCK_OTP = '123456';

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

  const sendOtp = useCallback(async (_target: string, _method: 'sms' | 'email'): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    // In production, call Twilio or email API here
    return true;
  }, []);

  const verifyOtp = useCallback(async (otp: string, _phone?: string, _email?: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 600));
    if (otp === MOCK_OTP) {
      // If no user yet (mobile login), create one
      if (!user) {
        setUser({
          id: `USR${Date.now().toString(36)}`,
          aadharNumber: '000000000000',
        });
      }
      return true;
    }
    return false;
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setAadhaarRecord(null);
    setIsSecureVerified(false);
    saveAuthToStorage(null, null);
  }, []);

  const secureVerify = useCallback(async (_password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    setIsSecureVerified(true);
    return true;
  }, []);

  const secureVerifyOtp = useCallback(async (otp: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    if (otp === MOCK_OTP) {
      setIsSecureVerified(true);
      return true;
    }
    return false;
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
