import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { timeSlots, type TimeSlot } from '@/data/mockData';
import { Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SlotPickerProps {
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export function SlotPicker({ selectedSlot, onSelectSlot }: SlotPickerProps) {
  const { t } = useLanguage();
  const getRiskBadge = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">{t('booking.lowWait')}</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">{t('booking.moderate')}</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">{t('booking.highDemand')}</span>;
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available > 0) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {timeSlots.map((slot, index) => {
            const isSelected = selectedSlot?.id === slot.id;
            const isUnavailable = slot.available === 0;

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
                  <div className="font-semibold text-foreground mb-1">{slot.time}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className={cn(
                      "text-sm",
                      isUnavailable ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {slot.available}/{slot.total} {t('booking.slots')}
                    </span>
                  </div>
                  {getRiskBadge(slot.riskLevel)}
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
      </CardContent>
    </Card>
  );
}
