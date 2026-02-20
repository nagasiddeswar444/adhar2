import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SlotPicker } from '@/components/booking/SlotPicker';
import { UpdateTypePicker } from '@/components/booking/UpdateTypePicker';
import { CenterPicker } from '@/components/booking/CenterPicker';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { FaceScanVerification } from '@/components/booking/FaceScanVerification';
import { OnlineUpdateFlow } from '@/components/booking/OnlineUpdateFlow';
import { SecurityGate } from '@/components/auth/SecurityGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type Center, type TimeSlot, type UpdateType, timeSlots, centers } from '@/data/mockData';
import { ChevronLeft, ChevronRight, Check, Calendar, MapPin, FileEdit, Bot, Sparkles, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

type Step = 'center' | 'update' | 'slot' | 'confirm' | 'online';

const BookSlot = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>('update');
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [selectedType, setSelectedType] = useState<UpdateType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [pendingBiometricBooking, setPendingBiometricBooking] = useState(false);
  const [isOnlineFlow, setIsOnlineFlow] = useState(false);
  const [onlineSubmitted, setOnlineSubmitted] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to auto-assign optimal slot using "AI" logic
  const autoAssignSlot = () => {
    // Find the best available slot (lowest load, most availability)
    const availableSlots = timeSlots.filter(slot => slot.available > 0);
    if (availableSlots.length === 0) return null;
    
    // Sort by: 1) low risk first, 2) most availability
    const sortedSlots = [...availableSlots].sort((a, b) => {
      const riskOrder = { low: 0, medium: 1, high: 2 };
      if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      }
      return b.available - a.available;
    });
    
    return sortedSlots[0];
  };

  // Handle biometric update type selection - show face scan first
  useEffect(() => {
    if (selectedType?.isBiometric && pendingBiometricBooking) {
      setIsAutoAssigning(true);
      const timer = setTimeout(() => {
        const optimalSlot = autoAssignSlot();
        if (optimalSlot) {
          setSelectedSlot(optimalSlot);
          // Auto-assign nearest center too
          if (!selectedCenter) {
            setSelectedCenter(centers[0]);
          }
          setIsAutoAssigning(false);
          const id = `ADH${Date.now().toString(36).toUpperCase()}`;
          setBookingId(id);
          setIsBooked(true);
          setPendingBiometricBooking(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedType, pendingBiometricBooking, selectedCenter]);

  // Handle face scan verification complete
  const handleFaceScanVerified = () => {
    setShowFaceScan(false);
    if (selectedType?.isBiometric) {
      // For biometric updates, auto-assign slot
      setPendingBiometricBooking(true);
    } else if (selectedType?.canDoOnline && isOnlineFlow) {
      // For online updates, proceed to online flow step
      setCurrentStep('online');
    } else {
      // For non-biometric in-person updates, proceed to center selection
      setCurrentStep('center');
    }
  };

  const handleFaceScanCancel = () => {
    setShowFaceScan(false);
    setIsOnlineFlow(false);
  };

  // Handle online submission complete
  const handleOnlineSubmit = () => {
    setOnlineSubmitted(true);
  };

  const handleOnlineCancel = () => {
    setCurrentStep('update');
    setIsOnlineFlow(false);
  };

  // Dynamic steps based on update type and flow
  const getSteps = () => {
    if (isOnlineFlow) {
      return [
        { id: 'update', label: t('booking.updateType'), icon: FileEdit },
        { id: 'online', label: t('booking.submitOnline'), icon: Globe },
      ];
    }
    if (selectedType?.isBiometric) {
      return [
        { id: 'update', label: t('booking.updateType'), icon: FileEdit },
        { id: 'center', label: t('booking.selectCenter'), icon: MapPin },
      ];
    }
    return [
      { id: 'update', label: t('booking.updateType'), icon: FileEdit },
      { id: 'center', label: t('booking.selectCenter'), icon: MapPin },
      { id: 'slot', label: t('booking.chooseSlot'), icon: Calendar },
    ];
  };

  const steps = getSteps();

  const handleNext = () => {
    if (currentStep === 'update' && selectedType) {
      // All updates require face scan verification for security
      setShowFaceScan(true);
    } else if (currentStep === 'center' && selectedCenter) {
      if (selectedType?.isBiometric) {
        // Biometric gets auto-assigned
        setPendingBiometricBooking(true);
      } else {
        setCurrentStep('slot');
      }
    } else if (currentStep === 'slot' && selectedSlot) {
      // Generate booking ID and confirm
      const id = `ADH${Date.now().toString(36).toUpperCase()}`;
      setBookingId(id);
      setIsBooked(true);
    }
  };

  const handleBack = () => {
    if (currentStep === 'center') {
      setCurrentStep('update');
      setSelectedCenter(null);
      setSelectedSlot(null);
    } else if (currentStep === 'slot') {
      setCurrentStep('center');
    } else if (currentStep === 'online') {
      setCurrentStep('update');
      setIsOnlineFlow(false);
    }
  };

  // Handle choosing online vs in-person for online-capable updates
  const handleProceedOnline = () => {
    if (selectedType?.canDoOnline) {
      setIsOnlineFlow(true);
      setShowFaceScan(true);
    }
  };

  const handleProceedInPerson = () => {
    setIsOnlineFlow(false);
    setShowFaceScan(true);
  };

  const handleReset = () => {
    setCurrentStep('update');
    setSelectedCenter(null);
    setSelectedType(null);
    setSelectedSlot(null);
    setIsBooked(false);
    setBookingId('');
    setIsAutoAssigning(false);
    setShowFaceScan(false);
    setPendingBiometricBooking(false);
    setIsOnlineFlow(false);
    setOnlineSubmitted(false);
  };

  const canProceed = () => {
    if (currentStep === 'center') return selectedCenter !== null;
    if (currentStep === 'update') return selectedType !== null;
    if (currentStep === 'slot') return selectedSlot !== null;
    return false;
  };

  // Check if current selection can do online
  const showOnlineOption = currentStep === 'update' && selectedType?.canDoOnline && !selectedType?.isBiometric;

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // Online submission success view
  if (onlineSubmitted && selectedType) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{t('booking.requestSubmitted')}</h1>
              <p className="text-muted-foreground mb-6">
                Your online {selectedType.name.toLowerCase()} {t('booking.requestSubmittedDesc')}
              </p>
              <Button onClick={handleReset} variant="gold" size="lg">
                {t('booking.startNewRequest')}
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isBooked && selectedCenter && selectedSlot && selectedType) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <BookingConfirmation
              center={selectedCenter}
              slot={selectedSlot}
              updateType={selectedType}
              bookingId={bookingId}
              userEmail="user@aadhaar.linked.email"
              onReset={handleReset}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show face scan overlay for biometric updates
  const renderFaceScan = showFaceScan && (
    <FaceScanVerification
      onVerified={handleFaceScanVerified}
      onCancel={handleFaceScanCancel}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      {renderFaceScan}
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-2"
            >
              {t('booking.title')}
            </motion.h1>
            <p className="text-muted-foreground">
              {t('booking.subtitle')}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                          isCompleted
                            ? "bg-success text-success-foreground"
                            : isActive
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-sm font-medium",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-20 md:w-32 h-1 mx-2 rounded-full transition-colors",
                          isCompleted ? "bg-success" : "bg-border"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {currentStep === 'center' && (
                <motion.div
                  key="center"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <CenterPicker
                    selectedCenter={selectedCenter}
                    onSelectCenter={setSelectedCenter}
                  />
                </motion.div>
              )}

              {currentStep === 'update' && (
                <motion.div
                  key="update"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <UpdateTypePicker
                    selectedType={selectedType}
                    onSelectType={setSelectedType}
                  />
                  
                  {/* AI Auto-Assignment Message for Biometric Updates */}
                  {selectedType?.isBiometric && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <Card className="border-primary/30 bg-primary/5">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Bot className="w-5 h-5 text-primary" />
                            {t('booking.aiSlotAssignment')}
                          </CardTitle>
                          <CardDescription>
                            {t('booking.biometricDesc')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isAutoAssigning ? (
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                <Sparkles className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{t('booking.analyzingSlots')}</p>
                                <p className="text-sm text-muted-foreground">
                                  {t('booking.findingSlot')}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              <Sparkles className="w-4 h-4 inline mr-1 text-gold" />
                              {t('booking.aiAutoAssignDesc')}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {currentStep === 'slot' && !selectedType?.isBiometric && (
                <motion.div
                  key="slot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SlotPicker
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                  />
                </motion.div>
              )}

              {currentStep === 'online' && selectedType && (
                <motion.div
                  key="online"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <OnlineUpdateFlow
                    updateType={selectedType}
                    onSubmit={handleOnlineSubmit}
                    onCancel={handleOnlineCancel}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
        
        {/* Navigation - Fixed at bottom for visibility - hidden during face scan and online flow */}
        {!showFaceScan && currentStep !== 'online' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-t shadow-lg z-40"
          >
          <div className="container mx-auto max-w-3xl flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'update'}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('booking.back')}
            </Button>
            <AnimatePresence mode="wait">
              {canProceed() ? (
                showOnlineOption ? (
                  // For online-capable updates, show both options
                  <motion.div
                    key="online-options"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="flex gap-2"
                  >
                    <Button
                      variant="outline"
                      onClick={handleProceedInPerson}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {t('booking.visitCenter')}
                    </Button>
                    <Button
                      variant="gold"
                      size="lg"
                      onClick={handleProceedOnline}
                      className="shadow-glow"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      {t('booking.completeOnline')}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`proceed-${currentStep}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Button
                      variant="gold"
                      size="lg"
                      onClick={handleNext}
                      className="shadow-glow"
                    >
                      {currentStep === 'slot' ? t('booking.confirmBooking') : currentStep === 'update' ? t('booking.verifyContinue') : t('booking.continue')}
                      {currentStep !== 'slot' && <ChevronRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </motion.div>
                )
              ) : (
                <span className="text-sm text-muted-foreground">{t('booking.selectOption')}</span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BookSlot;
