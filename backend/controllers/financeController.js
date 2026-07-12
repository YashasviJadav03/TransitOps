const pool = require('../db');

const addFuelLog = async (req, res) => {
  const { vehicle_id, log_date, liters, cost } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO fuel_logs (vehicle_id, log_date, liters, cost) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [vehicle_id, log_date, liters, cost]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error adding fuel log:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

const addExpense = async (req, res) => {
  const { vehicle_id, trip_id, maintenance_id, toll_amount, other_amount, expense_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO expenses (vehicle_id, trip_id, maintenance_id, toll_amount, other_amount, expense_date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [vehicle_id, trip_id || null, maintenance_id || null, toll_amount || 0, other_amount || 0, expense_date]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

const getVehicleCosts = async (req, res) => {
  const { filterType, filterValue } = req.query; 
  // filterType: 'lifetime', 'month', 'year'
  // filterValue: e.g. '2026-07', '2026', or ''

  const type = filterType || 'lifetime';
  const val = filterValue || '';

  try {
    const query = `
      SELECT 
        v.id as vehicle_id, 
        v.registration_number, 
        v.name_model,
        COALESCE(SUM(agg.fuel_cost), 0) as total_fuel_cost,
        COALESCE(SUM(agg.maint_cost), 0) as total_maint_cost,
        COALESCE(SUM(agg.other_cost), 0) as total_other_cost,
        COALESCE(SUM(agg.fuel_cost + agg.maint_cost + agg.other_cost), 0) as grand_total
      FROM vehicles v
      LEFT JOIN (
        SELECT vehicle_id, cost as fuel_cost, 0 as maint_cost, 0 as other_cost, log_date as event_date FROM fuel_logs
        UNION ALL
        SELECT vehicle_id, 0 as fuel_cost, cost as maint_cost, 0 as other_cost, service_date as event_date FROM maintenance_logs
        UNION ALL
        SELECT vehicle_id, 0 as fuel_cost, 0 as maint_cost, (toll_amount + other_amount) as other_cost, expense_date as event_date FROM expenses
      ) agg ON v.id = agg.vehicle_id 
        AND (
          $1::text = 'lifetime' 
          OR ($1::text = 'month' AND to_char(agg.event_date, 'YYYY-MM') = $2::text)
          OR ($1::text = 'year' AND to_char(agg.event_date, 'YYYY') = $2::text)
        )
      GROUP BY v.id, v.registration_number, v.name_model
      ORDER BY grand_total DESC
    `;
    const result = await pool.query(query, [type, val]);
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching vehicle costs:', error);
    res.status(500).json({ status: 'error', message: 'Server error fetching vehicle costs' });
  }
};

module.exports = {
  addFuelLog,
  addExpense,
  getVehicleCosts
};
