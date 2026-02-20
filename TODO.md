# TODO - Connect Aadhaar Advance with Database and Backend

## Phase 1: Setup Supabase Client
- [ ] Add @supabase/supabase-js dependency to package.json
- [ ] Create src/supabase.ts with Supabase client configuration

## Phase 2: Create Database API Layer
- [ ] Create src/lib/database.ts with all database operations:
  - [ ] User operations (getUser, createUser, updateUser)
  - [ ] Center operations (getCenters, getCenterById, searchCenters)
  - [ ] Update Type operations (getUpdateTypes)
  - [ ] Time Slot operations (getAvailableSlots, getSlotsByCenter)
  - [ ] Appointment operations (createAppointment, getAppointments, getAppointmentById, updateAppointmentStatus)
  - [ ] Document operations (uploadDocument, getDocuments, updateDocumentStatus)
  - [ ] Update History operations (createUpdateRecord, getUpdateHistory)
  - [ ] Fraud Log operations (logFraudEvent, getFraudLogs)
  - [ ] Analytics operations (getDashboardStats, getFraudStats, getDemandForecast)

## Phase 3: Update BookSlot Page
- [ ] Fetch centers from database instead of mockData
- [ ] Fetch update types from database instead of mockData
- [ ] Fetch time slots from database instead of mockData
- [ ] Save appointment to database on booking confirmation

## Phase 4: Update Dashboard Page
- [ ] Fetch booking stats from analytics_summary table
- [ ] Fetch demand forecast from demand_forecast table
- [ ] Fetch center load from center_load table

## Phase 5: Update Tracking Page
- [ ] Fetch appointments from database
- [ ] Fetch update history from database
- [ ] Fetch documents from database
- [ ] Real-time queue updates from database

## Phase 6: Update FraudAnalytics Page
- [ ] Fetch fraud statistics from fraud_logs table
- [ ] Fetch risk distribution from analytics_summary

## Phase 7: Test and Verify
- [ ] Test booking flow end-to-end
- [ ] Test dashboard data loading
- [ ] Test tracking page data
- [ ] Test fraud analytics data
