const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get today's stats
    const [todayStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_appointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'no-show' THEN 1 ELSE 0 END) as no_show
       FROM appointments WHERE DATE(scheduled_date) = ?`,
      [today]
    );

    // Get center loads
    const [centerLoads] = await pool.execute(
      `SELECT cl.*, c.name as center_name, c.city 
       FROM center_load cl
       LEFT JOIN centers c ON cl.center_id = c.id
       WHERE cl.date = ?
       ORDER BY cl.occupancy_percentage DESC`,
      [today]
    );

    // Get fraud stats
    const [fraudStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN resolved = FALSE THEN 1 ELSE 0 END) as unresolved,
        SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as high_risk
       FROM fraud_logs 
       WHERE DATE(detected_at) = ?`,
      [today]
    );

    res.json({
      todayStats: todayStats[0] || {},
      centerLoads: centerLoads || [],
      fraudStats: fraudStats[0] || {}
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get center load
router.get('/center-load/:centerId', async (req, res) => {
  try {
    const { centerId } = req.params;
    const { days } = req.query;
    
    const daysCount = parseInt(days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    const [loads] = await pool.execute(
      `SELECT cl.*, c.name as center_name, c.city 
       FROM center_load cl
       LEFT JOIN centers c ON cl.center_id = c.id
       WHERE cl.center_id = ? AND cl.date >= ?
       ORDER BY cl.date DESC`,
      [centerId, startDate.toISOString().split('T')[0]]
    );

    res.json(loads);
  } catch (error) {
    console.error('Get center load error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all center loads for a date
router.get('/center-load', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [loads] = await pool.execute(
      `SELECT cl.*, c.name as center_name, c.city 
       FROM center_load cl
       LEFT JOIN centers c ON cl.center_id = c.id
       WHERE cl.date = ?
       ORDER BY cl.occupancy_percentage DESC`,
      [targetDate]
    );

    res.json(loads);
  } catch (error) {
    console.error('Get all center loads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update center load
router.post('/center-load', async (req, res) => {
  try {
    const { center_id, date, current_load, predicted_load, capacity } = req.body;

    if (!center_id || !date || !current_load || !capacity) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const occupancyPercentage = (current_load / capacity) * 100;
    const id = uuidv4();

    // Use INSERT ... ON DUPLICATE KEY UPDATE
    await pool.execute(
      `INSERT INTO center_load (id, center_id, date, current_load, predicted_load, capacity, occupancy_percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE current_load = VALUES(current_load), predicted_load = VALUES(predicted_load), occupancy_percentage = VALUES(occupancy_percentage)`,
      [id, center_id, date, current_load, predicted_load || null, capacity, occupancyPercentage]
    );

    const [load] = await pool.execute(
      'SELECT * FROM center_load WHERE center_id = ? AND date = ?',
      [center_id, date]
    );

    res.json(load[0]);
  } catch (error) {
    console.error('Update center load error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get demand forecast
router.get('/demand-forecast', async (req, res) => {
  try {
    const { days } = req.query;
    const daysCount = parseInt(days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    const [forecasts] = await pool.execute(
      `SELECT * FROM demand_forecast 
       WHERE forecast_date >= ?
       ORDER BY forecast_date`,
      [startDate.toISOString().split('T')[0]]
    );

    res.json(forecasts);
  } catch (error) {
    console.error('Get demand forecast error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get fraud stats comparison
router.get('/fraud-comparison', async (req, res) => {
  try {
    // Compare fraud stats before and after system implementation
    const [beforeStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN resolved = TRUE THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as high_risk
       FROM fraud_logs 
       WHERE detected_at < DATE_SUB(NOW(), INTERVAL 90 DAY)`
    );

    const [afterStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN resolved = TRUE THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as high_risk
       FROM fraud_logs 
       WHERE detected_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)`
    );

    res.json({
      before: beforeStats[0] || {},
      after: afterStats[0] || {}
    });
  } catch (error) {
    console.error('Get fraud comparison error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
