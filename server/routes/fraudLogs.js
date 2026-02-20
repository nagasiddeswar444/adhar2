const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

const router = express.Router();

// Get all fraud logs
router.get('/', async (req, res) => {
  try {
    const { aadhaar_record_id, start_date, end_date, resolved } = req.query;
    
    let query = 'SELECT * FROM fraud_logs WHERE 1=1';
    const params = [];

    if (aadhaar_record_id) {
      query += ' AND aadhaar_record_id = ?';
      params.push(aadhaar_record_id);
    }
    if (start_date) {
      query += ' AND detected_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND detected_at <= ?';
      params.push(end_date);
    }
    if (resolved !== undefined) {
      query += ' AND resolved = ?';
      params.push(resolved === 'true');
    }

    query += ' ORDER BY detected_at DESC';

    const [logs] = await pool.execute(query, params);
    res.json(logs);
  } catch (error) {
    console.error('Get fraud logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get fraud log by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [logs] = await pool.execute('SELECT * FROM fraud_logs WHERE id = ?', [id]);

    if (logs.length === 0) {
      return res.status(404).json({ error: 'Fraud log not found' });
    }

    res.json(logs[0]);
  } catch (error) {
    console.error('Get fraud log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create fraud log
router.post('/', async (req, res) => {
  try {
    const { aadhaar_record_id, appointment_id, event_type, risk_level, confidence_score, details, action_taken, notes } = req.body;

    if (!event_type) {
      return res.status(400).json({ error: 'Event type is required' });
    }

    const id = uuidv4();

    await pool.execute(
      `INSERT INTO fraud_logs (id, aadhaar_record_id, appointment_id, event_type, risk_level, confidence_score, details, action_taken, resolved, detected_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, NOW(), ?)`,
      [id, aadhaar_record_id || null, appointment_id || null, event_type, risk_level || 'medium', confidence_score || null, JSON.stringify(details || {}), action_taken || null, notes || null]
    );

    const [newLog] = await pool.execute('SELECT * FROM fraud_logs WHERE id = ?', [id]);
    res.status(201).json(newLog[0]);
  } catch (error) {
    console.error('Create fraud log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resolve fraud log
router.put('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE fraud_logs SET resolved = TRUE, resolved_at = NOW() WHERE id = ?',
      [id]
    );

    const [updatedLog] = await pool.execute('SELECT * FROM fraud_logs WHERE id = ?', [id]);
    
    if (updatedLog.length === 0) {
      return res.status(404).json({ error: 'Fraud log not found' });
    }

    res.json(updatedLog[0]);
  } catch (error) {
    console.error('Resolve fraud log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unresolved fraud count
router.get('/stats/unresolved-count', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'SELECT COUNT(*) as count FROM fraud_logs WHERE resolved = FALSE'
    );
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Get unresolved count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
