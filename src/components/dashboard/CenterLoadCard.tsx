import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { centers } from '@/data/mockData';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function CenterLoadCard() {
  const { t } = useLanguage();
  const getLoadColor = (load: number, capacity: number) => {
    const percentage = (load / capacity) * 100;
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 70) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = (load: number, capacity: number) => {
    const percentage = (load / capacity) * 100;
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {t('dashboard.centerLoadTitle')}
        </CardTitle>
        <CardDescription>{t('dashboard.centerLoadDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {centers.slice(0, 5).map((center) => {
          const currentPercent = (center.currentLoad / center.capacity) * 100;
          const predictedPercent = (center.predictedLoad / center.capacity) * 100;
          const trend = center.predictedLoad > center.currentLoad;

          return (
            <div key={center.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{center.name}</p>
                  <p className="text-xs text-muted-foreground">{center.city}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getLoadColor(center.currentLoad, center.capacity)}`}>
                    {center.currentLoad}/{center.capacity}
                  </span>
                  {trend ? (
                    <TrendingUp className="w-4 h-4 text-destructive" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-success" />
                  )}
                </div>
              </div>
              <div className="relative">
                <Progress value={currentPercent} className="h-2" />
                <div
                  className="absolute top-0 h-2 w-1 bg-foreground rounded"
                  style={{ left: `${predictedPercent}%` }}
                  title={`${t('dashboard.predicted')}: ${center.predictedLoad}`}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
