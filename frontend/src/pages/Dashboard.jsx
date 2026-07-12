import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Truck, Users, MapPin, DollarSign, Wrench, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('All');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, chartRes] = await Promise.all([
          axios.get(`/dashboard/stats?vehicleType=${vehicleTypeFilter}&vehicleStatus=${vehicleStatusFilter}`),
          axios.get(`/dashboard/chart?vehicleType=${vehicleTypeFilter}&vehicleStatus=${vehicleStatusFilter}`)
        ]);
        setStats(statsRes.data.data);
        setChartData(chartRes.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [vehicleTypeFilter, vehicleStatusFilter]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center flex-col gap-2">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-slate-500 dark:text-neutral-400 font-medium">Loading Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 dark:text-neutral-400 mt-1">Real-time overview of fleet operations and KPIs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-neutral-300">Type:</span>
            <select 
              value={vehicleTypeFilter} 
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="h-10 rounded-md border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Types</option>
              <option value="Truck">Trucks</option>
              <option value="Van">Vans</option>
              <option value="Mini">Minis</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-neutral-300">Status:</span>
            <select 
              value={vehicleStatusFilter} 
              onChange={(e) => setVehicleStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Row 1: High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">Fleet Utilization</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-neutral-100 mt-1">{stats.vehicles.utilization}%</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                style={{ width: `${stats.vehicles.utilization}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">Total Operational Cost</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-neutral-100 mt-1">{formatCurrency(stats.finances.total_cost)}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-4">Lifetime combined fuel, maintenance, and expenses</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">Active Trips</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-neutral-100 mt-1">{stats.trips.active}</h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="text-slate-500 dark:text-neutral-400"><strong className="text-slate-700 dark:text-neutral-300">{stats.trips.pending}</strong> Pending</span>
              <span className="text-slate-500 dark:text-neutral-400"><strong className="text-slate-700 dark:text-neutral-300">{stats.trips.completed}</strong> Completed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-slate-500 dark:text-neutral-400" />
              <CardTitle>Vehicle Distribution</CardTitle>
            </div>
            <CardDescription>Status breakdown of the non-retired fleet.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-neutral-300">Available</span>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">{stats.vehicles.available}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(stats.vehicles.available / Math.max(1, stats.vehicles.total)) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-neutral-300">On Trip</span>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">{stats.vehicles.on_trip}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.vehicles.on_trip / Math.max(1, stats.vehicles.total)) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-neutral-300">In Shop</span>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">{stats.vehicles.in_shop}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(stats.vehicles.in_shop / Math.max(1, stats.vehicles.total)) * 100}%` }}></div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-neutral-800 flex justify-between text-sm font-medium">
                <span className="text-slate-500 dark:text-neutral-400">Total Filtered Active Fleet</span>
                <span className="text-slate-900 dark:text-neutral-100">{stats.vehicles.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500 dark:text-neutral-400" />
              <CardTitle>Driver Distribution</CardTitle>
            </div>
            <CardDescription>Status breakdown of the entire driver pool.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-neutral-300">Available</span>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">{stats.drivers.available}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(stats.drivers.available / Math.max(1, stats.drivers.total)) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-neutral-300">On Duty (On Trip)</span>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">{stats.drivers.on_duty}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.drivers.on_duty / Math.max(1, stats.drivers.total)) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-neutral-300">Other (Suspended / Off Duty)</span>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">{stats.drivers.total - stats.drivers.available - stats.drivers.on_duty}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-2">
                <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${((stats.drivers.total - stats.drivers.available - stats.drivers.on_duty) / Math.max(1, stats.drivers.total)) * 100}%` }}></div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-neutral-800 flex justify-between text-sm font-medium">
                <span className="text-slate-500 dark:text-neutral-400">Total Registered Drivers</span>
                <span className="text-slate-900 dark:text-neutral-100">{stats.drivers.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart Row */}
      <Card className="shadow-sm mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-500 dark:text-neutral-400" />
            <CardTitle>Financial Trends (6 Months)</CardTitle>
          </div>
          <CardDescription>Historical aggregation of fuel, maintenance, and general expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full mt-4">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    tickFormatter={(val) => `$${val}`}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${value}`, 'Cost']}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                No financial data recorded in the last 6 months.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
