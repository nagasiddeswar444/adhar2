import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { fraudStats } from '@/data/mockData';
import { useLanguage } from '@/contexts/LanguageContext';

export function FraudComparisonChart() {
  const { t } = useLanguage();

  const data = [
    {
      name: t('fraud.chart.attempts'),
      before: fraudStats.beforeSystem.monthlyFraudAttempts,
      after: fraudStats.afterSystem.monthlyFraudAttempts,
    },
    {
      name: t('fraud.chart.successful'),
      before: fraudStats.beforeSystem.successfulFrauds,
      after: fraudStats.afterSystem.successfulFrauds,
    },
  ];

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
              <p className="text-2xl font-bold text-destructive">₹{(fraudStats.beforeSystem.financialLoss / 100000).toFixed(0)}L</p>
              <p className="text-xs text-muted-foreground">{t('fraud.chart.monthlyLoss')}</p>
            </div>
            <div className="p-4 rounded-xl bg-success/10 text-center">
              <p className="text-sm text-muted-foreground mb-1">{t('fraud.chart.after')}</p>
              <p className="text-2xl font-bold text-success">₹{(fraudStats.afterSystem.financialLoss / 100000).toFixed(0)}L</p>
              <p className="text-xs text-muted-foreground">{t('fraud.chart.monthlyLoss')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{t('fraud.chart.fraudReduction')}</span>
                <span className="text-2xl font-bold text-success">
                  {Math.round((1 - fraudStats.afterSystem.successfulFrauds / fraudStats.beforeSystem.successfulFrauds) * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('fraud.chart.reductionDesc', {
                  before: fraudStats.beforeSystem.successfulFrauds,
                  after: fraudStats.afterSystem.successfulFrauds,
                })}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-secondary">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{t('fraud.chart.detectionSpeed')}</span>
                <span className="text-2xl font-bold text-success">
                  {Math.round((1 - fraudStats.afterSystem.avgDetectionTime / fraudStats.beforeSystem.avgDetectionTime) * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('fraud.chart.speedDesc', {
                  before: fraudStats.beforeSystem.avgDetectionTime,
                  after: fraudStats.afterSystem.avgDetectionTime,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
