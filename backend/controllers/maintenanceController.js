const pool = require('../db');

const createLog = async (req, res) => {
  const { vehicle_id, service_type, cost, service_date } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Check if vehicle exists and is valid
    const vehicleQuery = await client.query('SELECT * FROM vehicles WHERE id = $1 FOR UPDATE', [vehicle_id]);
    if (vehicleQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }

    const vehicle = vehicleQuery.rows[0];
    if (vehicle.status === 'Retired') {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'error', message: 'Cannot service a retired vehicle' });
    }
    if (vehicle.status === 'On Trip') {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'error', message: 'Cannot service a vehicle currently on a trip' });
    }

    // 2. Insert Maintenance Log (Default status: 'In Shop')
    const result = await client.query(
      `INSERT INTO maintenance_logs (vehicle_id, service_type, cost, service_date, status) 
       VALUES ($1, $2, $3, $4, 'In Shop') RETURNING *`,
      [vehicle_id, service_type, cost, service_date]
    );

    // 3. Update Vehicle Status
    await client.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['In Shop', vehicle_id]);

    await client.query('COMMIT');
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating maintenance log:', error);
    res.status(500).json({ status: 'error', message: 'Server error creating maintenance log' });
  } finally {
    client.release();
  }
};

const getLogs = async (req, res) => {
  try {
    const query = `
      SELECT m.*, v.registration_number, v.name_model 
      FROM maintenance_logs m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      ORDER BY m.service_date DESC
    `;
    const result = await pool.query(query);
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching maintenance logs:', error);
    res.status(500).json({ status: 'error', message: 'Server error fetching maintenance logs' });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Completed'

  if (status !== 'Completed') {
    return res.status(400).json({ status: 'error', message: 'Only Completed status transition is allowed via this endpoint' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get Log
    const logQuery = await client.query('SELECT * FROM maintenance_logs WHERE id = $1 FOR UPDATE', [id]);
    if (logQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'error', message: 'Maintenance log not found' });
    }
    const log = logQuery.rows[0];

    if (log.status === 'Completed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'error', message: 'Log is already completed' });
    }

    // 2. Update Log Status
    await client.query('UPDATE maintenance_logs SET status = $1 WHERE id = $2', ['Completed', id]);

    // 3. Revert Vehicle Status to 'Available' ONLY IF it isn't 'Retired'
    const vehicleQuery = await client.query('SELECT status FROM vehicles WHERE id = $1 FOR UPDATE', [log.vehicle_id]);
    if (vehicleQuery.rows.length > 0 && vehicleQuery.rows[0].status !== 'Retired') {
      await client.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['Available', log.vehicle_id]);
    }

    await client.query('COMMIT');
    res.json({ status: 'success', message: 'Maintenance log completed successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating maintenance log:', error);
    res.status(500).json({ status: 'error', message: 'Server error updating maintenance log' });
  } finally {
    client.release();
  }
};

module.exports = {
  createLog,
  getLogs,
  updateStatus
};
