'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Laptop, Wrench, Droplets, Zap, Home, Car, Smartphone } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  {
    name: 'Electronics',
    icon: Laptop,
    subcategories: ['Laptop Repair', 'Phone Repair', 'TV Repair', 'Computer Repair', 'Tablet Repair']
  },
  {
    name: 'Appliances',
    icon: Smartphone,
    subcategories: ['Refrigerator', 'Washing Machine', 'AC Repair', 'Microwave', 'Oven']
  },
  {
    name: 'Plumbing',
    icon: Droplets,
    subcategories: ['Leak Repair', 'Pipe Repair', 'Tap Repair', 'Toilet Repair', 'Drain Cleaning']
  },
  {
    name: 'Electrical',
    icon: Zap,
    subcategories: ['Wiring', 'Socket Repair', 'Switch Repair', 'Fuse Replacement', 'Safety Check']
  },
  {
    name: 'Home Repair',
    icon: Home,
    subcategories: ['Furniture Repair', 'Door Repair', 'Window Repair', 'Carpentry', 'Painting']
  },
  {
    name: 'Automotive',
    icon: Car,
    subcategories: ['Car Maintenance', 'Basic Repair', 'Service', 'Tire Change', 'Oil Change']
  },
  {
    name: 'General',
    icon: Wrench,
    subcategories: ['All Services', 'Emergency Repair', 'Maintenance', 'Installation']
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 h-full w-80 bg-surface border-r border-gray-100 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F4E</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Categories</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {categories.map((category) => (
                <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(
                      expandedCategory === category.name ? null : category.name
                    )}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <category.icon className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedCategory === category.name ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedCategory === category.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 space-y-2">
                          {category.subcategories.map((subcategory) => (
                            <button
                              key={subcategory}
                              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                              onClick={onClose}
                            >
                              {subcategory}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};