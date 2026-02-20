import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { updateTypes, type UpdateType } from '@/data/mockData';
import { FileEdit, Shield, Clock, CheckCircle, Bot, Globe, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface UpdateTypePickerProps {
  selectedType: UpdateType | null;
  onSelectType: (type: UpdateType) => void;
}

export function UpdateTypePicker({ selectedType, onSelectType }: UpdateTypePickerProps) {
  const { t } = useLanguage();
  const getRiskIcon = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return <span className="w-2 h-2 rounded-full bg-success" />;
      case 'medium':
        return <span className="w-2 h-2 rounded-full bg-warning" />;
      case 'high':
        return <span className="w-2 h-2 rounded-full bg-destructive" />;
    }
  };

  const getRiskLabel = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return t('booking.standard');
      case 'medium':
        return t('booking.verified');
      case 'high':
        return t('booking.highSecurity');
    }
  };

  const handleTypeSelect = (type: UpdateType) => {
    console.log('Update type selected:', type.id, 'isBiometric:', type.isBiometric);
    onSelectType(type);
  };

  // Separate types: online-capable, in-person only, and biometric
  const onlineTypes = updateTypes.filter(t => t.canDoOnline && !t.isBiometric);
  const inPersonTypes = updateTypes.filter(t => !t.canDoOnline && !t.isBiometric);
  const biometricTypes = updateTypes.filter(t => t.isBiometric);

  const renderTypeButton = (type: UpdateType, index: number) => {
    const isSelected = selectedType?.id === type.id;

    return (
      <motion.div
        key={type.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <button
          type="button"
          onClick={() => handleTypeSelect(type)}
          className={cn(
            "w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 cursor-pointer",
            isSelected
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border hover:border-primary/50 hover:bg-secondary/50"
          )}
        >
          <div className={cn(
            "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
            isSelected ? "border-primary bg-primary" : "border-muted-foreground"
          )}>
            {isSelected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-foreground">{type.name}</span>
              {type.canDoOnline && (
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                  <Globe className="w-3 h-3 mr-1" />
                  Online Available
                </Badge>
              )}
              {type.isBiometric && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Bot className="w-3 h-3" />
                  AI Slot
                </span>
              )}
              {type.requiresVerification && (
                <Shield className="w-4 h-4 text-warning" aria-label="Requires verification" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                {getRiskIcon(type.riskLevel)}
                <span className="text-muted-foreground">{getRiskLabel(type.riskLevel)}</span>
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3 h-3" />
                {type.estimatedTime}
              </span>
            </div>
          </div>
        </button>
      </motion.div>
    );
  };

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileEdit className="w-5 h-5 text-primary" />
          {t('booking.selectUpdateType')}
        </CardTitle>
        <CardDescription>{t('booking.updateTypeDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Online-capable Updates */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-success" />
              <h3 className="text-sm font-medium text-foreground">{t('booking.onlineUpdatesAvailable')}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {t('booking.onlineUpdatesDesc')}
            </p>
            <div className="space-y-3">
              {onlineTypes.map((type, index) => renderTypeButton(type, index))}
            </div>
          </div>

          {/* In-Person Only Updates */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('booking.inPersonUpdates')}
            </h3>
            <div className="space-y-3">
              {inPersonTypes.map((type, index) => renderTypeButton(type, index + onlineTypes.length))}
            </div>
          </div>

          {/* Biometric Updates - AI Auto-Assignment */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              {t('booking.biometricUpdates')}
            </h3>
            <div className="space-y-3">
              {biometricTypes.map((type, index) => renderTypeButton(type, index + onlineTypes.length + inPersonTypes.length))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
