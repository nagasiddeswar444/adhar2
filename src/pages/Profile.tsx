import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Bell, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Bot,
  Sparkles,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, appointments, needsBiometricUpdate, pendingAutoBooking, clearPendingAutoBooking, loading } = useUser();
  const { user: authUser } = useAuth();
  const { t } = useLanguage();

  // Merge auth user details with user profile from database
  const displayName = user?.name || authUser?.name || 'User';
  const displayEmail = user?.email || authUser?.email || '';
  const displayPhone = user?.phone || authUser?.phone || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user && !authUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const age = user?.dateOfBirth ? Math.floor((new Date().getTime() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
  const scheduledAppointments = appointments.filter(a => a.status === 'scheduled');
  const completedAppointments = appointments.filter(a => a.status === 'completed');

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
              {t('profile.title')}
            </motion.h1>
            <p className="text-muted-foreground">
              {t('profile.subtitle')}
            </p>
          </div>

          {/* Auto-Booked Appointment Alert */}
          <AnimatePresence>
            {pendingAutoBooking && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-6"
              >
                <Card className="border-warning bg-warning/10">
                  <CardContent className="flex items-start gap-4 py-4">
                    <div className="p-2 rounded-full bg-warning/20">
                      <Bot className="w-6 h-6 text-warning" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">AI Auto-Booked Appointment</h3>
                        <Badge variant="outline" className="border-warning text-warning">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Age-Based
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Based on your age ({age} years), a biometric update has been automatically scheduled.
                        This is a mandatory update as per UIDAI guidelines.
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          {pendingAutoBooking.center?.name}
                        </span>
                        <span className="flex items-center gap-1 text-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          {pendingAutoBooking.slot?.time}
                        </span>
                        <span className="flex items-center gap-1 text-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          {format(pendingAutoBooking.scheduledDate, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearPendingAutoBooking}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="h-full">
                <CardHeader className="text-center pb-4">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <User className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{displayName}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {user?.aadhaarNumber || 'XXXX-XXXX-XXXX'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{displayEmail}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{displayPhone}</span>
                  </div>
                  {user?.dateOfBirth && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{format(new Date(user.dateOfBirth), 'dd MMM yyyy')} ({age} years)</span>
                    </div>
                  )}
                  {user?.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{user.address}</span>
                    </div>
                  )}

                  {/* Biometric Status */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('profile.biometricStatus')}</span>
                      {needsBiometricUpdate ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Update Required
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 bg-success/10 text-success border-success/30">
                          <CheckCircle className="w-3 h-3" />
                          Up to Date
                        </Badge>
                      )}
                    </div>
                    {user?.lastBiometricUpdate && (
                      <p className="text-xs text-muted-foreground">
                        Last updated: {format(new Date(user.lastBiometricUpdate), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Appointments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Scheduled Appointments */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary" />
                      {t('profile.scheduledAppointments')}
                    </CardTitle>
                    <CardDescription>
                      {t('profile.upcomingAppointments')}
                    </CardDescription>
                  </div>
                  <Link to="/book-slot">
                    <Button variant="gold" size="sm">
                      Book New Slot
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {scheduledAppointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No scheduled appointments</p>
                      <Link to="/book-slot" className="text-primary hover:underline text-sm">
                        Book a slot now
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scheduledAppointments.map((appointment, index) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "p-4 rounded-lg border",
                            appointment.autoBooked 
                              ? "border-warning/30 bg-warning/5" 
                              : "border-border bg-secondary/30"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{appointment.updateType?.name || 'Appointment'}</h4>
                                {appointment.autoBooked && (
                                  <Badge variant="outline" className="border-warning text-warning text-xs">
                                    <Bot className="w-3 h-3 mr-1" />
                                    Auto-Booked
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    appointment.updateType?.riskLevel === 'low' && "border-success text-success",
                                    appointment.updateType?.riskLevel === 'medium' && "border-warning text-warning",
                                    appointment.updateType?.riskLevel === 'high' && "border-destructive text-destructive"
                                  )}
                                >
                                  {appointment.updateType?.riskLevel || 'medium'} risk
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {appointment.center?.name || 'Center'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {appointment.slot?.time || 'Time'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(appointment.scheduledDate, 'MMM dd, yyyy')}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-primary/10 text-primary border-0">
                                Booking ID: {appointment.id}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed Appointments */}
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    {t('profile.completedUpdates')}
                  </CardTitle>
                  <CardDescription>
                    {t('profile.pastHistory')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {completedAppointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No completed updates yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {completedAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 rounded-lg border border-success/30 bg-success/5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{appointment.updateType?.name || 'Appointment'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {appointment.center?.name || 'Center'} • {format(appointment.scheduledDate, 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-success" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
