const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

const router = express.Router();

// Get documents by appointment ID
router.get('/appointment/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const [documents] = await pool.execute(
      'SELECT * FROM documents WHERE appointment_id = ? ORDER BY created_at DESC',
      [appointmentId]
    );

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get document by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [documents] = await pool.execute('SELECT * FROM documents WHERE id = ?', [id]);

    if (documents.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(documents[0]);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create document
router.post('/', async (req, res) => {
  try {
    const { appointment_id, document_type, file_name, file_size, s3_url, uploaded_by_user } = req.body;

    if (!appointment_id || !document_type || !file_name) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const id = uuidv4();

    await pool.execute(
      `INSERT INTO documents (id, appointment_id, document_type, file_name, file_size, s3_url, status, uploaded_by_user, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NOW())`,
      [id, appointment_id, document_type, file_name, file_size || null, s3_url || null, uploaded_by_user !== false]
    );

    const [newDocument] = await pool.execute('SELECT * FROM documents WHERE id = ?', [id]);
    res.status(201).json(newDocument[0]);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update document status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, review_notes } = req.body;

    const validStatuses = ['pending', 'under-review', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await pool.execute(
      `UPDATE documents SET status = ?, review_notes = ?, reviewed_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [status, review_notes || null, id]
    );

    const [updatedDocument] = await pool.execute('SELECT * FROM documents WHERE id = ?', [id]);
    
    if (updatedDocument.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(updatedDocument[0]);
  } catch (error) {
    console.error('Update document status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM documents WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
