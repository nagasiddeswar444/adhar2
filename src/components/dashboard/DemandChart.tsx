import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';

interface ForecastData {
  date: string;
  predicted: number;
  actual?: number;
  capacity: number;
}

export function DemandChart() {
  const { t } = useLanguage();
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const data = await api.analytics.getDemandForecast();
        if (data && data.length > 0) {
          const formattedData = data.map((item: any) => ({
            date: item.forecast_date || item.date,
            predicted: item.predicted_demand || item.predicted || 0,
            actual: item.actual_demand || item.actual,
            capacity: item.capacity || 100
          }));
          setForecastData(formattedData);
        }
      } catch (error) {
        console.error('Failed to fetch demand forecast:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  // Use fetched data or empty array (no fallback to mock)
  const displayData = forecastData.length > 0 ? forecastData : [];

  return (
    <Card variant="default" className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('dashboard.demandForecastTitle')}</CardTitle>
        <CardDescription>{t('dashboard.demandForecastDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading forecast data...</p>
            </div>
          ) : displayData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No forecast data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 100%, 32%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217, 100%, 32%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(145, 65%, 42%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(145, 65%, 42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => value.split('-')[1]}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="capacity"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  fill="none"
                  name={t('dashboard.capacity')}
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(217, 100%, 32%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                  name={t('dashboard.predicted')}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(145, 65%, 42%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  name={t('dashboard.actual')}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
