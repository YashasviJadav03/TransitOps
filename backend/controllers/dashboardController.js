const pool = require('../db');

const getDashboardStats = async (req, res) => {
  const { vehicleType } = req.query; // 'All', 'Truck', 'Van', 'Mini'

  try {
    const typeFilter = vehicleType && vehicleType !== 'All' ? `AND type = $1` : '';
    const queryParams = typeFilter ? [vehicleType] : [];

    // 1. Vehicle Stats
    const vehicleQuery = `
      SELECT 
        COUNT(*) as total_active,
        COUNT(CASE WHEN status = 'Available' THEN 1 END) as available,
        COUNT(CASE WHEN status = 'On Trip' THEN 1 END) as on_trip,
        COUNT(CASE WHEN status = 'In Shop' THEN 1 END) as in_shop
      FROM vehicles 
      WHERE status != 'Retired' ${typeFilter}
    `;
    const vehicleResult = await pool.query(vehicleQuery, queryParams);
    const vehicleStats = vehicleResult.rows[0];

    // 2. Driver Stats
    const driverQuery = `
      SELECT 
        COUNT(*) as total_active,
        COUNT(CASE WHEN status = 'Available' THEN 1 END) as available,
        COUNT(CASE WHEN status = 'On Duty' OR status = 'On Trip' THEN 1 END) as on_duty,
        COUNT(CASE WHEN status = 'Suspended' THEN 1 END) as suspended,
        COUNT(CASE WHEN status = 'Off Duty' THEN 1 END) as off_duty
      FROM drivers
    `;
    const driverResult = await pool.query(driverQuery);
    const driverStats = driverResult.rows[0];

    // 3. Trip Stats
    const tripQuery = `
      SELECT 
        COUNT(*) as total_trips,
        COUNT(CASE WHEN status = 'Draft' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'Dispatched' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed
      FROM trips
    `;
    const tripResult = await pool.query(tripQuery);
    const tripStats = tripResult.rows[0];

    // 4. Financials (Total Operational Cost)
    const financeQuery = `
      SELECT 
        (SELECT COALESCE(SUM(cost), 0) FROM fuel_logs) +
        (SELECT COALESCE(SUM(cost), 0) FROM maintenance_logs) +
        (SELECT COALESCE(SUM(toll_amount + other_amount), 0) FROM expenses) as total_operational_cost
    `;
    const financeResult = await pool.query(financeQuery);
    const totalCost = financeResult.rows[0].total_operational_cost;

    // 5. Calculate Utilization
    const totalActiveVehicles = parseInt(vehicleStats.total_active) || 0;
    const vehiclesOnTrip = parseInt(vehicleStats.on_trip) || 0;
    const utilization = totalActiveVehicles > 0 ? ((vehiclesOnTrip / totalActiveVehicles) * 100).toFixed(1) : 0;

    res.json({
      status: 'success',
      data: {
        vehicles: {
          total: totalActiveVehicles,
          available: parseInt(vehicleStats.available),
          on_trip: vehiclesOnTrip,
          in_shop: parseInt(vehicleStats.in_shop),
          utilization: parseFloat(utilization)
        },
        drivers: {
          total: parseInt(driverStats.total_active),
          available: parseInt(driverStats.available),
          on_duty: parseInt(driverStats.on_duty)
        },
        trips: {
          pending: parseInt(tripStats.pending),
          active: parseInt(tripStats.active),
          completed: parseInt(tripStats.completed)
        },
        finances: {
          total_cost: parseFloat(totalCost)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ status: 'error', message: 'Server error fetching dashboard stats' });
  }
};

const getChartData = async (req, res) => {
  try {
    const query = `
      SELECT 
        to_char(event_date, 'Mon YYYY') as month,
        to_char(event_date, 'YYYY-MM') as sort_key,
        SUM(cost) as total
      FROM (
        SELECT log_date as event_date, cost FROM fuel_logs
        UNION ALL
        SELECT service_date as event_date, cost FROM maintenance_logs
        UNION ALL
        SELECT expense_date as event_date, (toll_amount + other_amount) as cost FROM expenses
      ) combined
      WHERE event_date >= date_trunc('month', CURRENT_DATE - INTERVAL '5 months')
      GROUP BY month, sort_key
      ORDER BY sort_key ASC
    `;
    const result = await pool.query(query);
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ status: 'error', message: 'Server error fetching chart data' });
  }
};

module.exports = {
  getDashboardStats,
  getChartData
};
