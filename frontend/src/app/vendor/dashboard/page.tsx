'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import VendorDashboard from '@/components/vendor/VendorDashboard';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box, Typography } from '@mui/material';

const VendorDashboardPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'vendor')) {
      router.push('/');
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <Box textAlign="center">
          <CircularProgress className="text-indigo-600" />
          <Typography variant="body1" className="mt-4 text-gray-600">
            Loading...
          </Typography>
        </Box>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'vendor') {
    return null;
  }

  return <VendorDashboard />;
};

export default VendorDashboardPage;