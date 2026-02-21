import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FraudComparisonChart } from '@/components/fraud/FraudComparisonChart';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { analyticsOperations, fraudLogOperations } from '@/lib/database';
import { Shield, AlertTriangle, Lock, Eye, UserCheck, FileCheck, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FraudMetrics {
  reduction: number;
  detectionRate: number;
  avgTime: number;
}

const FraudAnalytics = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<FraudMetrics>({
    reduction: 85,
    detectionRate: 97,
    avgTime: 2
  });

  useEffect(() => {
    const fetchFraudMetrics = async () => {
      try {
        setLoading(true);
        const fraudData = await analyticsOperations.getFraudStats();
        if (fraudData && fraudData.before && fraudData.after) {
          const before = fraudData.before;
          const after = fraudData.after;
          const beforeTotal = before.total_events || 1;
          const afterTotal = after.total_events || 1;
          const reduction = Math.round(((beforeTotal - afterTotal) / beforeTotal) * 100);
          const afterResolved = after.resolved || 0;
          const detectionRate = beforeTotal > 0 ? Math.round((afterResolved / afterTotal) * 100) : 0;
          setMetrics({ reduction: Math.abs(reduction), detectionRate, avgTime: 2 });
        }
      } catch (error) {
        console.error('Error fetching fraud metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFraudMetrics();
  }, []);

  const securityFeatures = [
    {
      icon: Shield,
      title: t('fraud.zeroTrustTitle'),
      description: t('fraud.zeroTrustDesc'),
    },
    {
      icon: AlertTriangle,
      title: t('fraud.riskClassificationTitle'),
      description: t('fraud.riskClassificationDesc'),
    },
    {
      icon: Lock,
      title: t('fraud.mfaTitle'),
      description: t('fraud.mfaDesc'),
    },
    {
      icon: Eye,
      title: t('fraud.monitoringTitle'),
      description: t('fraud.monitoringDesc'),
    },
    {
      icon: UserCheck,
      title: t('fraud.consentTitle'),
      description: t('fraud.consentDesc'),
    },
    {
      icon: FileCheck,
      title: t('fraud.auditTitle'),
      description: t('fraud.auditDesc'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-2"
            >
              {t('fraud.title')}
            </motion.h1>
            <p className="text-muted-foreground">
              {t('fraud.subtitle')}
            </p>
          </div>

          {/* Key Metrics Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <Card variant="stat" className="p-6 bg-success/10 border-success/30">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/20">
                  <Shield className="w-8 h-8 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-success">{metrics.reduction}%</p>
                  <p className="text-sm text-muted-foreground">{t('fraud.reduction')}</p>
                </div>
              </div>
            </Card>
            <Card variant="stat" className="p-6 bg-primary/10 border-primary/30">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <AlertTriangle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{metrics.detectionRate}%</p>
                  <p className="text-sm text-muted-foreground">{t('fraud.detectionRate')}</p>
                </div>
              </div>
            </Card>
            <Card variant="stat" className="p-6 bg-warning/10 border-warning/30">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/20">
                  <Lock className="w-8 h-8 text-warning" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-warning">{metrics.avgTime}hrs</p>
                  <p className="text-sm text-muted-foreground">{t('fraud.avgTime')}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <FraudComparisonChart />
          </motion.div>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('fraud.architecture')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {securityFeatures.map((feature, index) => (
                <Card key={feature.title} variant="feature" className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Compliance Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card variant="outlined" className="p-6 bg-secondary/30">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t('fraud.compliance')}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('fraud.complianceDesc')}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ {t('fraud.complianceItem1')}</li>
                    <li>✓ {t('fraud.complianceItem2')}</li>
                    <li>✓ {t('fraud.complianceItem3')}</li>
                    <li>✓ {t('fraud.complianceItem4')}</li>
                    <li>✓ {t('fraud.complianceItem5')}</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FraudAnalytics;
