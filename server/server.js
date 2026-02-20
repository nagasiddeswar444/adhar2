const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pool, testConnection } = require('./config/db');
const { initializeDatabase } = require('./config/initDb');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const centersRoutes = require('./routes/centers');
const appointmentsRoutes = require('./routes/appointments');
const timeSlotsRoutes = require('./routes/timeSlots');
const updateTypesRoutes = require('./routes/updateTypes');
const aadhaarRecordsRoutes = require('./routes/aadhaarRecords');
const documentsRoutes = require('./routes/documents');
const analyticsRoutes = require('./routes/analytics');
const fraudLogsRoutes = require('./routes/fraudLogs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/centers', centersRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/time-slots', timeSlotsRoutes);
app.use('/api/update-types', updateTypesRoutes);
app.use('/api/aadhaar-records', aadhaarRecordsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/fraud-logs', fraudLogsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.log('Note: Database not connected. Please check your database configuration.');
    } else {
      // Initialize database tables
      await initializeDatabase();
      console.log('Database tables initialized');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
