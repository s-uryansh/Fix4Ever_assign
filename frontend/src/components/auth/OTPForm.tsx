'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, RotateCcw } from 'lucide-react';

interface OTPFormProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResendOTP: () => Promise<void>;
  email: string;
  isLoading?: boolean;
}

export const OTPForm: React.FC<OTPFormProps> = ({
  isOpen,
  onClose,
  onVerify,
  onResendOTP,
  email,
  isLoading = false
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(new Array(6).fill(''));
      setError('');
      setSuccess('');
      setResendCooldown(30);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedDigits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    
    if (pastedDigits.length === 6) {
      const newOtp = [...otp];
      pastedDigits.forEach((digit, index) => {
        newOtp[index] = digit;
      });
      setOtp(newOtp);
      handleSubmit(newOtp.join(''));
    }
  };

  const handleSubmit = async (submittedOtp?: string) => {
    const finalOtp = submittedOtp || otp.join('');
    
    if (finalOtp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      await onVerify(finalOtp);
      setSuccess('Email verified successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    try {
      await onResendOTP();
      setResendCooldown(30);
      setSuccess('New OTP sent to your email!');
      setOtp(new Array(6).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Verify Your Email
                </h2>
                <p className="text-sm text-gray-600">Enter the 6-digit code</p>
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
            <p className="text-gray-600 mb-6 text-center">
              We've sent a verification code to <br />
              <strong className="text-indigo-600">{email}</strong>
            </p>

            <div className="space-y-6">
              {/* OTP Inputs */}
              <div className="flex justify-between gap-3">
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 border-2 border-gray-300 rounded-xl text-center text-xl font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all duration-200 bg-white shadow-sm"
                    disabled={isLoading}
                    whileFocus={{ scale: 1.05 }}
                  />
                ))}
              </div>

              {/* Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-green-600 text-sm bg-green-50 p-3 rounded-xl border border-green-200"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verify Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubmit()}
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify Email'
                )}
              </motion.button>

              {/* Resend OTP */}
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: resendCooldown === 0 ? 1.05 : 1 }}
                  whileTap={{ scale: resendCooldown === 0 ? 0.95 : 1 }}
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || isLoading}
                  className="flex items-center justify-center space-x-2 text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200 mx-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    {resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s` 
                      : 'Resend OTP'
                    }
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};