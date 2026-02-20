import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DemandChart } from '@/components/dashboard/DemandChart';
import { CenterLoadCard } from '@/components/dashboard/CenterLoadCard';
import { RiskPieChart } from '@/components/dashboard/RiskPieChart';
import { HourlyLoadChart } from '@/components/dashboard/HourlyLoadChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { bookingStats } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Users, CheckCircle, ShieldAlert, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Dashboard = () => {
  const { t } = useLanguage();

  const statCards = [
    { icon: Users, label: t('dashboard.totalBookings'), value: bookingStats.totalBookings.toLocaleString(), color: 'text-primary' },
    { icon: CheckCircle, label: t('dashboard.completed'), value: bookingStats.completedUpdates.toLocaleString(), color: 'text-success' },
    { icon: ShieldAlert, label: t('dashboard.fraudsPrevented'), value: bookingStats.fraudPrevented.toLocaleString(), color: 'text-warning' },
    { icon: Clock, label: t('dashboard.avgWait'), value: `${bookingStats.avgWaitTime} ${t('dashboard.mins')}`, color: 'text-primary' },
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
              {t('dashboard.title')}
            </motion.h1>
            <p className="text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="stat" className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-secondary ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <DemandChart />
            <CenterLoadCard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <HourlyLoadChart />
            <RiskPieChart />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
