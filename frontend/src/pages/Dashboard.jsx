import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Activity, Truck, Users, MapPin, DollarSign, Wrench } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/dashboard/stats', {
          params: { vehicleType: vehicleTypeFilter }
        });
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [vehicleTypeFilter]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  if (loading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 animate-pulse flex items-center gap-2">
          <Activity className="w-5 h-5" /> Loading Analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time overview of fleet operations and KPIs.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Filter Vehicles:</span>
          <select 
            value={vehicleTypeFilter} 
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="All">All Types</option>
            <option value="Truck">Trucks Only</option>
            <option value="Van">Vans Only</option>
            <option value="Mini">Minis Only</option>
          </select>
        </div>
      </div>

      {/* KPI Row 1: High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Fleet Utilization</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.vehicles.utilization}%</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
                <p className="text-sm font-medium text-slate-500">Total Operational Cost</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(stats.finances.total_cost)}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Lifetime combined fuel, maintenance, and expenses</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Trips</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.trips.active}</h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="text-slate-500"><strong className="text-slate-700">{stats.trips.pending}</strong> Pending</span>
              <span className="text-slate-500"><strong className="text-slate-700">{stats.trips.completed}</strong> Completed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-slate-500" />
              <CardTitle>Vehicle Distribution</CardTitle>
            </div>
            <CardDescription>Status breakdown of the non-retired fleet.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Available</span>
                <span className="font-semibold text-slate-900">{stats.vehicles.available}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(stats.vehicles.available / Math.max(1, stats.vehicles.total)) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">On Trip</span>
                <span className="font-semibold text-slate-900">{stats.vehicles.on_trip}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.vehicles.on_trip / Math.max(1, stats.vehicles.total)) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">In Shop</span>
                <span className="font-semibold text-slate-900">{stats.vehicles.in_shop}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(stats.vehicles.in_shop / Math.max(1, stats.vehicles.total)) * 100}%` }}></div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between text-sm font-medium">
                <span className="text-slate-500">Total Filtered Active Fleet</span>
                <span className="text-slate-900">{stats.vehicles.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              <CardTitle>Driver Distribution</CardTitle>
            </div>
            <CardDescription>Status breakdown of the entire driver pool.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Available</span>
                <span className="font-semibold text-slate-900">{stats.drivers.available}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(stats.drivers.available / Math.max(1, stats.drivers.total)) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">On Duty (On Trip)</span>
                <span className="font-semibold text-slate-900">{stats.drivers.on_duty}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.drivers.on_duty / Math.max(1, stats.drivers.total)) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Other (Suspended / Off Duty)</span>
                <span className="font-semibold text-slate-900">{stats.drivers.total - stats.drivers.available - stats.drivers.on_duty}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${((stats.drivers.total - stats.drivers.available - stats.drivers.on_duty) / Math.max(1, stats.drivers.total)) * 100}%` }}></div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between text-sm font-medium">
                <span className="text-slate-500">Total Registered Drivers</span>
                <span className="text-slate-900">{stats.drivers.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
