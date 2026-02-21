import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, QrCode, Calendar, MapPin, FileEdit, Download, Share2, Mail, Loader2, MessageSquare, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface Center {
  id: string;
  name: string;
  city: string;
  state: string;
  address?: string;
}

interface TimeSlot {
  id: string;
  date?: string;
  time: string;
}

interface UpdateType {
  id: string;
  name: string;
  estimatedTime?: string;
  requiredDocuments?: string[];
}

interface BookingConfirmationProps {
  center: Center;
  slot: TimeSlot;
  updateType: UpdateType;
  bookingId: string;
  userEmail?: string;
  userPhone?: string;
  onReset: () => void;
}

export function BookingConfirmation({
  center,
  slot,
  updateType,
  bookingId,
  userEmail = 'user@aadhaar.linked.email',
  userPhone = '+91 98765 43210',
  onReset
}: BookingConfirmationProps) {
  const { t } = useLanguage();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(true);
  const [reminderSent, setReminderSent] = useState(false);

  // Auto-send SMS confirmation on mount if enabled
  useEffect(() => {
    if (smsNotificationsEnabled && !smsSent) {
      sendSMSConfirmation();
    }
  }, []);

  // Send SMS confirmation
  const sendSMSConfirmation = async () => {
    setIsSendingSMS(true);
    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSendingSMS(false);
    setSmsSent(true);
    toast.success(t('booking.smsSent'), {
      description: `${t('booking.confirmationSentTo')} ${userPhone}`,
    });

    // Simulate reminder scheduling
    setTimeout(() => {
      setReminderSent(true);
      toast.info(t('booking.reminderScheduled'), {
        description: t('booking.reminderScheduledDesc'),
      });
    }, 1500);
  };

  // Send confirmation email
  const sendConfirmationEmail = async () => {
    setIsSendingEmail(true);
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSendingEmail(false);
    setEmailSent(true);
    toast.success(t('booking.confirmationEmailSent'), {
      description: `${t('booking.bookingDetailsSentTo')} ${userEmail}`,
    });
  };

  // Download booking pass
  const downloadPass = () => {
    // Create a simple text file with booking details
    const passContent = `
AADHAAR UPDATE BOOKING PASS
===========================
Booking Reference: ${bookingId}

Appointment Details:
- Time: ${slot.time}
- Center: ${center.name}
- Location: ${center.city}, ${center.state}
- Update Type: ${updateType.name}
- Estimated Duration: ${updateType.estimatedTime}

Important Instructions:
- Arrive 10 minutes before your slot time
- Carry original documents for verification
- Your QR code is valid only during the assigned time window
- No rescheduling within 24 hours of appointment

This is an auto-generated pass. Please keep it safe.
    `.trim();

    const blob = new Blob([passContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aadhaar-booking-${bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Booking pass downloaded!');
  };

  // Share booking details
  const shareDetails = async () => {
    const shareData = {
      title: 'Aadhaar Update Booking',
      text: `My Aadhaar update appointment:\n\nBooking ID: ${bookingId}\nTime: ${slot.time}\nCenter: ${center.name}, ${center.city}\nUpdate: ${updateType.name}`,
      url: window.location.href,
    };

    setIsSharing(true);

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback: copy to clipboard
        const textToCopy = `Aadhaar Update Booking\n\nBooking ID: ${bookingId}\nTime: ${slot.time}\nCenter: ${center.name}, ${center.city}\nUpdate: ${updateType.name}`;
        await navigator.clipboard.writeText(textToCopy);
        toast.success('Copied to clipboard!', {
          description: 'Booking details copied. You can paste and share them.',
        });
      }
    } catch (error) {
      // User cancelled or error
      console.log('Share cancelled or failed');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card variant="elevated" className="overflow-hidden">
        {/* Success Header */}
        <div className="bg-success text-success-foreground p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-success-foreground/20 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-12 h-12" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">{t('booking.confirmed')}</h2>
          <p className="opacity-90">{t('booking.slotBooked')}</p>
        </div>

        <CardContent className="p-8">
          {/* Booking ID */}
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-1">{t('booking.reference')}</p>
            <p className="text-2xl font-mono font-bold text-primary">{bookingId}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-card border-2 border-dashed border-border rounded-2xl">
              <div className="w-40 h-40 bg-foreground rounded-xl flex items-center justify-center mb-4">
                <QrCode className="w-32 h-32 text-background" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {t('booking.showQRAtEntry')}
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{t('booking.appointmentTime')}</p>
                <p className="text-muted-foreground">{slot.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{center.name}</p>
                <p className="text-muted-foreground">{center.city}, {center.state}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50">
              <FileEdit className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{updateType.name}</p>
                <p className="text-muted-foreground">Estimated time: {updateType.estimatedTime}</p>
              </div>
            </div>
          </div>

          {/* SMS Notification Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-success/10 border border-success/30 mb-4"
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium text-sm">SMS Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {smsSent ? `${t('booking.sentTo')} ${userPhone}` : t('booking.receiveSMSUpdates')}
                  </p>
                </div>
              </div>
              <Switch
                checked={smsNotificationsEnabled}
                onCheckedChange={setSmsNotificationsEnabled}
              />
            </div>
            {smsSent && (
              <div className="flex items-center gap-2 text-xs text-success">
                <CheckCircle className="w-3 h-3" />
                <span>Confirmation sent</span>
                {reminderSent && (
                  <>
                    <span className="mx-1">•</span>
                    <Bell className="w-3 h-3" />
                    <span>Reminder scheduled for 1hr before</span>
                  </>
                )}
              </div>
            )}
            {!smsSent && smsNotificationsEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={sendSMSConfirmation}
                disabled={isSendingSMS}
                className="w-full mt-2"
              >
                {isSendingSMS ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('booking.sending')}
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t('booking.sendSMSNow')}
                  </>
                )}
              </Button>
            )}
          </motion.div>

          {/* Email Notification Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{t('booking.emailConfirmation')}</p>
                <p className="text-xs text-muted-foreground">
                  {emailSent ? `${t('booking.sentTo')} ${userEmail}` : `${t('booking.sendDetailsTo')} ${userEmail}`}
                </p>
              </div>
            </div>
            <Button
              variant={emailSent ? "outline" : "default"}
              size="sm"
              onClick={sendConfirmationEmail}
              disabled={isSendingEmail || emailSent}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('booking.sending')}
                </>
              ) : emailSent ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('booking.sent')}
                </>
              ) : (
                t('booking.sendEmail')
              )}
            </Button>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="default" className="flex-1" size="lg" onClick={downloadPass}>
              <Download className="w-4 h-4 mr-2" />
              {t('booking.downloadPass')}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={shareDetails}
              disabled={isSharing}
            >
              {isSharing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              {t('booking.shareDetails')}
            </Button>
          </div>

          {/* Required Documents */}
          {updateType.requiredDocuments && updateType.requiredDocuments.length > 0 && (
            <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/30">
              <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <FileEdit className="w-4 h-4" />
                {t('booking.requiredDocuments')}
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                {t('booking.bringDocumentsToCenter')}
              </p>
              <ul className="text-sm text-foreground space-y-2">
                {updateType.requiredDocuments.map((doc, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Important Notes */}
          <div className="mt-4 p-4 rounded-xl bg-warning/10 border border-warning/30">
            <h4 className="font-semibold text-warning mb-2">{t('booking.importantInstructions')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('booking.arrive10MinsBefore')}</li>
              <li>• {t('booking.carryOriginalDocs')}</li>
              <li>• {t('booking.qrValidDuringTimeWindow')}</li>
              <li>• {t('booking.noReschedule24Hours')}</li>
            </ul>
          </div>

          {/* Book Another */}
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={onReset}>
              {t('booking.bookAnother')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}