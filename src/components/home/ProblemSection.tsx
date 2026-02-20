import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Clock, Users, AlertOctagon, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();

  const problems = [
    {
      icon: Clock,
      title: t('problem.waitTitle'),
      description: t('problem.waitDesc'),
      stat: '3.5 hrs',
      statLabel: t('problem.waitStat'),
    },
    {
      icon: Users,
      title: t('problem.crowdTitle'),
      description: t('problem.crowdDesc'),
      stat: '150%',
      statLabel: t('problem.crowdStat'),
    },
    {
      icon: AlertOctagon,
      title: t('problem.fraudTitle'),
      description: t('problem.fraudDesc'),
      stat: '850+',
      statLabel: t('problem.fraudStat'),
    },
    {
      icon: TrendingDown,
      title: t('problem.ineffTitle'),
      description: t('problem.ineffDesc'),
      stat: '40%',
      statLabel: t('problem.ineffStat'),
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
            {t('problem.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('problem.heading')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('problem.subheading')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="feature" className="h-full p-6 group">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <problem.icon className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{problem.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{problem.description}</p>
                <div className="pt-4 border-t border-border">
                  <span className="text-2xl font-bold text-destructive">{problem.stat}</span>
                  <span className="text-sm text-muted-foreground ml-2">{problem.statLabel}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
