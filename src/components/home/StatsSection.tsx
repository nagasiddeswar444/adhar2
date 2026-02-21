import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Users, CheckCircle, ShieldAlert, Clock, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await api.analytics.getDashboard();
        if (dashboardStats && dashboardStats.todayStats) {
          setStats({
            totalBookings: dashboardStats.todayStats.total_appointments || 0,
            completedUpdates: dashboardStats.todayStats.completed || 0,
            fraudPrevented: dashboardStats.fraudStats?.unresolved || 0,
            avgWaitTime: 15,
            satisfactionRate: 95
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Set default values on error
        setStats({
          totalBookings: 0,
          completedUpdates: 0,
          fraudPrevented: 0,
          avgWaitTime: 15,
          satisfactionRate: 95
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    { icon: Users, value: stats?.totalBookings?.toLocaleString() || '0', label: t('stats.totalBookings'), suffix: '' },
    { icon: CheckCircle, value: stats?.completedUpdates?.toLocaleString() || '0', label: t('stats.completedUpdates'), suffix: '' },
    { icon: ShieldAlert, value: stats?.fraudPrevented?.toLocaleString() || '0', label: t('stats.fraudsPrevented'), suffix: '' },
    { icon: Clock, value: stats?.avgWaitTime?.toString() || '15', label: t('stats.avgWaitTime'), suffix: ' mins' },
    { icon: Star, value: stats?.satisfactionRate?.toString() || '95', label: t('stats.satisfaction'), suffix: '%' },
  ];

  return (
    <section ref={ref} className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
            {t('stats.heading')}
          </h2>
          <p className="text-primary-foreground/70">{t('stats.subheading')}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20"
            >
              <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                {loading ? '...' : stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-primary-foreground/70">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
