'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Mail, CheckCircle, ArrowLeft, Building2, MapPin, Phone } from 'lucide-react';
import { OTPForm } from '@/components/auth/OTPForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface VendorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onBecomeVendor: (vendorData: any) => Promise<void>;
  onSendOTP: () => Promise<void>;
  onVerifyOTP: (otp: string) => Promise<void>;
  isVerified: boolean;
}

export const VendorOnboardingModal: React.FC<VendorOnboardingModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onBecomeVendor,
  onSendOTP,
  onVerifyOTP,
  isVerified
}) => {
  const [step, setStep] = useState<'start' | 'otp' | 'form'>('start');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null); // <-- new
  const [formData, setFormData] = useState({
    businessName: '',
    gstNumber: '',
    address: '',
    contactEmail: userEmail,
    contactPhone: '',
    serviceAreas: ['']
  });
  const [vendorExists, setVendorExists] = useState<boolean | null>(null);
  const [vendorProfile, setVendorProfile] = useState<any | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // console.log('Modal opened - isVerified:', isVerified);
      setStep(isVerified ? 'form' : 'start');
    }
  }, [isOpen, isVerified]);

  useEffect(() => {
    const checkVendorStatus = async () => {
      if (!user) {
        setVendorExists(false);
        setVendorProfile(null);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/users/check-vendor-eligibility`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // console.log('Vendor eligibility check:', data);
          
          if (data.vendorProfile) {
            setVendorExists(true);
            setVendorProfile(data.vendorProfile);
          } else {
            setVendorExists(false);
            setVendorProfile(null);
          }
        } else {
          setVendorExists(false);
          setVendorProfile(null);
        }
      } catch (error) {
        console.error('Failed to check vendor status:', error);
        setVendorExists(false);
        setVendorProfile(null);
      }
    };

    checkVendorStatus();
  }, [user]);

  const getVendorButtonText = () => {
    // console.log('Button logic - User role:', user?.role, 'Vendor exists:', vendorExists, 'Is verified:', user?.isVerified);
    if (user?.role === 'vendor' || vendorExists) {
      return 'Vendor Dashboard';
    }
    if (user?.isVerified) {
      return 'Add Your Business';
    }
    return 'Become Vendor';
  };

  const vendorButtonText = getVendorButtonText();

  const handleVendorButtonClick = async () => {
    // console.log('Vendor button clicked - Current status:', {
    //   role: user?.role,
    //   vendorExists,
    //   vendorProfile,
    //   buttonText: vendorButtonText
    // });

    if (vendorExists) {
      router.push('/vendor/dashboard');
      return;
    }
    if (user?.isVerified) {
      setStep('form');
      return;
    }

    await handleStart();
  };

  const handleStart = async () => {
    // console.log('handleStart called - isVerified:', isVerified);
    
    if (!isVerified) {
      setIsLoading(true);
      try {
        await onSendOTP();
        setStep('otp');
      } catch (error) {
        console.error('Failed to send OTP:', error);
        if (error instanceof Error && error.message.includes('already verified')) {
          setStep('form');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep('form');
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setIsLoading(true);
    try {
      await onVerifyOTP(otp);
      setStep('form');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.gstNumber || formData.gstNumber.trim() === '') {
      setValidationError('GST Number is required');
      setIsLoading(false);
      return;
    }
  try {
    await onBecomeVendor({
      ...formData,
      serviceAreas: formData.serviceAreas.filter(area => area.trim() !== '')
    });
    onClose();
    setStep('start');
    setFormData({
      businessName: '',
      gstNumber: '',
      address: '',
      contactEmail: userEmail,
      contactPhone: '',
      serviceAreas: ['']
    });
  } catch (error) {
    console.error('Failed to create vendor profile:', error);
  } finally {
    setIsLoading(false);
  }
};

  const addServiceArea = () => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, '']
    }));
  };

  const updateServiceArea = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.map((area, i) => i === index ? value : area)
    }));
  };

  const removeServiceArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  if (step === 'otp') {
    return (
      <OTPForm
        isOpen={true}
        onClose={() => {
          setStep('start');
          onClose();
        }}
        onVerify={handleOTPVerify}
        onResendOTP={onSendOTP}
        email={userEmail}
        isLoading={isLoading}
      />
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {step === 'start' ? 'Become a Vendor' : 'Add Your Business'}
                </h2>
                <p className="text-sm text-gray-600">
                  {step === 'start' ? 'Start your business journey' : 'Complete your business profile'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'start' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Welcome Section */}
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Store className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {isVerified ? 'Ready to Add Your Business?' : 'Join Our Vendor Community'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {isVerified 
                      ? 'Complete your business profile to start receiving customers on Fix4Ever.'
                      : 'Start your business on Fix4Ever and reach thousands of customers looking for reliable services.'
                    }
                  </p>
                </div>

                {/* Benefits */}
                <div className="grid gap-4">
                  {[
                    {
                      icon: '📈',
                      title: 'Grow Your Business',
                      description: 'Reach new customers and expand your service area'
                    },
                    {
                      icon: '💼',
                      title: 'Manage Everything',
                      description: 'Handle bookings, technicians, and payments in one place'
                    },
                    {
                      icon: '⭐',
                      title: 'Build Reputation',
                      description: 'Collect reviews and build trust with customers'
                    }
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-200"
                    >
                      <div className="text-2xl">{benefit.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                        <p className="text-sm text-gray-600">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVendorButtonClick}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                   {isLoading ? (
                     <div className="flex items-center justify-center space-x-2">
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                       <span>Preparing...</span>
                     </div>
                   ) : (
                     <div className="flex items-center justify-center space-x-2">
                       <Store className="w-5 h-5" />
-                      <span>
-                        {isVerified ? 'Add Business Details' : 'Get Started as Vendor'}
-                      </span>
+                      <span>{vendorButtonText}</span>
                     </div>
                   )}
                 </motion.button>

                {/* Verification Status */}
                {isVerified && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Email verified! You can now add your business.
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 'form' && (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Form Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Business Information
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Provide your business details to get started on Fix4Ever
                  </p>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                        className="input-field pl-10"
                        placeholder="Enter your business name"
                      />
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </div>

                  {/* GST Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      GST Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.gstNumber}
                      onChange={(e) => {
                        setValidationError(null); // clear validation when user types
                        setFormData(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))
                      }}
                      className="input-field"
                      placeholder="GSTIN number (required)"
                    />
                    {validationError && (
                      <p className="text-xs text-red-600 mt-1">{validationError}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Business Address *
                    </label>
                    <div className="relative">
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        rows={3}
                        className="input-field resize-none pl-10"
                        placeholder="Enter your complete business address"
                      />
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    </div>
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={formData.contactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        className="input-field pl-10"
                        placeholder="Contact email"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Phone *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={formData.contactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        className="input-field pl-10"
                        placeholder="Contact phone number"
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </div>

                  {/* Service Areas */}
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Service Areas *
                      </label>
                      <button
                        type="button"
                        onClick={addServiceArea}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                      >
                        + Add Area
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.serviceAreas.map((area, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <input
                            type="text"
                            required
                            value={area}
                            onChange={(e) => updateServiceArea(index, e.target.value)}
                            className="input-field flex-1"
                            placeholder="Enter service area (e.g., Mumbai, Delhi)"
                          />
                          {formData.serviceAreas.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeServiceArea(index)}
                              className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors duration-200 font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Add the cities or areas where you provide services
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep('start')}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Profile...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Add Business</span>
                      </div>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};