import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">TransitOps Dashboard</h1>
            <p className="text-slate-500">Welcome back, {user?.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {user?.role_name}
            </div>
            <Button variant="outline" onClick={logout} className="space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Authentication successful. You are viewing protected content.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              The core dashboard features (Vehicles, Drivers, Trips) will be implemented in upcoming sprints.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
