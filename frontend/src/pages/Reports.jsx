import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { FileBarChart, Loader2, Truck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/dashboard/reports');
        setReports(res.data.data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('Failed to load fleet reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center flex-col gap-2">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-slate-500 font-medium">Generating Reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileBarChart className="w-8 h-8 text-blue-600" />
            Fleet Reports & Analytics
          </h1>
          <p className="text-slate-500 mt-1">Deep dive into fuel efficiency, utilization, and cost metrics.</p>
        </div>
      </div>

      {/* Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Fuel Efficiency by Vehicle (km/L)</CardTitle>
            <CardDescription>Higher is better. Identifies fuel-efficient assets.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reports}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="registration_number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="fuel_efficiency" fill="#10b981" radius={[4, 4, 0, 0]} name="Fuel Efficiency (km/L)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Operational Cost per km ($)</CardTitle>
            <CardDescription>Lower is better. Cost efficiency per distance traveled.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reports}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="registration_number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val) => [`$${val}`, 'Cost per km']}
                  />
                  <Bar dataKey="cost_per_km" fill="#ef4444" radius={[4, 4, 0, 0]} name="Cost per km" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-slate-500" />
            <CardTitle>Vehicle Performance Details</CardTitle>
          </div>
          <CardDescription>Comprehensive breakdown of utilization and ROI metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-medium text-slate-500">
                  <th className="pb-3 px-4">Vehicle</th>
                  <th className="pb-3 px-4 text-right">Total Trips</th>
                  <th className="pb-3 px-4 text-right">Distance (km)</th>
                  <th className="pb-3 px-4 text-right">Fuel Used (L)</th>
                  <th className="pb-3 px-4 text-right">Efficiency (km/L)</th>
                  <th className="pb-3 px-4 text-right">Ops Cost</th>
                  <th className="pb-3 px-4 text-right">Cost / km</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">{r.registration_number}</div>
                      <div className="text-xs text-slate-500">{r.name_model} ({r.type})</div>
                    </td>
                    <td className="py-4 px-4 text-right font-medium">{r.total_trips}</td>
                    <td className="py-4 px-4 text-right">{r.total_distance.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right">{r.total_fuel.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.fuel_efficiency > 5 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {r.fuel_efficiency}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">{formatCurrency(r.total_operational_cost)}</td>
                    <td className="py-4 px-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.cost_per_km > 2 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {formatCurrency(r.cost_per_km)}
                      </span>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500">
                      No fleet data available to generate reports.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
