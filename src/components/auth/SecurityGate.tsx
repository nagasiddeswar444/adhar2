import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, KeyRound, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface SecurityGateProps {
  children: React.ReactNode;
}

export function SecurityGate({ children }: SecurityGateProps) {
  const { isSecureVerified, secureVerify, secureVerifyOtp, sendOtp, user } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isSecureVerified) {
    return <>{children}</>;
  }

  const handlePasswordVerify = async () => {
    setLoading(true);
    setError('');
    const ok = await secureVerify(password);
    setLoading(false);
    if (!ok) setError(t('auth.invalidPassword'));
  };

  const handleSendOtp = async () => {
    setLoading(true);
    await sendOtp(user?.phone || '', 'sms');
    setOtpSent(true);
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    const ok = await secureVerifyOtp(otp);
    setLoading(false);
    if (!ok) setError('Invalid OTP. Use 123456 for demo.');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card variant="glass">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>{t('auth.reVerify')}</CardTitle>
            <CardDescription>{t('auth.reVerifyDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toggle mode */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'password' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => { setMode('password'); setError(''); }}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Password
              </Button>
              <Button
                variant={mode === 'otp' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => { setMode('otp'); setError(''); }}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                OTP
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'password' ? (
                <motion.div key="pw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <Input
                    type="password"
                    placeholder={t('auth.enterPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordVerify()}
                  />
                  <Button className="w-full" onClick={handlePasswordVerify} disabled={loading || !password}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {t('auth.verifyOtp')}
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {!otpSent ? (
                    <Button className="w-full" onClick={handleSendOtp} disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {t('auth.sendOtp')}
                    </Button>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground text-center">
                        {t('auth.enterOtp')} (Use <span className="font-mono font-bold">123456</span>)
                      </p>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                          <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <InputOTPSlot key={i} index={i} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <Button className="w-full" onClick={handleVerifyOtp} disabled={loading || otp.length !== 6}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {t('auth.verifyOtp')}
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
