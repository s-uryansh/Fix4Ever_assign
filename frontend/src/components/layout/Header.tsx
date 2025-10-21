'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Menu, User, LogOut, Store } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { VendorOnboardingModal } from '@/components/vendor/VendorOnboardingModal';
import { useVendorAPI } from '@/hooks/useVendorAPI';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onAuthClick: () => void;
  onMenuClick: () => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onAuthClick, onMenuClick, onSearch }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorExists, setVendorExists] = useState<boolean | null>(null);
  const [vendorProfile, setVendorProfile] = useState<any | null>(null);
  
  const { sendOTP, verifyOTP, createVendor, checkEligibility, isLoading: apiLoading } = useVendorAPI();
  const lastCheckedUserId = React.useRef<string | null>(null);

  useEffect(() => {
    if (user) {
      // console.log('User object in Header:', user);
      // console.log('isVerified:', user.isVerified);
      // console.log('User role:', user.role);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    const fetchEligibility = async () => {
      if (!user) {
        lastCheckedUserId.current = null;
        setVendorExists(null);
        setVendorProfile(null);
        return;
      }

      if (lastCheckedUserId.current === String(user._id) || apiLoading) return;
      lastCheckedUserId.current = String(user._id);

      try {
        const res = await checkEligibility();
        if (!mounted) return;
        if (res?.vendorProfile) {
          setVendorExists(true);
          setVendorProfile(res.vendorProfile);
        } else {
          setVendorExists(false);
          setVendorProfile(null);
        }
      } catch (err) {
        console.warn('Failed to check vendor eligibility:', err);
        if (mounted) {
          setVendorExists(false);
          setVendorProfile(null);
        }
      }
    };
    fetchEligibility();
    return () => { mounted = false; };
  }, [user, checkEligibility, apiLoading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleLogout = () => {
    logout();
  };

  const handleVendorButtonClick = () => {
    if (vendorExists) {
      console.log(vendorExists)
      router.push('/vendor/dashboard');
      return;
    }
    setIsVendorModalOpen(true);
  };

  const isVerified = Boolean(user?.isVerified);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onMenuClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">F4E</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Fix4Ever
                </span>
              </motion.div>
            </div>

            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services like 'laptop repair', 'plumbing', 'AC service'..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </form>
            </div>

            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVendorButtonClick}
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 shadow-md"
                    disabled={apiLoading}
                  >
                    <Store className="w-4 h-4" />
                    <span className="text-sm">
                      { (user?.role === 'vendor' || vendorExists) ? 'Vendor Dashboard' : (isVerified ? 'Add Your Business' : 'Become Vendor') }
                    </span>
                  </motion.button>

                  {/* User Profile */}
                  <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                    <User className="w-5 h-5 text-indigo-600" />
                    <span className="text-indigo-700 font-medium text-sm">
                      {user?.name}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAuthClick}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 shadow-md"
                >
                  Register / Sign In
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Vendor Onboarding Modal */}
      <VendorOnboardingModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        userEmail={user?.email || ''}
        onBecomeVendor={createVendor}
        onSendOTP={sendOTP}
        onVerifyOTP={verifyOTP}
        isVerified={isVerified}
      />
    </>
  );
};