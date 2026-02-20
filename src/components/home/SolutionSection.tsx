import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Brain, Calendar, QrCode, Shield, Bell, MapPin, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const priorityColors = {
  P0: 'bg-success/10 text-success',
  P1: 'bg-warning/10 text-warning',
};

export function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();

  const features = [
    {
      icon: Brain,
      title: t('solution.aiTitle'),
      description: t('solution.aiDesc'),
      benefits: [t('solution.aiBen1'), t('solution.aiBen2'), t('solution.aiBen3')],
      priority: 'P0',
    },
    {
      icon: Calendar,
      title: t('solution.slotTitle'),
      description: t('solution.slotDesc'),
      benefits: [t('solution.slotBen1'), t('solution.slotBen2'), t('solution.slotBen3')],
      priority: 'P0',
    },
    {
      icon: QrCode,
      title: t('solution.qrTitle'),
      description: t('solution.qrDesc'),
      benefits: [t('solution.qrBen1'), t('solution.qrBen2'), t('solution.qrBen3')],
      priority: 'P0',
    },
    {
      icon: Shield,
      title: t('solution.secTitle'),
      description: t('solution.secDesc'),
      benefits: [t('solution.secBen1'), t('solution.secBen2'), t('solution.secBen3')],
      priority: 'P0',
    },
    {
      icon: Bell,
      title: t('solution.notifTitle'),
      description: t('solution.notifDesc'),
      benefits: [t('solution.notifBen1'), t('solution.notifBen2'), t('solution.notifBen3')],
      priority: 'P1',
    },
    {
      icon: MapPin,
      title: t('solution.loadTitle'),
      description: t('solution.loadDesc'),
      benefits: [t('solution.loadBen1'), t('solution.loadBen2'), t('solution.loadBen3')],
      priority: 'P1',
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
            {t('solution.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('solution.heading')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('solution.subheading')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="feature" className="h-full p-6 group">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[feature.priority as keyof typeof priorityColors]}`}>
                    {feature.priority}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
