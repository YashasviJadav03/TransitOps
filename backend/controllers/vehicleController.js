const pool = require('../db');

// @desc    Get all vehicles
// @route   GET /api/vehicles
const getVehicles = async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const values = [];

    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }
    if (type) {
      values.push(type);
      query += ` AND type = $${values.length}`;
    }
    
    query += ' ORDER BY created_at DESC'; // Wait, created_at isn't on vehicles in ERD. We'll order by registration_number
    query = query.replace('ORDER BY created_at DESC', 'ORDER BY registration_number ASC');

    const result = await pool.query(query, values);
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
const createVehicle = async (req, res) => {
  const { registration_number, name_model, type, max_capacity_kg, odometer, acquisition_cost, status } = req.body;
  try {
    // Check unique registration
    const existing = await pool.query('SELECT id FROM vehicles WHERE registration_number = $1', [registration_number]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'error', message: 'Registration number already exists' });
    }

    const result = await pool.query(
      `INSERT INTO vehicles (registration_number, name_model, type, max_capacity_kg, odometer, acquisition_cost, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [registration_number, name_model, type, max_capacity_kg, odometer, acquisition_cost, status || 'Available']
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { name_model, type, max_capacity_kg, odometer, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE vehicles 
       SET name_model = COALESCE($1, name_model), 
           type = COALESCE($2, type), 
           max_capacity_kg = COALESCE($3, max_capacity_kg), 
           odometer = COALESCE($4, odometer), 
           status = COALESCE($5, status)
       WHERE id = $6 RETURNING *`,
      [name_model, type, max_capacity_kg, odometer, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    // Note: Due to foreign key constraints, we might want to just set status to 'Retired' rather than hard delete if it has trips
    // But for CRUD purposes, we'll implement a hard delete that fails if restricted, or we can soft delete.
    const trips = await pool.query('SELECT id FROM trips WHERE vehicle_id = $1', [id]);
    if (trips.rows.length > 0) {
       return res.status(400).json({ status: 'error', message: 'Cannot delete vehicle with existing trips. Set status to Retired instead.' });
    }

    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }
    res.json({ status: 'success', message: 'Vehicle deleted' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

module.exports = { getVehicles, createVehicle, updateVehicle, deleteVehicle };
