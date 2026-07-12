import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { DollarSign, Droplet, FileText, Calendar } from 'lucide-react';
import { Modal } from '../components/ui/modal';

const Finances = () => {
  const [costs, setCosts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);

  // Filters
  const [filterType, setFilterType] = useState('lifetime'); // 'lifetime', 'month', 'year'
  const [filterValue, setFilterValue] = useState(''); // e.g. '2026-07' or '2026'

  // Modals state
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Forms state
  const [fuelData, setFuelData] = useState({
    vehicle_id: '',
    log_date: new Date().toISOString().split('T')[0],
    liters: '',
    cost: ''
  });

  const [expenseData, setExpenseData] = useState({
    vehicle_id: '',
    trip_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    toll_amount: '',
    other_amount: ''
  });

  const fetchData = async () => {
    try {
      const res = await axios.get('/finances/costs', {
        params: { filterType, filterValue }
      });
      setCosts(res.data.data);
    } catch (err) {
      console.error('Error fetching costs:', err);
    }
  };

  const fetchResources = async () => {
    try {
      const [vRes, tRes] = await Promise.all([
        axios.get('/vehicles'),
        axios.get('/trips')
      ]);
      setVehicles(vRes.data.data);
      setTrips(tRes.data.data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, filterValue]);

  useEffect(() => {
    fetchResources();
  }, []);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post('/finances/fuel', {
        ...fuelData,
        liters: Number(fuelData.liters),
        cost: Number(fuelData.cost)
      });
      setIsFuelModalOpen(false);
      setFuelData({ vehicle_id: '', log_date: new Date().toISOString().split('T')[0], liters: '', cost: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log fuel');
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post('/finances/expense', {
        ...expenseData,
        toll_amount: expenseData.toll_amount ? Number(expenseData.toll_amount) : 0,
        other_amount: expenseData.other_amount ? Number(expenseData.other_amount) : 0
      });
      setIsExpenseModalOpen(false);
      setExpenseData({ vehicle_id: '', trip_id: '', expense_date: new Date().toISOString().split('T')[0], toll_amount: '', other_amount: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log expense');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fuel & Expenses</h1>
          <p className="text-sm text-slate-500">Monitor operational costs across your fleet.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setError(null); setIsFuelModalOpen(true); }} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Droplet className="w-4 h-4" /> Log Fuel
          </Button>
          <Button onClick={() => { setError(null); setIsExpenseModalOpen(true); }} className="gap-2 bg-slate-800 hover:bg-slate-900">
            <FileText className="w-4 h-4" /> Log Expense
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cost Aggregation</CardTitle>
            <CardDescription>Total operational costs per vehicle.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={filterType} 
              onChange={(e) => {
                setFilterType(e.target.value);
                if (e.target.value === 'lifetime') setFilterValue('');
                if (e.target.value === 'year') setFilterValue(new Date().getFullYear().toString());
                if (e.target.value === 'month') setFilterValue(new Date().toISOString().slice(0, 7));
              }}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="lifetime">Lifetime</option>
              <option value="year">By Year</option>
              <option value="month">By Month</option>
            </select>
            {filterType === 'year' && (
              <Input 
                type="number" 
                placeholder="YYYY" 
                value={filterValue} 
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-24 h-9"
              />
            )}
            {filterType === 'month' && (
              <Input 
                type="month" 
                value={filterValue} 
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-40 h-9"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3 text-right">Fuel Cost</th>
                  <th className="px-4 py-3 text-right">Maintenance Cost</th>
                  <th className="px-4 py-3 text-right">Tolls & Other</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-900">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {costs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                      No cost data available for the selected period.
                    </td>
                  </tr>
                ) : (
                  costs.map((c) => (
                    <tr key={c.vehicle_id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex flex-col">
                          <span>{c.registration_number}</span>
                          <span className="text-xs text-slate-500">{c.name_model}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(c.total_fuel_cost)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(c.total_maint_cost)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(c.total_other_cost)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(c.grand_total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Fuel Log Modal */}
      <Modal isOpen={isFuelModalOpen} onClose={() => setIsFuelModalOpen(false)} title="Log Fuel Consumption">
        <form onSubmit={handleFuelSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
          
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <select
              required
              value={fuelData.vehicle_id}
              onChange={(e) => setFuelData({ ...fuelData, vehicle_id: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select a vehicle...</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} - {v.name_model}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" required value={fuelData.log_date} onChange={(e) => setFuelData({ ...fuelData, log_date: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Liters Filled</Label>
              <Input type="number" step="0.01" required min="0.1" value={fuelData.liters} onChange={(e) => setFuelData({ ...fuelData, liters: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Total Cost ($)</Label>
              <Input type="number" step="0.01" required min="0.1" value={fuelData.cost} onChange={(e) => setFuelData({ ...fuelData, cost: e.target.value })} />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsFuelModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Fuel Log'}</Button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Log General Expense">
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
          
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <select
              required
              value={expenseData.vehicle_id}
              onChange={(e) => setExpenseData({ ...expenseData, vehicle_id: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select a vehicle...</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Associated Trip (Optional)</Label>
            <select
              value={expenseData.trip_id}
              onChange={(e) => setExpenseData({ ...expenseData, trip_id: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">None</option>
              {trips.map(t => <option key={t.id} value={t.id}>{t.source} to {t.destination} ({new Date(t.created_at).toLocaleDateString()})</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" required value={expenseData.expense_date} onChange={(e) => setExpenseData({ ...expenseData, expense_date: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Toll Amount ($)</Label>
              <Input type="number" step="0.01" min="0" value={expenseData.toll_amount} onChange={(e) => setExpenseData({ ...expenseData, toll_amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Other Amount ($)</Label>
              <Input type="number" step="0.01" min="0" value={expenseData.other_amount} onChange={(e) => setExpenseData({ ...expenseData, other_amount: e.target.value })} />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Expense'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Finances;
