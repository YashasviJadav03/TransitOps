const pool = require('../db');

const createTrip = async (req, res) => {
  const { vehicle_id, driver_id, source, destination, cargo_weight_kg, planned_distance_km } = req.body;

  try {
    // 1. Validate Vehicle
    const vehicleQuery = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
    if (vehicleQuery.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }
    const vehicle = vehicleQuery.rows[0];

    if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') {
      return res.status(400).json({ status: 'error', message: 'Vehicle is not available for dispatch (Retired/In Shop)' });
    }
    if (vehicle.status === 'On Trip') {
      return res.status(400).json({ status: 'error', message: 'Vehicle is currently On Trip' });
    }
    if (cargo_weight_kg > vehicle.max_capacity_kg) {
      return res.status(400).json({ status: 'error', message: `Cargo weight exceeds vehicle capacity (${vehicle.max_capacity_kg} kg)` });
    }

    // 2. Validate Driver
    const driverQuery = await pool.query('SELECT * FROM drivers WHERE id = $1', [driver_id]);
    if (driverQuery.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Driver not found' });
    }
    const driver = driverQuery.rows[0];

    if (driver.status === 'Suspended') {
      return res.status(400).json({ status: 'error', message: 'Driver is suspended and cannot be dispatched' });
    }
    if (driver.status === 'On Trip') {
      return res.status(400).json({ status: 'error', message: 'Driver is currently On Trip' });
    }
    
    const today = new Date();
    const expiry = new Date(driver.license_expiry);
    if (expiry < today) {
      return res.status(400).json({ status: 'error', message: 'Driver license is expired' });
    }

    // 3. Create Trip (Default status: 'Draft')
    const result = await pool.query(
      `INSERT INTO trips 
        (vehicle_id, driver_id, source, destination, cargo_weight_kg, planned_distance_km, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'Draft') RETURNING *`,
      [vehicle_id, driver_id, source, destination, cargo_weight_kg, planned_distance_km]
    );

    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ status: 'error', message: 'Server error creating trip' });
  }
};

const getTrips = async (req, res) => {
  try {
    const query = `
      SELECT t.*, 
             v.registration_number, v.name_model as vehicle_name, 
             d.name as driver_name, d.license_no 
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query);
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ status: 'error', message: 'Server error fetching trips' });
  }
};

const updateTripStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Dispatched', 'Completed', 'Cancelled'

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get current trip
    const tripQuery = await client.query('SELECT * FROM trips WHERE id = $1 FOR UPDATE', [id]);
    if (tripQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'error', message: 'Trip not found' });
    }
    const trip = tripQuery.rows[0];

    // 2. Validate transition
    const validTransitions = {
      'Draft': ['Dispatched', 'Cancelled'],
      'Dispatched': ['Completed', 'Cancelled'],
      'Completed': [],
      'Cancelled': []
    };

    if (!validTransitions[trip.status].includes(status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'error', message: `Invalid transition from ${trip.status} to ${status}` });
    }

    // 2.5 Validate resources if dispatching
    if (status === 'Dispatched') {
      const vCheck = await client.query('SELECT status FROM vehicles WHERE id = $1 FOR UPDATE', [trip.vehicle_id]);
      if (vCheck.rows.length === 0 || vCheck.rows[0].status !== 'Available') {
        await client.query('ROLLBACK');
        return res.status(400).json({ status: 'error', message: `Cannot dispatch: Vehicle is ${vCheck.rows[0]?.status || 'missing'}` });
      }
      const dCheck = await client.query('SELECT status FROM drivers WHERE id = $1 FOR UPDATE', [trip.driver_id]);
      if (dCheck.rows.length === 0 || dCheck.rows[0].status !== 'Available') {
        await client.query('ROLLBACK');
        return res.status(400).json({ status: 'error', message: `Cannot dispatch: Driver is ${dCheck.rows[0]?.status || 'missing'}` });
      }
    }

    // 3. Update Trip Status
    await client.query('UPDATE trips SET status = $1 WHERE id = $2', [status, id]);

    // 4. Update Resource Statuses based on transition
    if (status === 'Dispatched') {
      await client.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['On Trip', trip.vehicle_id]);
      await client.query('UPDATE drivers SET status = $1 WHERE id = $2', ['On Trip', trip.driver_id]);
    } else if (status === 'Completed' || status === 'Cancelled') {
      await client.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['Available', trip.vehicle_id]);
      await client.query('UPDATE drivers SET status = $1 WHERE id = $2', ['Available', trip.driver_id]);
    }

    await client.query('COMMIT');
    res.json({ status: 'success', message: `Trip status updated to ${status}` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating trip status:', error);
    res.status(500).json({ status: 'error', message: 'Server error updating trip status' });
  } finally {
    client.release();
  }
};

module.exports = {
  createTrip,
  getTrips,
  updateTripStatus
};
