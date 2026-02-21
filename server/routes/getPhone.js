const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Get phone by Aadhaar number
// GET /api/get-phone?aadhaarNumber=123456789012
router.get('/get-phone', async (req, res) => {
  try {
    const { aadhaarNumber } = req.query;

    if (!aadhaarNumber) {
      return res.status(400).json({ error: 'Aadhaar number is required' });
    }

    // First try to get from aadhaar_records table directly
    const [aadhaarRecords] = await pool.execute(
      'SELECT phone FROM aadhaar_records WHERE aadhaar_number = ?',
      [aadhaarNumber]
    );

    if (aadhaarRecords.length === 0) {
      return res.status(404).json({ error: 'Aadhaar number not found', exists: false });
    }

    const aadhaarRecord = aadhaarRecords[0];
    
    // Try to get email from users table via the aadhaar record's user_id
    let email = null;
    try {
      // First get the user_id from aadhaar_records
      const [recordsWithUser] = await pool.execute(
        'SELECT user_id FROM aadhaar_records WHERE aadhaar_number = ?',
        [aadhaarNumber]
      );
      
      if (recordsWithUser.length > 0 && recordsWithUser[0].user_id) {
        const [users] = await pool.execute(
          'SELECT email FROM users WHERE id = ?',
          [recordsWithUser[0].user_id]
        );
        if (users.length > 0) {
          email = users[0].email;
        }
      }
    } catch (err) {
      console.log('Could not fetch user email:', err.message);
    }

    res.json({ 
      exists: true,
      phone: aadhaarRecord.phone,
      email: email
    });
  } catch (error) {
    console.error('Get phone error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
