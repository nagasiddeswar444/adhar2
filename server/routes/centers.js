const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// Get all centers
router.get('/', async (req, res) => {
  try {
    const { city, state } = req.query;
    
    let query = 'SELECT * FROM centers WHERE is_active = TRUE';
    const params = [];

    if (city) {
      query += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }
    if (state) {
      query += ' AND state LIKE ?';
      params.push(`%${state}%`);
    }

    query += ' ORDER BY name';

    const [centers] = await pool.execute(query, params);
    res.json(centers);
  } catch (error) {
    console.error('Get centers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get center by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [centers] = await pool.execute(
      'SELECT * FROM centers WHERE id = ?',
      [id]
    );

    if (centers.length === 0) {
      return res.status(404).json({ error: 'Center not found' });
    }

    res.json(centers[0]);
  } catch (error) {
    console.error('Get center error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get centers by coordinates (nearby)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const radiusKm = parseInt(radius) || 10;
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(parseFloat(lat) * Math.PI / 180));

    const [centers] = await pool.execute(
      `SELECT * FROM centers 
       WHERE is_active = TRUE 
       AND latitude BETWEEN ? AND ? 
       AND longitude BETWEEN ? AND ?`,
      [
        parseFloat(lat) - latDelta,
        parseFloat(lat) + latDelta,
        parseFloat(lng) - lngDelta,
        parseFloat(lng) + lngDelta
      ]
    );

    res.json(centers);
  } catch (error) {
    console.error('Get nearby centers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create center (admin)
router.post('/', async (req, res) => {
  try {
    const { name, city, state, pincode, address, capacity, latitude, longitude, phone, email, working_hours_start, working_hours_end } = req.body;

    if (!name || !city || !state || !address || !capacity) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();

    await pool.execute(
      `INSERT INTO centers (id, name, city, state, pincode, address, capacity, latitude, longitude, phone, email, working_hours_start, working_hours_end, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [id, name, city, state, pincode || null, address, capacity, latitude || null, longitude || null, phone || null, email || null, working_hours_start || null, working_hours_end || null]
    );

    const [newCenter] = await pool.execute('SELECT * FROM centers WHERE id = ?', [id]);
    res.status(201).json(newCenter[0]);
  } catch (error) {
    console.error('Create center error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update center (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, state, pincode, address, capacity, latitude, longitude, phone, email, working_hours_start, working_hours_end, is_active } = req.body;

    await pool.execute(
      `UPDATE centers SET name = ?, city = ?, state = ?, pincode = ?, address = ?, capacity = ?, latitude = ?, longitude = ?, phone = ?, email = ?, working_hours_start = ?, working_hours_end = ?, is_active = ? 
       WHERE id = ?`,
      [name, city, state, pincode, address, capacity, latitude, longitude, phone, email, working_hours_start, working_hours_end, is_active, id]
    );

    const [updatedCenter] = await pool.execute('SELECT * FROM centers WHERE id = ?', [id]);
    
    if (updatedCenter.length === 0) {
      return res.status(404).json({ error: 'Center not found' });
    }

    res.json(updatedCenter[0]);
  } catch (error) {
    console.error('Update center error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete center (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM centers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Center not found' });
    }

    res.json({ message: 'Center deleted successfully' });
  } catch (error) {
    console.error('Delete center error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
