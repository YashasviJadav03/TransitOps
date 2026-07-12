import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Edit2, AlertTriangle, Loader2, Download } from 'lucide-react';
import { Modal } from '../components/ui/modal';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { exportToCSV } from '../utils/export';

const Drivers = () => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const initialFormState = {
    name: '',
    license_no: '',
    license_category: 'LMV',
    license_expiry: '',
    contact_number: '',
    status: 'Available',
    safety_score: '100.00'
  };
  const [formData, setFormData] = useState(initialFormState);

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

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData(initialFormState);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      license_no: driver.license_no, // usually immutable but kept for form consistency
      license_category: driver.license_category,
      license_expiry: driver.license_expiry.split('T')[0], // format date for input type="date"
      contact_number: driver.contact_number,
      status: driver.status,
      safety_score: driver.safety_score
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
      if (editingDriver) {
        await axios.put(`/drivers/${editingDriver.id}`, formData);
      } else {
        await axios.post('/drivers', formData);
      }
      setIsModalOpen(false);
      fetchDrivers(); // Refresh data
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to save driver');
    } finally {
      setIsSaving(false);
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
        <div className="flex items-center gap-3">
          <Button onClick={() => exportToCSV(drivers, 'drivers_export.csv')} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          {(user?.role_name === 'Fleet Manager' || user?.role_name === 'Safety Officer') && (
            <Button onClick={handleOpenAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Add Driver
            </Button>
          )}
        </div>
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
                          {(user?.role_name === 'Fleet Manager' || user?.role_name === 'Safety Officer') && (
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(d)} className="text-slate-500 hover:text-blue-600">
                              <Edit2 className="w-4 h-4 mr-1" /> Edit
                            </Button>
                          )}
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

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? 'Edit Driver' : 'Add New Driver'}
        description={editingDriver ? 'Update the details for this driver.' : 'Enter the details to register a new driver.'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required 
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_no">License Number</Label>
              <Input 
                id="license_no" 
                name="license_no"
                value={formData.license_no}
                onChange={handleChange}
                disabled={!!editingDriver} 
                required 
                placeholder="e.g. DL-123456"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license_category">License Category</Label>
              <select 
                id="license_category"
                name="license_category"
                value={formData.license_category}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <option value="LMV">LMV (Light Motor Vehicle)</option>
                <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                <option value="MCWG">MCWG (Motor Cycle with Gear)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_expiry">License Expiry Date</Label>
              <Input 
                id="license_expiry" 
                name="license_expiry"
                type="date"
                value={formData.license_expiry}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input 
                id="contact_number" 
                name="contact_number"
                type="tel"
                value={formData.contact_number}
                onChange={handleChange}
                required 
                placeholder="e.g. 9876543210"
              />
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
                <option value="On Duty">On Duty</option>
                <option value="Suspended">Suspended</option>
                <option value="Off Duty">Off Duty</option>
              </select>
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

export default Drivers;
