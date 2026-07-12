import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Edit2, Loader2 } from 'lucide-react';
import { Modal } from '../components/ui/modal';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const initialFormState = {
    registration_number: '',
    name_model: '',
    type: 'Truck',
    max_capacity_kg: '',
    odometer: '',
    acquisition_cost: '',
    status: 'Available'
  };
  const [formData, setFormData] = useState(initialFormState);

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

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData(initialFormState);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registration_number: vehicle.registration_number, // usually immutable, but we keep it for form
      name_model: vehicle.name_model,
      type: vehicle.type,
      max_capacity_kg: vehicle.max_capacity_kg,
      odometer: vehicle.odometer,
      acquisition_cost: vehicle.acquisition_cost,
      status: vehicle.status
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    try {
      if (editingVehicle) {
        await axios.put(`/vehicles/${editingVehicle.id}`, formData);
      } else {
        await axios.post('/vehicles', formData);
      }
      setIsModalOpen(false);
      fetchVehicles(); // Refresh data
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setIsSaving(false);
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
        <Button onClick={handleOpenAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
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
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(v)} className="text-slate-500 hover:text-blue-600">
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

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        description={editingVehicle ? 'Update the details for this vehicle.' : 'Enter the details to register a new vehicle.'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input 
                id="registration_number" 
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                disabled={!!editingVehicle} 
                required 
                placeholder="e.g. GJ01AB1234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_model">Model Name</Label>
              <Input 
                id="name_model" 
                name="name_model"
                value={formData.name_model}
                onChange={handleChange}
                required 
                placeholder="e.g. TRUCK-X1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Vehicle Type</Label>
              <select 
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Mini">Mini</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="In Shop">In Shop</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_capacity_kg">Capacity (kg)</Label>
              <Input 
                id="max_capacity_kg" 
                name="max_capacity_kg"
                type="number"
                value={formData.max_capacity_kg}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer">Odometer (km)</Label>
              <Input 
                id="odometer" 
                name="odometer"
                type="number"
                value={formData.odometer}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquisition_cost">Cost ($)</Label>
              <Input 
                id="acquisition_cost" 
                name="acquisition_cost"
                type="number"
                step="0.01"
                value={formData.acquisition_cost}
                onChange={handleChange}
                required 
                disabled={!!editingVehicle}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;
