import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { monthlyForecast } from '@/data/mockData';
import { useLanguage } from '@/contexts/LanguageContext';

export function DemandChart() {
  const { t } = useLanguage();
  return (
    <Card variant="default" className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('dashboard.demandForecastTitle')}</CardTitle>
        <CardDescription>{t('dashboard.demandForecastDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyForecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
        </div>
      </CardContent>
    </Card>
  );
}
