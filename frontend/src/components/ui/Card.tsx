'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  expandable?: boolean;
  expandedContent?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  expandable = false,
  expandedContent
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedRef.current && !expandedRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  const handleCardClick = () => {
    if (expandable && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleCloseExpanded = () => {
    setIsExpanded(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`card cursor-pointer transform transition-all duration-300 ${className}`}
        onClick={handleCardClick}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {isExpanded && expandable && expandedContent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400/90 via-blue-500/90 to-teal-600/90 backdrop-blur-sm">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -bottom-1/2 left-0 right-0 h-1/2 bg-gradient-to-t from-white/30 to-transparent animate-wave"></div>
                  <div className="absolute -bottom-1/3 left-0 right-0 h-1/2 bg-gradient-to-t from-white/20 to-transparent animate-wave-slow"></div>
                </div>
              </div>
              
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                <motion.div
                  ref={expandedRef}
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 50 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-white/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  {expandedContent}
                  <button
                    onClick={handleCloseExpanded}
                    className="absolute top-6 right-6 p-3 hover:bg-white/50 rounded-2xl transition-all duration-200 group"
                  >
                    <div className="w-6 h-6 text-sky-600 group-hover:scale-110 transition-transform">✕</div>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};