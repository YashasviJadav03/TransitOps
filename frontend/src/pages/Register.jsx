import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Truck } from 'lucide-react';
import { GridBackground } from '../components/reactbits/GridBackground';
import { StarBorder } from '../components/reactbits/StarBorder';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('Fleet Manager');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await register(email, password, roleName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GridBackground>
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="rounded-full bg-blue-100 p-3 shadow-lg shadow-blue-500/20">
            <Truck className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-neutral-100">TransitOps</h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400">Create a new account to manage your fleet.</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Enter your details to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select 
                  id="role"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                >
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                </select>
              </div>
              <StarBorder type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </StarBorder>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-slate-500 dark:text-neutral-400">
              Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </GridBackground>
  );
};

export default Register;
