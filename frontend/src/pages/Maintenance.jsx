import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, CheckCircle2, Wrench } from 'lucide-react';
import { Modal } from '../components/ui/modal';

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_type: '',
    cost: '',
    service_date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const [logsRes, vehiclesRes] = await Promise.all([
        axios.get('/maintenance'),
        axios.get('/vehicles')
      ]);
      setLogs(logsRes.data.data);
      setVehicles(vehiclesRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('/maintenance', {
        ...formData,
        cost: Number(formData.cost)
      });
      setIsModalOpen(false);
      setFormData({
        vehicle_id: '',
        service_type: '',
        cost: '',
        service_date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log maintenance');
    } finally {
      setLoading(false);
    }
  };

  const completeLog = async (id) => {
    try {
      await axios.patch(`/maintenance/${id}/status`, { status: 'Completed' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete log');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'In Shop': 'bg-amber-100 text-amber-800',
      'Completed': 'bg-emerald-100 text-emerald-800'
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-800'}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Maintenance Workflow</h1>
          <p className="text-slate-500 mt-1">Log vehicle service and track fleet health.</p>
        </div>
        <Button onClick={() => { setError(null); setIsModalOpen(true); }} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Log Maintenance
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Service Records</CardTitle>
          <CardDescription>A complete history of fleet maintenance.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 border-t border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-50/50">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Service Date</th>
                  <th className="px-6 py-4 font-semibold">Vehicle</th>
                  <th className="px-6 py-4 font-semibold">Service Type</th>
                  <th className="px-6 py-4 font-semibold">Cost ($)</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">No maintenance logs found.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {new Date(log.service_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {log.registration_number} <span className="text-xs text-slate-400">({log.name_model})</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-slate-400" />
                        {log.service_type}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        ${Number(log.cost).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                      <td className="px-6 py-4 text-right">
                        {log.status === 'In Shop' && (
                          <Button size="sm" variant="outline" onClick={() => completeLog(log.id)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Completed
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Maintenance" description="Record a new service event. This will automatically mark the vehicle as 'In Shop'.">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Select Vehicle</Label>
            <select
              name="vehicle_id"
              required
              value={formData.vehicle_id}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="">-- Choose a Vehicle --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id} disabled={v.status === 'Retired' || v.status === 'On Trip'}>
                  {v.registration_number} ({v.name_model}) - Current Status: [{v.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Service Type</Label>
            <Input 
              name="service_type" 
              required 
              value={formData.service_type} 
              onChange={handleInputChange} 
              placeholder="e.g. Oil Change, Engine Repair, Tire Replacement" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cost ($)</Label>
              <Input 
                name="cost" 
                type="number" 
                step="0.01" 
                required 
                min="0" 
                value={formData.cost} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label>Service Date</Label>
              <Input 
                name="service_date" 
                type="date" 
                required 
                value={formData.service_date} 
                onChange={handleInputChange} 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {loading ? 'Logging...' : 'Log Maintenance'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Maintenance;
