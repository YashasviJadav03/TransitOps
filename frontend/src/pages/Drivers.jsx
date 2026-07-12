import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Edit2, AlertTriangle } from 'lucide-react';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get('/drivers');
      setDrivers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Available': 'bg-emerald-100 text-emerald-700',
      'On Duty': 'bg-blue-100 text-blue-700',
      'Suspended': 'bg-red-100 text-red-700',
      'Off Duty': 'bg-slate-100 text-slate-600',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles['Off Duty']}`}>
        {status}
      </span>
    );
  };

  const isExpiringSoon = (dateString) => {
    const expiry = new Date(dateString);
    const now = new Date();
    const monthsLeft = (expiry - now) / (1000 * 60 * 60 * 24 * 30);
    return monthsLeft < 3; // Less than 3 months
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Driver Profiles</h1>
          <p className="text-slate-500 mt-1">Manage personnel and monitor license validity</p>
        </div>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Driver
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/50">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">License No.</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Expiry Date</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold">Safety Score</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500">Loading drivers...</td>
                  </tr>
                ) : drivers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500">No drivers found.</td>
                  </tr>
                ) : (
                  drivers.map((d) => {
                    const expiring = isExpiringSoon(d.license_expiry);
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-700">{d.name}</td>
                        <td className="p-4 font-mono text-slate-500">{d.license_no}</td>
                        <td className="p-4 text-slate-500">{d.license_category}</td>
                        <td className="p-4">
                          <span className={`flex items-center gap-2 ${expiring ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                            {new Date(d.license_expiry).toLocaleDateString()}
                            {expiring && <AlertTriangle className="w-4 h-4 text-amber-500" title="Expiring soon" />}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{d.contact_number}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${parseFloat(d.safety_score) >= 90 ? 'bg-emerald-500' : parseFloat(d.safety_score) >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${d.safety_score}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">{d.safety_score}%</span>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(d.status)}</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
                            <Edit2 className="w-4 h-4 mr-1" /> Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Drivers;
