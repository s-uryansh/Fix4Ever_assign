'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthModal } from '@/components/auth/AuthModal';
import AIServicesDashboard from '@/components/ai/AIServicesDashboard';

export default function AIPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      <Header 
        onAuthClick={() => setIsAuthModalOpen(true)}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="container mx-auto px-4 py-8">
        <AIServicesDashboard />
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}