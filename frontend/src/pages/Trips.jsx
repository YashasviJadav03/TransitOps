import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { MapPin, Plus, CheckCircle2, PlayCircle, XCircle, Download, Search } from 'lucide-react';
import { Modal } from '../components/ui/modal';
import { exportToCSV } from '../utils/export';
import { useTableData } from '../hooks/useTableData';
import { SortableHeader } from '../components/ui/SortableHeader';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  const { filteredAndSortedData, searchQuery, setSearchQuery, requestSort, sortConfig } = useTableData(trips, ['source', 'destination', 'registration_number', 'driver_name', 'status']);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingTrip, setCompletingTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [completeFormData, setCompleteFormData] = useState({
    final_odometer: '',
    fuel_consumed_liters: '',
    fuel_cost: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    source: '',
    destination: '',
    cargo_weight_kg: '',
    planned_distance_km: ''
  });

  const fetchTrips = async () => {
    try {
      const res = await axios.get('/trips');
      setTrips(res.data.data);
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  const fetchResources = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        axios.get('/vehicles'),
        axios.get('/drivers')
      ]);
      setVehicles(vRes.data.data);
      setDrivers(dRes.data.data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchResources();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCompleteInputChange = (e) => {
    setCompleteFormData({ ...completeFormData, [e.target.name]: e.target.value });
  };

  const handleOpenCompleteModal = (trip) => {
    const vehicle = vehicles.find(v => v.registration_number === trip.registration_number);
    setCompletingTrip(trip);
    setCompleteFormData({
      final_odometer: vehicle ? vehicle.odometer : '',
      fuel_consumed_liters: '',
      fuel_cost: ''
    });
    setError(null);
    setIsCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.patch(`/trips/${completingTrip.id}/status`, {
        status: 'Completed',
        final_odometer: Number(completeFormData.final_odometer),
        fuel_consumed_liters: Number(completeFormData.fuel_consumed_liters),
        fuel_cost: Number(completeFormData.fuel_cost)
      });
      setIsCompleteModalOpen(false);
      setCompletingTrip(null);
      fetchTrips();
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete trip');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side Capacity Validation
    const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);
    if (selectedVehicle && Number(formData.cargo_weight_kg) > selectedVehicle.max_capacity_kg) {
      setError(`Cargo weight exceeds maximum capacity of ${selectedVehicle.max_capacity_kg} kg for this vehicle.`);
      setLoading(false);
      return;
    }

    try {
      await axios.post('/trips', {
        ...formData,
        cargo_weight_kg: Number(formData.cargo_weight_kg),
        planned_distance_km: Number(formData.planned_distance_km)
      });
      setIsModalOpen(false);
      setFormData({
        vehicle_id: '',
        driver_id: '',
        source: '',
        destination: '',
        cargo_weight_kg: '',
        planned_distance_km: ''
      });
      fetchTrips();
      fetchResources(); // refresh resource statuses
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/trips/${id}/status`, { status });
      fetchTrips();
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Draft': 'bg-slate-100 text-slate-800',
      'Dispatched': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-emerald-100 text-emerald-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles['Draft']}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trip Management</h1>
          <p className="text-sm text-slate-500">Plan and dispatch active trips.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search trips..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button onClick={() => exportToCSV(filteredAndSortedData, 'trips_export.csv')} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button onClick={() => { setError(null); setIsModalOpen(true); }} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Create Trip
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active & Historical Trips</CardTitle>
          <CardDescription>A list of all trips created in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <SortableHeader label="Route" sortKey="source" requestSort={requestSort} sortConfig={sortConfig} />
                  <SortableHeader label="Vehicle" sortKey="registration_number" requestSort={requestSort} sortConfig={sortConfig} />
                  <SortableHeader label="Driver" sortKey="driver_name" requestSort={requestSort} sortConfig={sortConfig} />
                  <SortableHeader label="Cargo (kg)" sortKey="cargo_weight_kg" requestSort={requestSort} sortConfig={sortConfig} />
                  <SortableHeader label="Distance (km)" sortKey="planned_distance_km" requestSort={requestSort} sortConfig={sortConfig} />
                  <SortableHeader label="Status" sortKey="status" requestSort={requestSort} sortConfig={sortConfig} />
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                      No trips found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedData.map((trip) => (
                    <tr key={trip.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{trip.source} → {trip.destination}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{trip.registration_number}</td>
                      <td className="px-4 py-3 text-slate-600">{trip.driver_name}</td>
                      <td className="px-4 py-3 text-slate-600">{trip.cargo_weight_kg}</td>
                      <td className="px-4 py-3 text-slate-600">{trip.planned_distance_km}</td>
                      <td className="px-4 py-3">{getStatusBadge(trip.status)}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {trip.status === 'Draft' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateStatus(trip.id, 'Dispatched')} className="h-8 gap-1">
                              <PlayCircle className="w-3.5 h-3.5" /> Dispatch
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(trip.id, 'Cancelled')} className="h-8 gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Cancel
                            </Button>
                          </>
                        )}
                        {trip.status === 'Dispatched' && (
                          <Button size="sm" variant="outline" onClick={() => handleOpenCompleteModal(trip)} className="h-8 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Trip">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source</Label>
              <Input name="source" required value={formData.source} onChange={handleInputChange} placeholder="Origin City" />
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input name="destination" required value={formData.destination} onChange={handleInputChange} placeholder="Destination City" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Vehicle</Label>
            <select
              name="vehicle_id"
              required
              value={formData.vehicle_id}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <option value="">-- Choose a Vehicle --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id} disabled={v.status !== 'Available'}>
                  {v.registration_number} - {v.name_model} (Max: {v.max_capacity_kg}kg) - [{v.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Select Driver</Label>
            <select
              name="driver_id"
              required
              value={formData.driver_id}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <option value="">-- Choose a Driver --</option>
              {drivers.map(d => {
                const isExpired = new Date(d.license_expiry) < new Date();
                const isAvailable = d.status === 'Available' && !isExpired;
                return (
                  <option key={d.id} value={d.id} disabled={!isAvailable}>
                    {d.name} ({d.license_no}) - [{isExpired ? 'Expired' : d.status}]
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cargo Weight (kg)</Label>
              <Input name="cargo_weight_kg" type="number" required min="1" value={formData.cargo_weight_kg} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Planned Distance (km)</Label>
              <Input name="planned_distance_km" type="number" required min="1" value={formData.planned_distance_km} onChange={handleInputChange} />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Trip'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} title="Complete Trip">
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Final Odometer (km)</Label>
            <Input name="final_odometer" type="number" required min="1" value={completeFormData.final_odometer} onChange={handleCompleteInputChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fuel Consumed (Liters)</Label>
              <Input name="fuel_consumed_liters" type="number" step="0.01" required min="0.01" value={completeFormData.fuel_consumed_liters} onChange={handleCompleteInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Fuel Cost ($)</Label>
              <Input name="fuel_cost" type="number" step="0.01" required min="0" value={completeFormData.fuel_cost} onChange={handleCompleteInputChange} />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsCompleteModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? 'Completing...' : 'Complete Trip'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Trips;
