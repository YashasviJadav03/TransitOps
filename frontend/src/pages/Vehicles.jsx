import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Edit2 } from 'lucide-react';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get('/vehicles');
      setVehicles(res.data.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Available': 'bg-emerald-100 text-emerald-700',
      'On Trip': 'bg-blue-100 text-blue-700',
      'In Shop': 'bg-amber-100 text-amber-700',
      'Retired': 'bg-slate-100 text-slate-600',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles['Retired']}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fleet Registry</h1>
          <p className="text-slate-500 mt-1">Manage and track all company vehicles</p>
        </div>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/50">
                  <th className="p-4 font-semibold">Reg. Number</th>
                  <th className="p-4 font-semibold">Model</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Capacity (kg)</th>
                  <th className="p-4 font-semibold">Odometer</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">Loading vehicles...</td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">No vehicles found.</td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-medium text-slate-700">{v.registration_number}</td>
                      <td className="p-4 text-slate-700">{v.name_model}</td>
                      <td className="p-4 text-slate-500">{v.type}</td>
                      <td className="p-4 text-slate-500">{v.max_capacity_kg.toLocaleString()}</td>
                      <td className="p-4 text-slate-500">{v.odometer.toLocaleString()} km</td>
                      <td className="p-4">{getStatusBadge(v.status)}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vehicles;
