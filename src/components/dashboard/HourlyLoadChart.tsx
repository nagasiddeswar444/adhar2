import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';

interface HourlyData {
  hour: string;
  load: number;
}

export function HourlyLoadChart() {
  const { t } = useLanguage();
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHourlyLoad = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const loads = await api.analytics.getAllCenterLoads(today);
        
        if (loads && loads.length > 0) {
          // Aggregate hourly data from center loads
          // For now, we'll generate hourly pattern based on total load
          const totalLoad = loads.reduce((sum: number, item: any) => sum + (item.current_load || 0), 0);
          const capacity = loads.reduce((sum: number, item: any) => sum + (item.capacity || 100), 0);
          
          // Generate hourly distribution (typical pattern: low in morning, peaks at midday)
          const hourlyPattern = [
            { hour: '09:00', factor: 0.3 },
            { hour: '10:00', factor: 0.5 },
            { hour: '11:00', factor: 0.7 },
            { hour: '12:00', factor: 0.9 },
            { hour: '13:00', factor: 0.85 },
            { hour: '14:00', factor: 1.0 },
            { hour: '15:00', factor: 0.8 },
            { hour: '16:00', factor: 0.6 },
            { hour: '17:00', factor: 0.4 },
            { hour: '18:00', factor: 0.2 }
          ];
          
          const avgLoadPerCenter = capacity > 0 ? totalLoad / loads.length : 50;
          
          const formattedData = hourlyPattern.map(item => ({
            hour: item.hour,
            load: Math.round(avgLoadPerCenter * item.factor)
          }));
          
          setHourlyData(formattedData);
        }
      } catch (error) {
        console.error('Failed to fetch hourly load:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHourlyLoad();
  }, []);

  return (
    <Card variant="default" className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('dashboard.hourlyLoadTitle')}</CardTitle>
        <CardDescription>{t('dashboard.hourlyLoadDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading hourly data...</p>
            </div>
          ) : hourlyData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No hourly data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <ReferenceLine y={80} stroke="hsl(var(--warning))" strokeDasharray="5 5" label={t('dashboard.warning')} />
                <Bar
                  dataKey="load"
                  fill="hsl(217, 100%, 32%)"
                  radius={[4, 4, 0, 0]}
                  name={t('dashboard.load')}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
