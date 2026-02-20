const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

const router = express.Router();

// Get all update types
router.get('/', async (req, res) => {
  try {
    const { onlineOnly } = req.query;
    
    let query = 'SELECT * FROM update_types WHERE is_active = TRUE';
    
    if (onlineOnly === 'true') {
      query += ' AND can_do_online = TRUE';
    }
    
    query += ' ORDER BY name';

    const [types] = await pool.execute(query);
    res.json(types);
  } catch (error) {
    console.error('Get update types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get update type by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [types] = await pool.execute('SELECT * FROM update_types WHERE id = ?', [id]);

    if (types.length === 0) {
      return res.status(404).json({ error: 'Update type not found' });
    }

    res.json(types[0]);
  } catch (error) {
    console.error('Get update type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get biometric update types
router.get('/biometric/required', async (req, res) => {
  try {
    const [types] = await pool.execute(
      'SELECT * FROM update_types WHERE requires_biometric = TRUE AND is_active = TRUE ORDER BY name'
    );
    res.json(types);
  } catch (error) {
    console.error('Get biometric update types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create update type (admin)
router.post('/', async (req, res) => {
  try {
    const { name, description, risk_level, requires_verification, requires_biometric, can_do_online, estimated_time_minutes } = req.body;

    if (!name || !risk_level) {
      return res.status(400).json({ error: 'Name and risk level are required' });
    }

    const id = uuidv4();

    await pool.execute(
      `INSERT INTO update_types (id, name, description, risk_level, requires_verification, requires_biometric, can_do_online, estimated_time_minutes, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [id, name, description || null, risk_level, requires_verification || false, requires_biometric || false, can_do_online || false, estimated_time_minutes || null]
    );

    const [newType] = await pool.execute('SELECT * FROM update_types WHERE id = ?', [id]);
    res.status(201).json(newType[0]);
  } catch (error) {
    console.error('Create update type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update update type (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, risk_level, requires_verification, requires_biometric, can_do_online, estimated_time_minutes, is_active } = req.body;

    await pool.execute(
      `UPDATE update_types SET name = ?, description = ?, risk_level = ?, requires_verification = ?, requires_biometric = ?, can_do_online = ?, estimated_time_minutes = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, description, risk_level, requires_verification, requires_biometric, can_do_online, estimated_time_minutes, is_active, id]
    );

    const [updatedType] = await pool.execute('SELECT * FROM update_types WHERE id = ?', [id]);
    
    if (updatedType.length === 0) {
      return res.status(404).json({ error: 'Update type not found' });
    }

    res.json(updatedType[0]);
  } catch (error) {
    console.error('Update update type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete update type (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM update_types WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Update type not found' });
    }

    res.json({ message: 'Update type deleted successfully' });
  } catch (error) {
    console.error('Delete update type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
