'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const CustomerSupportTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQ[] = [
    {
      question: "How quickly can a technician reach my location?",
      answer: "Most technicians can reach within 1-2 hours in urban areas. Emergency services are available within 30 minutes for critical issues.",
      category: "general"
    },
    {
      question: "What's included in your service warranty?",
      answer: "We provide a 90-day warranty on all repairs, covering both parts and labor. This includes free follow-up visits if the issue recurs.",
      category: "warranty"
    },
    {
      question: "Do you use genuine/original parts?",
      answer: "Yes, we use genuine parts whenever available. For older devices, we use high-quality compatible parts that meet manufacturer standards.",
      category: "parts"
    },
    {
      question: "Can I get a cost estimate before booking?",
      answer: "Absolutely! Use our AI diagnosis tool above to get an accurate cost estimate based on your specific issue and device model.",
      category: "pricing"
    },
    {
      question: "What if the technician can't fix my device?",
      answer: "No charges apply if we cannot fix your device. We only charge for successful repairs and provide a detailed explanation of the issue.",
      category: "pricing"
    },
    {
      question: "Do you offer emergency services?",
      answer: "Yes, 24/7 emergency services are available for critical issues like electrical hazards, major leaks, or security system failures.",
      category: "general"
    }
  ];

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'general', label: 'General' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'warranty', label: 'Warranty' },
    { id: 'parts', label: 'Parts' }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Customer Support</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Search and Categories */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Help Articles
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 bg-white/90 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700 font-medium border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-2">Need Immediate Help?</h3>
            <p className="text-blue-100 text-sm mb-4">Our support team is available 24/7</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>+91 1800-123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <span>support@fix4ever.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span>Live Chat Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Frequently Asked Questions
            </h3>
            <span className="text-sm text-gray-500">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
            </span>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-6"
                >
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                      {faq.category}
                    </span>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                      Was this helpful?
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p>Try searching with different keywords or browse by category</p>
            </div>
          )}

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-4xl mb-3">💬</div>
              <h4 className="font-semibold text-gray-800 mb-2">Live Chat</h4>
              <p className="text-gray-600 text-sm mb-4">Instant help from our support team</p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Start Chat
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-4xl mb-3">📧</div>
              <h4 className="font-semibold text-gray-800 mb-2">Email Support</h4>
              <p className="text-gray-600 text-sm mb-4">Get detailed responses within hours</p>
              <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportTab;