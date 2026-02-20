import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Calendar, Clock, MapPin, FileText, CheckCircle, XCircle, Loader2,
  AlertTriangle, Users, Timer, ChevronRight, Eye, RefreshCw, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';

// Mock tracking data
const mockAppointments = [
  {
    id: 'ADH-7X9K2M',
    updateType: 'Address Update',
    center: 'Bangalore Tech Park',
    date: '2026-02-15',
    time: '10:00 AM - 11:00 AM',
    status: 'scheduled' as const,
    mode: 'in-person' as const,
  },
  {
    id: 'ADH-3P8N1Q',
    updateType: 'Photo Update',
    center: 'Delhi Central Hub',
    date: '2026-02-10',
    time: '09:00 AM - 10:00 AM',
    status: 'completed' as const,
    mode: 'in-person' as const,
  },
  {
    id: 'ADH-5R2T4W',
    updateType: 'Mobile Number Update',
    center: 'Online',
    date: '2026-02-08',
    time: 'N/A',
    status: 'in-review' as const,
    mode: 'online' as const,
  },
  {
    id: 'ADH-1L6M9P',
    updateType: 'Name Correction',
    center: 'Mumbai Gateway Center',
    date: '2026-01-25',
    time: '02:00 PM - 03:00 PM',
    status: 'cancelled' as const,
    mode: 'in-person' as const,
  },
];

const mockUpdateHistory = [
  {
    id: 'UPD-001',
    type: 'Address Update',
    oldValue: '456, MG Road, Bangalore',
    newValue: '123, MG Road, Bangalore, Karnataka 560001',
    date: '2025-11-20',
    status: 'approved' as const,
    urn: 'URN-2025-11-20-001',
  },
  {
    id: 'UPD-002',
    type: 'Photo Update (Biometric)',
    oldValue: 'Photo taken on 2020-06-10',
    newValue: 'Photo updated on 2025-08-15',
    date: '2025-08-15',
    status: 'approved' as const,
    urn: 'URN-2025-08-15-002',
  },
  {
    id: 'UPD-003',
    type: 'Mobile Number Update',
    oldValue: '+91 98765 XXXXX',
    newValue: '+91 98765 43210',
    date: '2025-05-10',
    status: 'approved' as const,
    urn: 'URN-2025-05-10-003',
  },
  {
    id: 'UPD-004',
    type: 'Email Update',
    oldValue: 'old.email@example.com',
    newValue: 'rahul.sharma@email.com',
    date: '2024-12-01',
    status: 'rejected' as const,
    urn: 'URN-2024-12-01-004',
    rejectReason: 'Email verification failed',
  },
];

const mockDocuments = [
  {
    id: 'DOC-001',
    name: 'Proof of Address - Utility Bill',
    uploadDate: '2026-02-08',
    linkedTo: 'ADH-5R2T4W',
    status: 'under-review' as const,
    reviewNote: 'Document clarity check in progress',
  },
  {
    id: 'DOC-002',
    name: 'Passport Copy',
    uploadDate: '2026-02-08',
    linkedTo: 'ADH-5R2T4W',
    status: 'approved' as const,
  },
  {
    id: 'DOC-003',
    name: 'Aadhaar Card Original',
    uploadDate: '2026-02-05',
    linkedTo: 'ADH-7X9K2M',
    status: 'approved' as const,
  },
  {
    id: 'DOC-004',
    name: 'Bank Statement',
    uploadDate: '2026-01-25',
    linkedTo: 'ADH-1L6M9P',
    status: 'rejected' as const,
    reviewNote: 'Document is older than 3 months',
  },
];

// Live queue mock
const mockQueueData = {
  appointmentId: 'ADH-7X9K2M',
  center: 'Bangalore Tech Park',
  yourToken: 'B-047',
  currentToken: 'B-032',
  peopleAhead: 15,
  estimatedWait: 38,
  counterNumber: 5,
  status: 'waiting' as const,
};

const Tracking = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [queueData, setQueueData] = useState(mockQueueData);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Simulate live queue updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueData(prev => {
        if (prev.peopleAhead <= 0) return prev;
        const newAhead = Math.max(0, prev.peopleAhead - 1);
        const currentNum = parseInt(prev.currentToken.split('-')[1]) + 1;
        return {
          ...prev,
          currentToken: `B-${String(currentNum).padStart(3, '0')}`,
          peopleAhead: newAhead,
          estimatedWait: Math.max(0, newAhead * 2.5),
        };
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    scheduled: { label: t('status.scheduled'), color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Calendar },
    completed: { label: t('status.completed'), color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
    cancelled: { label: t('status.cancelled'), color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
    'in-review': { label: t('status.inReview'), color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Loader2 },
    approved: { label: t('status.approved'), color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
    rejected: { label: t('status.rejected'), color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
    'under-review': { label: t('status.underReview'), color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Loader2 },
  };

  const filteredAppointments = mockAppointments.filter(a =>
    a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.updateType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-2"
            >
              {t('track.title')}
            </motion.h1>
            <p className="text-muted-foreground">
              {t('track.subtitle')}
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search') + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="appointments" className="max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-4 w-full mb-8">
              <TabsTrigger value="appointments" className="text-xs sm:text-sm">
                <Calendar className="w-4 h-4 mr-1 hidden sm:inline" />
                {t('track.appointments')}
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm">
                <FileText className="w-4 h-4 mr-1 hidden sm:inline" />
                {t('track.history')}
              </TabsTrigger>
              <TabsTrigger value="queue" className="text-xs sm:text-sm">
                <Users className="w-4 h-4 mr-1 hidden sm:inline" />
                {t('track.liveQueue')}
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm">
                <Eye className="w-4 h-4 mr-1 hidden sm:inline" />
                {t('track.documents')}
              </TabsTrigger>
            </TabsList>

            {/* Appointments Tab */}
            <TabsContent value="appointments">
              <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      {t('tracking.noAppointments')}
                    </CardContent>
                  </Card>
                ) : (
                  filteredAppointments.map((apt, i) => {
                    const config = statusConfig[apt.status];
                    const StatusIcon = config.icon;
                    return (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="hover:border-primary/30 transition-colors">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-foreground">{apt.updateType}</h3>
                                  <Badge variant="outline" className={cn("text-xs", config.color)}>
                                    <StatusIcon className={cn("w-3 h-3 mr-1", apt.status === 'in-review' && "animate-spin")} />
                                    {config.label}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5" /> {apt.id}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {apt.center}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" /> {apt.date}
                                  </span>
                                  {apt.time !== 'N/A' && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" /> {apt.time}
                                    </span>
                                  )}
                                </div>
                                <Badge variant="secondary" className="text-xs w-fit">
                                  {apt.mode === 'online' ? '🌐 Online' : '🏢 In-Person'}
                                </Badge>
                              </div>
                              {apt.status === 'scheduled' && (
                                <Button variant="outline" size="sm" className="shrink-0">
                                  {t('tracking.reschedule')}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            {/* Update History Tab */}
            <TabsContent value="history">
              <div className="space-y-4">
                {mockUpdateHistory.map((update, i) => {
                  const config = statusConfig[update.status];
                  const StatusIcon = config.icon;
                  return (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-foreground">{update.type}</h3>
                              <Badge variant="outline" className={cn("text-xs", config.color)}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {config.label}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/10">
                                <p className="text-xs text-muted-foreground mb-1">{t('tracking.previous')}</p>
                                <p className="text-foreground">{update.oldValue}</p>
                              </div>
                              <div className="bg-success/5 rounded-lg p-3 border border-success/10">
                                <p className="text-xs text-muted-foreground mb-1">{t('tracking.updated')}</p>
                                <p className="text-foreground">{update.newValue}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {update.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" /> URN: {update.urn}
                              </span>
                            </div>
                            {update.status === 'rejected' && update.rejectReason && (
                              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 p-2 rounded-md">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {t('tracking.reason')}: {update.rejectReason}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Live Queue Tab */}
            <TabsContent value="queue">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-primary/30">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{t('track.queueStatus')}</CardTitle>
                    <CardDescription>{queueData.center}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Token Display */}
                    <div className="grid grid-cols-2 gap-6 text-center">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{t('track.yourToken')}</p>
                        <div className="text-4xl font-bold text-primary">{queueData.yourToken}</div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{t('track.nowServing')}</p>
                        <motion.div
                          key={queueData.currentToken}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-4xl font-bold text-success"
                        >
                          {queueData.currentToken}
                        </motion.div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>{queueData.peopleAhead} {t('track.peopleAhead')}</span>
                        <span>{t('track.counter')} {queueData.counterNumber}</span>
                      </div>
                      <Progress
                        value={Math.max(5, 100 - (queueData.peopleAhead / 15) * 100)}
                        className="h-3"
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-secondary rounded-xl">
                        <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold text-foreground">{queueData.peopleAhead}</p>
                        <p className="text-xs text-muted-foreground">{t('track.ahead')}</p>
                      </div>
                      <div className="text-center p-4 bg-secondary rounded-xl">
                        <Timer className="w-5 h-5 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold text-foreground">{Math.round(queueData.estimatedWait)}</p>
                        <p className="text-xs text-muted-foreground">{t('track.minWait')}</p>
                      </div>
                      <div className="text-center p-4 bg-secondary rounded-xl">
                        <MapPin className="w-5 h-5 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold text-foreground">{queueData.counterNumber}</p>
                        <p className="text-xs text-muted-foreground">{t('track.counter')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('track.autoRefresh')}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <div className="space-y-4">
                {mockDocuments.map((doc, i) => {
                  const config = statusConfig[doc.status];
                  const StatusIcon = config.icon;
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-primary shrink-0" />
                                <h3 className="font-medium text-foreground">{doc.name}</h3>
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pl-8">
                                <span>{t('track.uploaded')}: {doc.uploadDate}</span>
                                <span>{t('track.linkedTo')}: {doc.linkedTo}</span>
                              </div>
                              {doc.reviewNote && (
                                <p className={cn(
                                  "text-sm pl-8 mt-1",
                                  doc.status === 'rejected' ? "text-destructive" : "text-muted-foreground"
                                )}>
                                  {doc.status === 'rejected' ? '⚠️' : 'ℹ️'} {doc.reviewNote}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className={cn("text-xs shrink-0 w-fit", config.color)}>
                              <StatusIcon className={cn("w-3 h-3 mr-1", doc.status === 'under-review' && "animate-spin")} />
                              {config.label}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tracking;
