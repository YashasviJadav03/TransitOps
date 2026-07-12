const pool = require('../db');
const path = require('path');
const fs = require('fs');

const getVehicleDocuments = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT id, document_type, file_name, file_path, uploaded_at
      FROM vehicle_documents
      WHERE vehicle_id = $1
      ORDER BY uploaded_at DESC
    `;
    const result = await pool.query(query, [id]);
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

const uploadVehicleDocument = async (req, res) => {
  const { id } = req.params;
  const { document_type } = req.body;
  const file = req.file;

  if (!file || !document_type) {
    return res.status(400).json({ status: 'error', message: 'File and document_type are required' });
  }

  try {
    // Generate the path to serve the file statically
    const filePath = `/uploads/vehicle_documents/${file.filename}`;
    
    const query = `
      INSERT INTO vehicle_documents (vehicle_id, document_type, file_name, file_path)
      VALUES ($1, $2, $3, $4)
      RETURNING id, document_type, file_name, file_path, uploaded_at
    `;
    const result = await pool.query(query, [id, document_type, file.originalname, filePath]);
    
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

const deleteVehicleDocument = async (req, res) => {
  const { docId } = req.params;

  try {
    const getDocQuery = `SELECT file_path FROM vehicle_documents WHERE id = $1`;
    const docResult = await pool.query(getDocQuery, [docId]);

    if (docResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Document not found' });
    }

    const filePath = docResult.rows[0].file_path;
    
    // Attempt to delete physical file
    const physicalPath = path.join(__dirname, '..', filePath);
    fs.unlink(physicalPath, (err) => {
      if (err) console.error('Failed to delete physical file:', err);
    });

    const deleteQuery = `DELETE FROM vehicle_documents WHERE id = $1`;
    await pool.query(deleteQuery, [docId]);

    res.json({ status: 'success', message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

module.exports = {
  getVehicleDocuments,
  uploadVehicleDocument,
  deleteVehicleDocument
};
