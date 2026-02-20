import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface AuthUser {
  id: string;
  aadharNumber: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSecureVerified: boolean;
  login: (aadharNumber: string, password: string) => Promise<boolean>;
  signup: (aadharNumber: string, password: string) => Promise<boolean>;
  sendOtp: (target: string, method: 'sms' | 'email') => Promise<boolean>;
  verifyOtp: (otp: string, phone?: string, email?: string) => Promise<boolean>;
  logout: () => void;
  secureVerify: (password: string) => Promise<boolean>;
  secureVerifyOtp: (otp: string) => Promise<boolean>;
  clearSecureVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database using aadhar number as key
const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  '123456789012': {
    password: 'password123',
    user: {
      id: 'USR001',
      aadharNumber: '123456789012',
      name: 'Rahul Sharma',
      email: 'rahul@email.com',
      phone: '+91 98765 43210',
    },
  },
};

// Mock OTP (always 123456)
const MOCK_OTP = '123456';

// Helper functions for localStorage
const saveAuthToStorage = (user: AuthUser | null) => {
  if (user) {
    localStorage.setItem('aadhaar_auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('aadhaar_auth_user');
  }
};

const loadAuthFromStorage = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem('aadhaar_auth_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthFromStorage());
  const [isSecureVerified, setIsSecureVerified] = useState(false);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    saveAuthToStorage(user);
  }, [user]);

  const login = useCallback(async (aadharNumber: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));
    const entry = MOCK_USERS[aadharNumber];
    if (entry && entry.password === password) {
      setUser(entry.user);
      return true;
    }
    // Allow any aadhar/password combo for demo
    const demoUser: AuthUser = {
      id: `USR${Date.now().toString(36)}`,
      aadharNumber,
    };
    setUser(demoUser);
    return true;
  }, []);

  const signup = useCallback(async (aadharNumber: string, _password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));
    const newUser: AuthUser = {
      id: `USR${Date.now().toString(36)}`,
      aadharNumber,
    };
    MOCK_USERS[aadharNumber] = { password: _password, user: newUser };
    setUser(newUser);
    return true;
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
    setIsSecureVerified(false);
    saveAuthToStorage(null);
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
