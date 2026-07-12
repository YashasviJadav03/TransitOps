const pool = require('../db');

// @desc    Get all drivers
// @route   GET /api/drivers
const getDrivers = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM drivers WHERE 1=1';
    const values = [];

    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }
    
    query += ' ORDER BY name ASC';
    const result = await pool.query(query, values);
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

// @desc    Create a driver
// @route   POST /api/drivers
const createDriver = async (req, res) => {
  const { name, license_no, license_category, license_expiry, contact_number, status } = req.body;
  try {
    // Check unique license
    const existing = await pool.query('SELECT id FROM drivers WHERE license_no = $1', [license_no]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'error', message: 'License number already exists' });
    }

    const result = await pool.query(
      `INSERT INTO drivers (name, license_no, license_category, license_expiry, contact_number, status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, license_no, license_category, license_expiry, contact_number, status || 'Available']
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

// @desc    Update a driver
// @route   PUT /api/drivers/:id
const updateDriver = async (req, res) => {
  const { id } = req.params;
  const { name, license_category, license_expiry, contact_number, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE drivers 
       SET name = COALESCE($1, name), 
           license_category = COALESCE($2, license_category), 
           license_expiry = COALESCE($3, license_expiry), 
           contact_number = COALESCE($4, contact_number), 
           status = COALESCE($5, status)
       WHERE id = $6 RETURNING *`,
      [name, license_category, license_expiry, contact_number, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Driver not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

// @desc    Delete a driver
// @route   DELETE /api/drivers/:id
const deleteDriver = async (req, res) => {
  const { id } = req.params;
  try {
    const trips = await pool.query('SELECT id FROM trips WHERE driver_id = $1', [id]);
    if (trips.rows.length > 0) {
       return res.status(400).json({ status: 'error', message: 'Cannot delete driver with existing trips. Set status to Suspended or Off Duty.' });
    }

    const result = await pool.query('DELETE FROM drivers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Driver not found' });
    }
    res.json({ status: 'success', message: 'Driver deleted' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

module.exports = { getDrivers, createDriver, updateDriver, deleteDriver };
