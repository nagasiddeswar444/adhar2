import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';

interface RiskData {
  name: string;
  value: number;
  color: string;
}

export function RiskPieChart() {
  const { t } = useLanguage();
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const fraudStats = await api.analytics.getFraudComparison();
        
        if (fraudStats && fraudStats.after) {
          // Calculate risk distribution from fraud stats
          const total = fraudStats.after.total_events || 0;
          const highRisk = fraudStats.after.high_risk || 0;
          const resolved = fraudStats.after.resolved || 0;
          
          if (total > 0) {
            const distribution: RiskData[] = [
              { name: 'High Risk', value: Math.round((highRisk / total) * 100), color: 'hsl(0, 84%, 60%)' },
              { name: 'Medium Risk', value: Math.round(((total - highRisk - resolved) / total) * 100), color: 'hsl(45, 84%, 56%)' },
              { name: 'Low Risk', value: Math.round((resolved / total) * 100), color: 'hsl(145, 65%, 42%)' }
            ];
            setRiskData(distribution);
          }
        }
      } catch (error) {
        console.error('Failed to fetch risk data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
  }, []);

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>{t('dashboard.riskDistributionTitle')}</CardTitle>
        <CardDescription>{t('dashboard.riskDistributionDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading risk data...</p>
            </div>
          ) : riskData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No risk data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${value}%`}
                  labelLine={false}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
