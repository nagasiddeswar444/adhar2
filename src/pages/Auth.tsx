import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Loader2, CheckCircle2,
  Eye, EyeOff, ArrowRight, Lock, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { CaptchaInput } from '@/components/auth/CaptchaInput';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/language/LanguageSelector';
import { cn } from '@/lib/utils';

// Generate random CAPTCHA code
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

type AuthMode = 'signin' | 'signup' | 'forgotPassword' | 'resetPassword';

const Auth = () => {
  const navigate = useNavigate();
  const { login, signup, sendOtp, verifyOtp, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Aadhar form
  const [aadharNumber, setAadharNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [verified, setVerified] = useState(false);

  // CAPTCHA
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  // OTP countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const id = setTimeout(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [otpTimer]);

  const handleSubmit = async () => {
    setError('');

    // Validate Aadhar number (12 digits)
    if (aadharNumber.length !== 12 || !/^\d+$/.test(aadharNumber)) {
      setError('Please enter a valid 12-digit Aadhar number');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate CAPTCHA
    if (captchaInput.toUpperCase() !== captchaCode) {
      setError('Incorrect CAPTCHA. Please try again.');
      setCaptchaInput('');
      // Generate new CAPTCHA for next attempt
      setCaptchaCode(generateCaptcha());
      return;
    }

    setLoading(true);
    try {
      // For signup, send OTP first
      if (mode === 'signup') {
        // Format phone number with country code if not provided
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        await sendOtp(aadharNumber, 'sms', 'mobile_verification', formattedPhone);
        setOtpSent(true);
        setOtpTimer(30);
      } else {
        // For signin, verify credentials
        const ok = await login(aadharNumber, password);
        if (ok) {
          navigate('/', { replace: true });
        } else {
          setError('Invalid Aadhar number or password');
        }
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError('');
    setLoading(true);
    
    const ok = await verifyOtp(otp, aadharNumber);
    if (ok) {
      // Create account after OTP verification
      // Use dummy values for personalInfo - can be collected in a separate form
      await signup(
        aadharNumber, 
        password,
        email || `${aadharNumber}@example.com`,
        phone || '+91' + aadharNumber.slice(-10),
        {
          fullName: 'User',
          dateOfBirth: '1990-01-01',
          gender: 'Male',
          address: 'Address',
          state: 'State',
          pincode: '000000'
        }
      );
      setVerified(true);
      setTimeout(() => navigate('/'), 1500);
    } else {
      setError('Invalid OTP. Use 123456 for demo.');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    await sendOtp(aadharNumber, 'sms');
    setOtpTimer(30);
    setLoading(false);
  };

  const handleCaptchaRefresh = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
    setError('');
  };

  // Success screen
  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/80">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-primary-foreground"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-14 h-14" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">{t('auth.verificationSuccess')}</h1>
          <p className="text-primary-foreground/70">{t('auth.redirecting')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary via-primary to-primary/80 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pattern-grid opacity-5" />
      <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-20 left-10 w-32 h-32 rounded-full bg-accent/10 blur-3xl" />
      <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-primary-foreground/5 blur-3xl" />

      {/* Language selector */}
      <div className="absolute top-4 right-4 z-20">
        <style>{`
          .auth-language-selector button {
            color: white !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
            background-color: rgba(255, 255, 255, 0.1) !important;
          }
          .auth-language-selector button:hover {
            background-color: rgba(255, 255, 255, 0.2) !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
          }
        `}</style>
        <div className="auth-language-selector">
          <LanguageSelector />
        </div>
      </div>

      {/* Left branding (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative z-10">
        <div className="max-w-md text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Aadhaar Seva</h1>
              <p className="text-sm text-primary-foreground/60">Secure Update Platform</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            {t('auth.secureLogin')}
          </h2>
          <p className="text-lg text-primary-foreground/70">{t('auth.tagline')}</p>

          {/* Tricolor strip */}
          <div className="flex gap-1 mt-8">
            <div className="h-1.5 w-16 rounded-full bg-[hsl(24,96%,53%)]" />
            <div className="h-1.5 w-16 rounded-full bg-primary-foreground/80" />
            <div className="h-1.5 w-16 rounded-full bg-[hsl(140,60%,35%)]" />
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="p-6 sm:p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Aadhaar Seva</h1>
                <p className="text-xs text-muted-foreground">Secure Update Platform</p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-secondary rounded-lg p-1 mb-6">
              <button
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-md transition-all',
                  mode === 'signin' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                )}
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setOtpSent(false);
                  setCaptchaCode(generateCaptcha());
                  setCaptchaInput('');
                }}
              >
                {t('auth.signIn')}
              </button>
              <button
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-md transition-all',
                  mode === 'signup' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                )}
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setOtpSent(false);
                  setCaptchaCode(generateCaptcha());
                  setCaptchaInput('');
                }}
              >
                {t('auth.signUp')}
              </button>
            </div>

            {!otpSent ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-4"
              >
                {/* Aadhar Number */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Aadhar Number
                  </label>
                  <Input 
                    type="text" 
                    placeholder="123456789012" 
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    maxLength={12}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter your 12-digit Aadhar number</p>
                </div>

                {/* Phone for signup */}
                {mode === 'signup' && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Mobile Number
                    </label>
                    <Input 
                      type="tel" 
                      placeholder="6300395240" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter your 10-digit mobile number</p>
                  </div>
                )}

                {/* Email for signup */}
                {mode === 'signup' && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Email Address
                    </label>
                    <Input 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter your email address</p>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (signup only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                     {t('auth.confirmPassword')}
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                )}

                {/* CAPTCHA */}
                <CaptchaInput
                  value={captchaInput}
                  onChange={setCaptchaInput}
                  captchaCode={captchaCode}
                  onRefresh={handleCaptchaRefresh}
                  isLoading={loading}
                />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading || !aadharNumber || !password || (mode === 'signup' && (!confirmPassword || !phone)) || !captchaInput}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-4"
              >
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('auth.otpSentMessage')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aadhar: <span className="font-mono font-bold text-foreground">{aadharNumber}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('auth.demoOtpInstruction')} <span className="font-mono font-bold text-foreground">123456</span>
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Timer */}
                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      OTP expires in <span className="font-bold text-foreground">{otpTimer}s</span>
                    </p>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={handleResendOtp} disabled={loading}>
                      {t('auth.resendOtp')}
                    </Button>
                  )}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {t('auth.verifyOtp')}
                </Button>
              </motion.div>
            )}

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive text-center mt-4">
                {error}
              </motion.p>
            )}

            {/* Footer */}
            <div className="mt-6 text-center space-y-2">
              {mode === 'signin' && (
                <button
                  className="text-sm text-primary font-medium hover:underline block w-full"
                  onClick={() => { setMode('forgotPassword'); setError(''); setOtpSent(false); }}
                >
                  Forgot Password?
                </button>
              )}
              <p className="text-sm text-muted-foreground">
                {mode === 'signin' ? t('auth.noAccount') : mode === 'forgotPassword' || mode === 'resetPassword' ? (
                  <>
                    Remember your password?{' '}
                    <button
                      className="text-primary font-medium hover:underline"
                      onClick={() => { setMode('signin'); setError(''); setOtpSent(false); }}
                    >
                      Sign In
                    </button>
                  </>
                ) : t('auth.hasAccount')}{' '}
                {mode !== 'forgotPassword' && mode !== 'resetPassword' && (
                  <button
                    className="text-primary font-medium hover:underline"
                    onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setOtpSent(false); }}
                  >
                    {mode === 'signin' ? t('auth.signUp') : t('auth.signIn')}
                  </button>
                )}
              </p>
            </div>

            {/* Tricolor */}
            <div className="flex gap-1 justify-center mt-6">
              <div className="h-1 w-10 rounded-full bg-[hsl(24,96%,53%)]" />
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              <div className="h-1 w-10 rounded-full bg-[hsl(140,60%,35%)]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
