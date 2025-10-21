'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'lg'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Ocean Wave Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            {/* Animated Ocean Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-teal-600">
              {/* Wave Animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -bottom-1/2 left-0 right-0 h-1/2 bg-gradient-to-t from-white/20 to-transparent animate-wave"></div>
                <div className="absolute -bottom-1/3 left-0 right-0 h-1/2 bg-gradient-to-t from-white/10 to-transparent animate-wave-slow"></div>
              </div>
            </div>
            
            {/* Modal Container */}
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                ref={modalRef}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden border border-white/20`}
              >
                {/* Header */}
                {title && (
                  <div className="flex items-center justify-between p-8 border-b border-white/20 bg-gradient-to-r from-sky-50 to-blue-50">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-3 hover:bg-white/50 rounded-2xl transition-all duration-200 group"
                    >
                      <X className="w-6 h-6 text-sky-600 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                )}
                
                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                  {children}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};