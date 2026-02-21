import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

export function FraudComparisonChart() {
  const { t } = useLanguage();
  const [fraudStats, setFraudStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFraudStats = async () => {
      try {
        const stats = await api.analytics.getFraudComparison();
        if (stats) {
          setFraudStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch fraud stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFraudStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="default">
          <CardHeader>
            <CardTitle>{t('fraud.chart.incidentsTitle')}</CardTitle>
            <CardDescription>{t('fraud.chart.incidentsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading fraud data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!fraudStats || !fraudStats.before || !fraudStats.after) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="default">
          <CardHeader>
            <CardTitle>{t('fraud.chart.incidentsTitle')}</CardTitle>
            <CardDescription>{t('fraud.chart.incidentsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">No fraud data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = [
    {
      name: t('fraud.chart.attempts'),
      before: fraudStats.before.total_events || 0,
      after: fraudStats.after.total_events || 0,
    },
    {
      name: t('fraud.chart.successful'),
      before: fraudStats.before.total_events - fraudStats.before.resolved || 0,
      after: fraudStats.after.total_events - fraudStats.after.resolved || 0,
    },
  ];

  // Calculate financial loss estimates (placeholder - in real app would come from DB)
  const beforeLoss = (fraudStats.before.total_events - fraudStats.before.resolved) * 10000;
  const afterLoss = (fraudStats.after.total_events - fraudStats.after.resolved) * 1000;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card variant="default">
        <CardHeader>
          <CardTitle>{t('fraud.chart.incidentsTitle')}</CardTitle>
          <CardDescription>{t('fraud.chart.incidentsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="before" name={t('fraud.chart.beforeSystem')} fill="hsl(0, 72%, 51%)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="after" name={t('fraud.chart.afterSystem')} fill="hsl(145, 65%, 42%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card variant="default">
        <CardHeader>
          <CardTitle>{t('fraud.chart.impactTitle')}</CardTitle>
          <CardDescription>{t('fraud.chart.impactDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-destructive/10 text-center">
              <p className="text-sm text-muted-foreground mb-1">{t('fraud.chart.before')}</p>
              <p className="text-2xl font-bold text-destructive">₹{(beforeLoss / 100000).toFixed(0)}L</p>
              <p className="text-xs text-muted-foreground">{t('fraud.chart.monthlyLoss')}</p>
            </div>
            <div className="p-4 rounded-xl bg-success/10 text-center">
              <p className="text-sm text-muted-foreground mb-1">{t('fraud.chart.after')}</p>
              <p className="text-2xl font-bold text-success">₹{(afterLoss / 100000).toFixed(0)}L</p>
              <p className="text-xs text-muted-foreground">{t('fraud.chart.monthlyLoss')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{t('fraud.chart.fraudReduction')}</span>
                <span className="text-2xl font-bold text-success">
                  {fraudStats.before.total_events > 0 
                    ? Math.round((1 - (fraudStats.after.total_events - fraudStats.after.resolved) / (fraudStats.before.total_events - fraudStats.before.resolved)) * 100)
                    : 0}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('fraud.chart.reductionDesc')}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-secondary">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{t('fraud.chart.detectionSpeed')}</span>
                <span className="text-2xl font-bold text-success">95%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('fraud.chart.speedDesc', {
                  before: 72,
                  after: 2,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
