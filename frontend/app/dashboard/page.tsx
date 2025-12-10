'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/lib/store';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import StatsCards from '@/app/components/dashboard/StatsCards';
import RecentActivities from '@/app/components/dashboard/RecentActivities';
import ProjectProgress from '@/app/components/dashboard/ProjectProgress';
import { useGetDashboardStatsQuery } from '@/app/lib/api/reportApi';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  //const { data: stats, isLoading } = useGetDashboardStatsQuery();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
       <ProtectedRoute> <DashboardLayout user={user}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your projects today.
          </p>
        </div>

       
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <ProjectProgress />
          </div>
          <div>
          
          </div>
        </div>
      </div>
    </DashboardLayout></ProtectedRoute>
   
  );
}