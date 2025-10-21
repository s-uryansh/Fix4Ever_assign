'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Clock, Shield, Waves } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section className="text-center py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 -z-10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-1/4 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-400/20 to-transparent animate-wave"></div>
          <div className="absolute -bottom-1/6 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-400/15 to-transparent animate-wave-slow"></div>
        </div>
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30"
          >
            <Waves className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            We Fix{' '}
            <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              Everything
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-lg">
            Your trusted marketplace for all repair services. From electronics to home appliances, we've got you covered.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-indigo-600 w-6 h-6 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What needs fixing? Try 'broken laptop screen', 'leaking pipe', 'AC not cooling'..."
              className="w-full pl-16 pr-32 py-5 text-lg bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-400 outline-none shadow-2xl transition-all duration-300 placeholder-gray-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Search
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {[
            { icon: Star, title: 'Rated Professionals', desc: 'All technicians are verified and rated' },
            { icon: Clock, title: 'Quick Service', desc: 'Same-day service available for emergencies' },
            { icon: Shield, title: '90-Day Warranty', desc: 'All repairs come with service warranty' }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.2 }}
              className="flex flex-col items-center text-center p-8 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 hover:bg-white/25 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-white/25 rounded-2xl flex items-center justify-center mb-4 border border-white/35">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-white text-xl mb-2">{feature.title}</h3>
              <p className="text-white/85 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};