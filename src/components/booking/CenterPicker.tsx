import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { centers, type Center } from '@/data/mockData';
import { MapPin, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface CenterPickerProps {
  selectedCenter: Center | null;
  onSelectCenter: (center: Center) => void;
}

export function CenterPicker({ selectedCenter, onSelectCenter }: CenterPickerProps) {
  const { t } = useLanguage();
  const getLoadStatus = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return { label: t('booking.veryBusy'), color: 'text-destructive' };
    if (percentage >= 70) return { label: t('booking.moderate'), color: 'text-warning' };
    return { label: t('booking.available'), color: 'text-success' };
  };

  const handleCenterSelect = (center: Center) => {
    console.log('Center selected:', center.id);
    onSelectCenter(center);
  };

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {t('booking.selectCenter')}
        </CardTitle>
        <CardDescription>{t('booking.selectCenterDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {centers.map((center, index) => {
            const isSelected = selectedCenter?.id === center.id;
            const loadPercent = (center.currentLoad / center.capacity) * 100;
            const status = getLoadStatus(center.currentLoad, center.capacity);

            return (
              <motion.div
                key={center.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => handleCenterSelect(center)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{center.name}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{center.city}, {center.state}</p>
                    </div>
                    <span className={cn("text-sm font-medium", status.color)}>
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {t('booking.currentLoad')}
                      </span>
                      <span className="font-medium">{center.currentLoad}/{center.capacity}</span>
                    </div>
                    <Progress value={loadPercent} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {t('booking.predicted')}: {center.predictedLoad}
                      </span>
                      <span>{Math.round(loadPercent)}% {t('booking.capacity')}</span>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
