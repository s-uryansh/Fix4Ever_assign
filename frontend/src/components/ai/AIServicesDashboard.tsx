'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DiagnoseIssueTab from './tabs/DiagnoseIssueTab';
import FindTechnicianTab from './tabs/FindTechnicianTab';
import GenerateInvoiceTab from './tabs/GenerateInvoiceTab';
import CustomerSupportTab from './tabs/CustomerSupportTab';
import ChatModal from './ChatModal';
import OceanWaveBackground from './OceanWaveBackground';

interface Tab {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
  description: string;
}

const AIServicesDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('diagnose');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const tabs: Tab[] = [
    { 
      id: 'diagnose', 
      label: 'AI Diagnosis', 
      icon: '🔧', 
      component: DiagnoseIssueTab,
      description: 'Get instant diagnosis and cost estimates'
    },
    { 
      id: 'technician', 
      label: 'Find Technician', 
      icon: '👨‍🔧', 
      component: FindTechnicianTab,
      description: 'AI-powered technician matching'
    },
    { 
      id: 'invoice', 
      label: 'Generate Invoice', 
      icon: '🧾', 
      component: GenerateInvoiceTab,
      description: 'Professional invoice generation'
    },
    { 
      id: 'support', 
      label: 'Customer Support', 
      icon: '💬', 
      component: CustomerSupportTab,
      description: '24/7 AI assistance'
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <>
      <OceanWaveBackground />
      
      <div className="relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 border border-white/50 shadow-lg"
          >
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">AI Services Live</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Power</span> Services
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience the future of repair services with our intelligent AI system that diagnoses issues, 
            finds perfect technicians, and manages everything seamlessly
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { number: '5K+', label: 'Issues Diagnosed' },
              { number: '98%', label: 'Accuracy Rate' },
              { number: '2min', label: 'Avg. Response' },
              { number: '24/7', label: 'AI Support' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm"
              >
                <div className="text-2xl font-bold text-blue-600">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-4 rounded-2xl font-semibold transition-all duration-300 border-2 min-w-[140px] ${
                  activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-lg border-blue-200' 
                    : 'bg-white/70 text-gray-600 hover:bg-white border-transparent'
                }`}
              >
                <span className="text-2xl mb-2">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
                <span className="text-xs text-gray-500 font-normal mt-1">{tab.description}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {ActiveComponent && <ActiveComponent />}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Why Choose Our <span className="text-blue-600">AI Services</span>?
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: '🤖',
                  title: 'Smart Diagnosis',
                  description: 'Advanced AI analyzes your issue with 98% accuracy and provides detailed solutions'
                },
                {
                  icon: '⚡',
                  title: 'Instant Matching',
                  description: 'Find the perfect technician in seconds based on skills, location, and availability'
                },
                {
                  icon: '💰',
                  title: 'Cost Transparency',
                  description: 'Get accurate cost estimates upfront with no hidden charges or surprises'
                },
                {
                  icon: '🕒',
                  title: '24/7 Availability',
                  description: 'Our AI assistant is always available to help, day or night'
                },
                {
                  icon: '📊',
                  title: 'Data-Driven Insights',
                  description: 'Smart recommendations based on thousands of successful repairs'
                },
                {
                  icon: '🛡️',
                  title: 'Quality Assurance',
                  description: 'All AI-recommended technicians are verified and rated by real customers'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience Smart Repairs?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust our AI-powered repair services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('diagnose')}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Start AI Diagnosis
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChatOpen(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Talk to AI Assistant
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
        {/* Chat Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl relative group"
        >
          💬
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            AI Assistant
          </div>
        </motion.button>

        {/* Quick Diagnosis Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('diagnose')}
          className="w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-blue-600 text-xl border border-gray-200 relative group"
        >
          🔧
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Quick Diagnosis
          </div>
        </motion.button>
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatModal onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default AIServicesDashboard;