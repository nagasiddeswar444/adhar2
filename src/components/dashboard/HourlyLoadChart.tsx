import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { hourlyLoad } from '@/data/mockData';
import { useLanguage } from '@/contexts/LanguageContext';

export function HourlyLoadChart() {
  const { t } = useLanguage();
  return (
    <Card variant="default" className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('dashboard.hourlyLoadTitle')}</CardTitle>
        <CardDescription>{t('dashboard.hourlyLoadDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyLoad} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
        </div>
      </CardContent>
    </Card>
  );
}
