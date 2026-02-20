import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type UpdateType } from '@/data/mockData';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Loader2,
  Globe,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnlineUpdateFlowProps {
  updateType: UpdateType;
  onSubmit: () => void;
  onCancel: () => void;
}

interface UploadedDoc {
  name: string;
  file: File | null;
  uploaded: boolean;
}

export function OnlineUpdateFlow({ updateType, onSubmit, onCancel }: OnlineUpdateFlowProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'upload' | 'review' | 'processing' | 'submitted'>('upload');
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>(
    (updateType.requiredDocuments || []).map(doc => ({ name: doc, file: null, uploaded: false }))
  );
  const [newValue, setNewValue] = useState('');

  const getInputLabel = () => {
    switch (updateType.id) {
      case 'UT01': return t('booking.newAddress');
      case 'UT02': return t('booking.newMobileNumber');
      case 'UT03': return t('booking.newEmailAddress');
      default: return t('booking.newValue');
    }
  };

  const getInputPlaceholder = () => {
    switch (updateType.id) {
      case 'UT01': return t('booking.enterCompleteNewAddress');
      case 'UT02': return t('booking.enter10DigitMobile');
      case 'UT03': return t('booking.enterNewEmailAddress');
      default: return t('booking.enterNewValue');
    }
  };

  const handleFileUpload = (index: number, file: File | null) => {
    setUploadedDocs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], file, uploaded: file !== null };
      return updated;
    });
  };

  const allDocsUploaded = uploadedDocs.every(doc => doc.uploaded);
  const canProceed = allDocsUploaded && newValue.trim().length > 0;

  const handleSubmit = () => {
    setStep('processing');
    // Simulate processing
    setTimeout(() => {
      setStep('submitted');
    }, 2500);
  };

  if (step === 'submitted') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-8 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-success" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('booking.updateRequestSubmitted')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('booking.updateRequestSubmittedDesc')}
            </p>
            
            <div className="bg-card rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{t('booking.whatHappensNext')}</span>
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground ml-6 list-decimal">
                <li>{t('booking.docsVerified24to48')}</li>
                <li>{t('booking.otpReceived')}</li>
                <li>{t('booking.aadhaarUpdated')}</li>
                <li>{t('booking.confirmationReceived')}</li>
              </ol>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 mb-6">
              <AlertCircle className="w-4 h-4" />
              <span>{t('booking.requestID')}: <strong className="text-foreground">ONL{Date.now().toString(36).toUpperCase()}</strong></span>
            </div>

            <Button onClick={onSubmit} variant="gold" size="lg">
              {t('booking.done')}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (step === 'processing') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary flex items-center justify-center mx-auto mb-6"
            >
              <Loader2 className="w-6 h-6 text-primary animate-pulse" />
            </motion.div>
            <h2 className="text-xl font-bold text-foreground mb-2">{t('booking.processingRequest')}</h2>
            <p className="text-muted-foreground">
              {t('booking.uploadingDocs')}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-success" />
                      {t('booking.online')} {updateType.name}
                    </CardTitle>
                    <CardDescription>
                      {t('booking.completeOnlineViaForm')}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* New Value Input */}
                <div className="space-y-2">
                  <Label htmlFor="newValue">{getInputLabel()}</Label>
                  {updateType.id === 'UT01' ? (
                    <textarea
                      id="newValue"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder={getInputPlaceholder()}
                      className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <Input
                      id="newValue"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder={getInputPlaceholder()}
                      type={updateType.id === 'UT02' ? 'tel' : updateType.id === 'UT03' ? 'email' : 'text'}
                    />
                  )}
                </div>

                {/* Document Upload Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <Label>{t('booking.requiredDocuments')}</Label>
                  </div>
                  
                  <div className="space-y-3">
                    {uploadedDocs.map((doc, index) => (
                      <motion.div
                        key={doc.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "p-4 rounded-lg border-2 border-dashed transition-colors",
                          doc.uploaded
                            ? "border-success/50 bg-success/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground mb-1">{doc.name}</p>
                            {doc.file ? (
                              <div className="flex items-center gap-2 text-xs text-success">
                                <CheckCircle className="w-3 h-3" />
                                <span>{doc.file.name}</span>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">{t('booking.fileFormats')}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(index, e.target.files?.[0] || null)}
                              />
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                doc.uploaded
                                  ? "bg-success/10 text-success hover:bg-success/20"
                                  : "bg-primary/10 text-primary hover:bg-primary/20"
                              )}>
                                {doc.uploaded ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    {t('booking.change')}
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4" />
                                    {t('booking.upload')}
                                  </>
                                )}
                              </span>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-1">{t('booking.secureDocumentVerification')}</p>
                      <p className="text-muted-foreground">
                        {t('booking.docsEncrypted')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={onCancel} className="flex-1">
                    {t('booking.cancel')}
                  </Button>
                  <Button
                    variant="gold"
                    onClick={() => setStep('review')}
                    disabled={!canProceed}
                    className="flex-1"
                  >
                    {t('booking.reviewAndSubmit')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  {t('booking.reviewYourSubmission')}
                </CardTitle>
                <CardDescription>
                  {t('booking.verifyDetailsBeforeSubmitting')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Update Details */}
                <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('booking.updateType')}</p>
                    <p className="font-medium text-foreground">{updateType.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{getInputLabel()}</p>
                    <p className="font-medium text-foreground">{newValue}</p>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">{t('booking.uploadedDocuments')}</p>
                  <div className="space-y-2">
                    {uploadedDocs.map((doc) => (
                      <div key={doc.name} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-muted-foreground">{doc.name}:</span>
                        <span className="text-foreground">{doc.file?.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-warning/10 rounded-lg p-4 border border-warning/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-1">{t('booking.important')}</p>
                      <p className="text-muted-foreground">
                        {t('booking.confirmDocumentsGenuine')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep('upload')} className="flex-1">
                    {t('booking.backToEdit')}
                  </Button>
                  <Button
                    variant="gold"
                    onClick={handleSubmit}
                    className="flex-1"
                  >
                    {t('booking.submitForVerification')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
