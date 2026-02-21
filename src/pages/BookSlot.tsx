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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { centerOperations, timeSlotOperations, appointmentOperations, authOperations, updateTypeOperations } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, Check, Calendar, MapPin, FileEdit, Bot, Sparkles, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';

type Step = 'center' | 'update' | 'slot' | 'confirm' | 'online';

interface CenterData {
  id: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  capacity: number;
  currentLoad?: number;
  predictedLoad?: number;
}

interface UpdateTypeData {
  id: string;
  name: string;
  description?: string;
  risk_level?: 'low' | 'medium' | 'high';
  riskLevel?: 'low' | 'medium' | 'high';
  requires_verification?: boolean;
  requiresVerification?: boolean;
  requires_biometric?: boolean;
  isBiometric?: boolean;
  can_do_online?: boolean;
  canDoOnline?: boolean;
  estimated_time_minutes?: number;
  estimatedTime?: string;
}

interface TimeSlotData {
  id: string;
  center_id: string;
  date: string;
  start_time: string;
  end_time: string;
  available_slots: number;
  total_capacity: number;
}

const BookSlot = () => {
  const { t } = useLanguage();
  const { user: authUser } = useAuth();
  const { user: userProfile, refreshUser } = useUser();
  
  const [currentStep, setCurrentStep] = useState<Step>('update');
  const [centers, setCenters] = useState<CenterData[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCenter, setSelectedCenter] = useState<CenterData | null>(null);
  const [selectedType, setSelectedType] = useState<UpdateTypeData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotData | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [bookingData, setBookingData] = useState<any>(null);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [pendingBiometricBooking, setPendingBiometricBooking] = useState(false);
  const [isOnlineFlow, setIsOnlineFlow] = useState(false);
  const [onlineSubmitted, setOnlineSubmitted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [updateTypes, setUpdateTypes] = useState<UpdateTypeData[]>([]);
  
  // Fetch update types from database
  useEffect(() => {
    const fetchUpdateTypes = async () => {
      try {
        const types = await updateTypeOperations.getUpdateTypes();
        if (types && types.length > 0) {
          setUpdateTypes(types.map((ut: any) => ({
            id: ut.id,
            name: ut.name,
            description: ut.description,
            risk_level: ut.risk_level,
            requires_verification: ut.requires_verification,
            requires_biometric: ut.requires_biometric,
            can_do_online: ut.can_do_online,
            estimated_time_minutes: ut.estimated_time_minutes
          })));
        }
      } catch (error) {
        console.error('Error fetching update types:', error);
      }
    };
    
    fetchUpdateTypes();
  }, []);

  // Fetch centers from database on mount
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        
        // Fetch centers from database
        const centersData = await centerOperations.getCenters();
        if (centersData && centersData.length > 0) {
          setCenters(centersData.map((c: any) => ({
            id: c.id,
            name: c.name,
            city: c.city,
            state: c.state,
            address: c.address,
            capacity: c.capacity || 50,
            currentLoad: c.currentLoad || Math.floor((c.capacity || 50) * 0.5),
            predictedLoad: c.predictedLoad || Math.floor((c.capacity || 50) * 0.6)
          })));
        }
      } catch (error) {
        console.error('Error fetching centers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  // Fetch time slots when center is selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedCenter) return;
      
      try {
        const slotsData = await timeSlotOperations.getAvailableSlots(selectedCenter.id, new Date().toISOString().split('T')[0]);
        if (slotsData) {
          setTimeSlots(slotsData.map((ts: any) => ({
            id: ts.id,
            center_id: ts.center_id,
            date: ts.date,
            start_time: ts.start_time,
            end_time: ts.end_time,
            available_slots: ts.available_slots,
            total_capacity: ts.total_capacity
          })));
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
      }
    };

    fetchTimeSlots();
  }, [selectedCenter]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to auto-assign optimal slot using "AI" logic
  const autoAssignSlot = () => {
    const availableSlots = timeSlots.filter(slot => slot.available_slots > 0);
    if (availableSlots.length === 0) return null;
    
    const sortedSlots = [...availableSlots].sort((a, b) => {
      return b.available_slots - a.available_slots;
    });
    
    return sortedSlots[0];
  };

  // Handle biometric update type selection - show face scan first
  useEffect(() => {
    if (selectedType?.requires_biometric && pendingBiometricBooking) {
      setIsAutoAssigning(true);
      const timer = setTimeout(() => {
        const optimalSlot = autoAssignSlot();
        if (optimalSlot && selectedCenter) {
          setSelectedSlot(optimalSlot);
          setIsAutoAssigning(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedType, pendingBiometricBooking, selectedCenter, timeSlots]);

  // Handle face scan verification complete
  const handleFaceScanVerified = () => {
    setShowFaceScan(false);
    if (selectedType?.requires_biometric) {
      setPendingBiometricBooking(true);
    } else if (selectedType?.can_do_online && isOnlineFlow) {
      setCurrentStep('online');
    } else {
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

  // Create appointment in database
  const createAppointment = async () => {
    if (!selectedCenter || !selectedType || !selectedSlot || !userProfile) return;

    try {
      setBookingLoading(true);

      // Get user's aadhaar record ID from auth
      const userData = await authOperations.getUser(authUser?.id || '');
      const aadhaarRecordId = userData?.aadhaar_record_id;

      if (!aadhaarRecordId) {
        console.error('No aadhaar record found for user');
        return;
      }

      // Create appointment in database
      const result = await appointmentOperations.createAppointment({
        aadhaar_record_id: aadhaarRecordId,
        center_id: selectedCenter.id,
        update_type_id: selectedType.id,
        time_slot_id: selectedSlot.id,
        scheduled_date: selectedSlot.date,
        is_online: isOnlineFlow
      });

      if (result) {
        setBookingId(result.booking_id || result.id);
        setBookingData({
          center: selectedCenter,
          slot: {
            id: selectedSlot.id,
            time: selectedSlot.start_time,
            date: selectedSlot.date,
            available: selectedSlot.available_slots,
            total: selectedSlot.total_capacity
          },
          updateType: {
            id: selectedType.id,
            name: selectedType.name,
            riskLevel: selectedType.risk_level,
            requiresVerification: selectedType.requires_verification,
            isBiometric: selectedType.requires_biometric,
            canDoOnline: selectedType.can_do_online,
            estimatedTime: `${selectedType.estimated_time_minutes || 15} mins`
          },
          bookingId: result.booking_id || result.id,
          userEmail: userProfile.email || authUser?.email || ''
        });
        setIsBooked(true);
        
        // Refresh user appointments
        refreshUser();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle biometric auto-booking
  useEffect(() => {
    if (pendingBiometricBooking && selectedSlot && selectedCenter && selectedType && !isBooked && !bookingLoading) {
      createAppointment();
    }
  }, [pendingBiometricBooking, selectedSlot, selectedCenter, selectedType]);

  // Dynamic steps based on update type and flow
  const getSteps = () => {
    if (isOnlineFlow) {
      return [
        { id: 'update', label: t('booking.updateType'), icon: FileEdit },
        { id: 'online', label: t('booking.submitOnline'), icon: Globe },
      ];
    }
    if (selectedType?.requires_biometric) {
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

  const handleNext = async () => {
    if (currentStep === 'update' && selectedType) {
      setShowFaceScan(true);
    } else if (currentStep === 'center' && selectedCenter) {
      if (selectedType?.requires_biometric) {
        setPendingBiometricBooking(true);
      } else {
        setCurrentStep('slot');
      }
    } else if (currentStep === 'slot' && selectedSlot) {
      await createAppointment();
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

  const handleProceedOnline = () => {
    if (selectedType?.can_do_online) {
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
    setBookingData(null);
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

  const showOnlineOption = currentStep === 'update' && selectedType?.can_do_online && !selectedType?.requires_biometric;
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground">Loading booking options...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                Your online {selectedType.name.toLowerCase()} request has been submitted.
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

  if (isBooked && bookingData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <BookingConfirmation
              center={bookingData.center}
              slot={bookingData.slot}
              updateType={bookingData.updateType}
              bookingId={bookingData.bookingId}
              userEmail={bookingData.userEmail}
              onReset={handleReset}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                    centers={centers}
                    selectedCenter={selectedCenter}
                    onSelectCenter={(center) => setSelectedCenter(center)}
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
                    updateTypes={updateTypes}
                    selectedType={selectedType}
                    onSelectType={(type) => setSelectedType(type)}
                  />
                  
                  {selectedType?.requires_biometric && (
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

              {currentStep === 'slot' && !selectedType?.requires_biometric && (
                <motion.div
                  key="slot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SlotPicker
                    timeSlots={timeSlots}
                    selectedSlot={selectedSlot}
                    onSelectSlot={(slot) => setSelectedSlot(slot)}
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
              disabled={currentStep === 'update' || bookingLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('booking.back')}
            </Button>
            <AnimatePresence mode="wait">
              {canProceed() ? (
                showOnlineOption ? (
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
                      disabled={bookingLoading}
                      className="shadow-glow"
                    >
                      {bookingLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <>
                          {currentStep === 'slot' ? t('booking.confirmBooking') : currentStep === 'update' ? t('booking.verifyContinue') : t('booking.continue')}
                          {currentStep !== 'slot' && <ChevronRight className="w-4 h-4 ml-2" />}
                        </>
                      )}
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
