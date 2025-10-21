'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { HeroSection } from '@/components/home/HeroSection';
import { ServiceGrid } from '@/components/home/ServiceGrid';
import { VendorGrid } from '@/components/home/VendorGrid';
import { TechnicianGrid } from '@/components/home/TechnicianGrid';
import { AuthModal } from '@/components/auth/AuthModal';

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-300 to-blue-500 text-gray-900">
      <Header 
        onAuthClick={() => setIsAuthModalOpen(true)}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="relative container mx-auto px-4 py-8">
        <HeroSection onSearch={(query) => console.log('Search:', query)} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2 space-y-12">
            <ServiceGrid />
            <VendorGrid />
          </div>
          
          <div className="space-y-8">
            <TechnicianGrid />
          </div>
        </div>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}