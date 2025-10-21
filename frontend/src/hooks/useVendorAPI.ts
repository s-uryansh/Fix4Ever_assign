import { useState } from 'react';
import { authAPI, vendorAPI } from '@/utils/api';

export const useVendorAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOTP = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.sendVerification();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send OTP';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.verifyEmail(otp);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to verify OTP';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createVendor = async (vendorData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vendorAPI.create(vendorData);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create vendor profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEligibility = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.checkVendorEligibility();
      return response.data; // { eligible, vendorProfile?, ... }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to check vendor eligibility';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendOTP,
    verifyOTP,
    createVendor,
    checkEligibility,
    isLoading,
    error,
  };
};