import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CenterLoad {
  id: string;
  name?: string;
  center_name?: string;
  city: string;
  current_load: number;
  predicted_load: number;
  capacity: number;
  occupancy_percentage: number;
}

export function CenterLoadCard() {
  const { t } = useLanguage();
  const [centerLoads, setCenterLoads] = useState<CenterLoad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenterLoads = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const loads = await api.analytics.getAllCenterLoads(today);
        
        if (loads && loads.length > 0) {
          setCenterLoads(loads.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch center loads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCenterLoads();
  }, []);

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
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading center data...</p>
          </div>
        ) : centerLoads.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No center data available</p>
          </div>
        ) : (
          centerLoads.map((center) => {
            const currentPercent = center.capacity > 0 ? (center.current_load / center.capacity) * 100 : 0;
            const predictedPercent = center.capacity > 0 ? (center.predicted_load / center.capacity) * 100 : 0;
            const trend = center.predicted_load > center.current_load;

            return (
              <div key={center.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{center.center_name || center.name}</p>
                    <p className="text-xs text-muted-foreground">{center.city}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getLoadColor(center.current_load, center.capacity)}`}>
                      {center.current_load}/{center.capacity}
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
                    title={`${t('dashboard.predicted')}: ${center.predicted_load}`}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
