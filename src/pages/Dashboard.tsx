/**
 * Main Dashboard Page
 *
 * Shows different views based on user role (admin, dispatcher, driver)
 */

import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/admin/AdminDashboard';
import DispatcherDashboard from '@/components/dashboard/DispatcherDashboard';
import DriverDashboard from '@/components/dashboard/DriverDashboard';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const renderDashboard = () => {
    const role = profile?.role || 'dispatcher';

    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'dispatcher':
        return <DispatcherDashboard />;
      case 'driver':
        return <DriverDashboard />;
      default:
        return (
          <Card className="max-w-2xl mx-auto mt-8">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-600">
                <AlertCircle className="mr-2 h-5 w-5" />
                Unknown Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your account role is not recognized. Please contact support.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
