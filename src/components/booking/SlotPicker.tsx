import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Clock, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { timeSlotOperations } from '@/lib/database';

interface TimeSlotData {
  id: string;
  center_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  time?: string;
  available_slots?: number;
  available?: number;
  total_capacity?: number;
  total?: number;
}

interface SlotPickerProps {
  timeSlots?: TimeSlotData[];
  selectedSlot: TimeSlotData | null;
  onSelectSlot: (slot: TimeSlotData) => void;
}

export function SlotPicker({ timeSlots, selectedSlot, onSelectSlot }: SlotPickerProps) {
  const { t } = useLanguage();
  const [dbSlots, setDbSlots] = useState<TimeSlotData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const fetchedSlots = await timeSlotOperations.getTimeSlots('', '');
        setDbSlots(fetchedSlots);
      } catch (error) {
        console.error('Failed to fetch time slots:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!timeSlots) {
      fetchSlots();
    } else {
      setLoading(false);
    }
  }, [timeSlots]);
  
  // Use provided slots or fetch from database
  const displaySlots = timeSlots || dbSlots;

  // Helper to get time string from either format
  const getTimeString = (slot: TimeSlotData): string => {
    if (slot.time) return slot.time;
    if (slot.start_time && slot.end_time) return `${slot.start_time} - ${slot.end_time}`;
    return 'N/A';
  };

  // Helper to get available count
  const getAvailable = (slot: TimeSlotData): number => {
    return slot.available_slots !== undefined ? slot.available_slots : (slot.available || 0);
  };

  // Helper to get total count
  const getTotal = (slot: TimeSlotData): number => {
    return slot.total_capacity !== undefined ? slot.total_capacity : (slot.total || 0);
  };

  const getRiskBadge = (_risk: string) => {
    // Default to low risk since database might not have this
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">{t('booking.lowWait')}</span>;
  };

  const handleSlotSelect = (slot: TimeSlotData) => {
    const available = getAvailable(slot);
    if (available > 0) {
      console.log('Slot selected:', slot.id);
      onSelectSlot(slot);
    }
  };

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          {t('booking.selectTimeSlot')}
        </CardTitle>
        <CardDescription>{t('booking.selectTimeSlotDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Loading time slots...</p>
          </div>
        ) : displaySlots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No time slots available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displaySlots.map((slot: TimeSlotData, index: number) => {
              const isSelected = selectedSlot?.id === slot.id;
              const available = getAvailable(slot);
              const total = getTotal(slot);
              const isUnavailable = available === 0;

              return (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    disabled={isUnavailable}
                    className={cn(
                      "relative w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : isUnavailable
                        ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="font-semibold text-foreground mb-1">{getTimeString(slot)}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className={cn(
                        "text-sm",
                        isUnavailable ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {available}/{total} {t('booking.slots')}
                      </span>
                    </div>
                    {getRiskBadge('low')}
                    {isUnavailable && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="w-3 h-3" />
                        {t('booking.fullyBooked')}
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
