import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScanFace, Shield, CheckCircle, Loader2, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface FaceScanVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
}

export function FaceScanVerification({ onVerified, onCancel }: FaceScanVerificationProps) {
  const { t } = useLanguage();
  const [scanStage, setScanStage] = useState<'ready' | 'scanning' | 'verified'>('ready');
  const [progress, setProgress] = useState(0);

  const startScan = () => {
    setScanStage('scanning');
    setProgress(0);
  };

  useEffect(() => {
    if (scanStage === 'scanning') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanStage('verified');
            setTimeout(() => {
              onVerified();
            }, 1500);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [scanStage, onVerified]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <Card className="max-w-md w-full border-primary/30">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{t('booking.faceVerification')}</CardTitle>
          <CardDescription>
            {t('booking.faceVerificationDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Face Scan Area */}
          <div className="relative">
            <div 
              className={cn(
                "aspect-square max-w-[250px] mx-auto rounded-full border-4 overflow-hidden transition-all duration-300",
                scanStage === 'ready' && "border-muted-foreground/30",
                scanStage === 'scanning' && "border-primary animate-pulse",
                scanStage === 'verified' && "border-success"
              )}
            >
              <div className="w-full h-full bg-gradient-to-b from-secondary to-muted flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                  {scanStage === 'ready' && (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">{t('booking.positionFace')}</p>
                    </motion.div>
                  )}
                  
                  {scanStage === 'scanning' && (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <ScanFace className="w-20 h-20 text-primary mx-auto animate-pulse" />
                      <motion.div
                        className="absolute inset-0 border-4 border-primary/50 rounded-full"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0.2, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      />
                    </motion.div>
                  )}
                  
                  {scanStage === 'verified' && (
                    <motion.div
                      key="verified"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center"
                    >
                      <CheckCircle className="w-20 h-20 text-success mx-auto" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Progress bar for scanning */}
            {scanStage === 'scanning' && (
              <div className="mt-4">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Scanning... {progress}%
                </p>
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="text-center">
            {scanStage === 'ready' && (
              <p className="text-sm text-muted-foreground">
                {t('booking.clickStartScan')}
              </p>
            )}
            {scanStage === 'scanning' && (
              <p className="text-sm text-primary font-medium">
                <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
                {t('booking.verifyingBiometrics')}
              </p>
            )}
            {scanStage === 'verified' && (
              <p className="text-sm text-success font-medium">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                {t('booking.faceVerifiedSuccess')}
              </p>
            )}
          </div>

          {/* Actions */}
          {scanStage === 'ready' && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                {t('booking.cancel')}
              </Button>
              <Button variant="gold" onClick={startScan} className="flex-1">
                <ScanFace className="w-4 h-4 mr-2" />
                {t('booking.startScan')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
