'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { aiAPI } from '@/utils/api';

interface Technician {
  id: string;
  name: string;
  rating: number;
  skills: string[];
  experience: string;
  location: string;
  priceRange: { min: number; max: number };
  availability: string;
  image?: string;
  vendor?: {
    businessName: string;
    rating: number;
  };
}

const FindTechnicianTab: React.FC = () => {
  const [serviceType, setServiceType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleFindTechnicians = async () => {
    if (!serviceType.trim() && !image) {
      setError('Please describe the service needed or upload an image');
      return;
    }

    setIsSearching(true);
    setError('');
    
    try {
      let imageData = null;
      
      // Convert image to base64 if exists
      if (imageFile) {
        imageData = await convertImageToBase64(imageFile);
      }

      const response = await aiAPI.suggestTechnician({
        issueDescription: serviceType,
        userLocation: location ? { address: location } : undefined,
        imageData: imageData
      });

      if (response.data.success) {
        setTechnicians(response.data.suggestedTechnicians || []);
      } else {
        setError('Failed to find technicians. Please try again.');
      }
    } catch (error: any) {
      console.error('Error finding technicians:', error);
      setError(error.response?.data?.message || 'Failed to find technicians. Please try again.');
      
      // Fallback to mock data if API fails
      setTechnicians(getMockTechnicians());
    } finally {
      setIsSearching(false);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const getMockTechnicians = (): Technician[] => {
    return [
      {
        id: '1',
        name: 'Rajesh Kumar',
        rating: 4.8,
        skills: ['Screen Repair', 'Battery Replacement', 'Software Issues'],
        experience: '5+ years',
        location: location || 'Bangalore',
        priceRange: { min: 500, max: 3000 },
        availability: 'Available Today',
        vendor: { businessName: 'TechFix Pro', rating: 4.7 }
      },
      {
        id: '2',
        name: 'Priya Sharma',
        rating: 4.9,
        skills: ['Mobile Repair', 'Water Damage', 'Camera Issues'],
        experience: '7+ years',
        location: location || 'Bangalore',
        priceRange: { min: 800, max: 4000 },
        availability: 'Available Tomorrow',
        vendor: { businessName: 'Mobile Masters', rating: 4.6 }
      },
      {
        id: '3',
        name: 'Amit Patel',
        rating: 4.6,
        skills: ['Laptop Repair', 'Hardware Upgrades', 'Data Recovery'],
        experience: '4+ years',
        location: location || 'Bangalore',
        priceRange: { min: 1000, max: 5000 },
        availability: 'Available Today',
        vendor: { businessName: 'Gadget Gurus', rating: 4.8 }
      }
    ];
  };

  const resetForm = () => {
    setServiceType('');
    setLocation('');
    setImage(null);
    setImageFile(null);
    setTechnicians([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Find Perfect Technician</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Search Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Needed *
            </label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g., Phone screen repair, AC servicing, Plumbing..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 bg-white/90 backdrop-blur-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your area or city..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 bg-white/90 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image (Optional)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors duration-300"
            >
              {image ? (
                <div className="space-y-2">
                  <img src={image} alt="Uploaded issue" className="max-h-32 mx-auto rounded-lg" />
                  <p className="text-sm text-gray-500">Click to change image</p>
                </div>
              ) : (
                <div className="text-gray-400">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p>Upload image for better matching</p>
                  <p className="text-sm mt-1">AI will analyze the image to find the right technician</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleFindTechnicians}
              disabled={isSearching || (!serviceType.trim() && !image)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSearching ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Finding Best Technicians...
                </div>
              ) : (
                'Find Technicians'
              )}
            </button>
            
            {technicians.length > 0 && (
              <button
                onClick={resetForm}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-50"
              >
                New Search
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {technicians.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Matching Technicians ({technicians.length})
                </h3>
                <span className="text-sm text-gray-500">AI Recommended</span>
              </div>
              
              <div className="space-y-4">
                {technicians.map((tech, index) => (
                  <motion.div
                    key={tech.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {tech.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg">{tech.name}</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">⭐</span>
                                <span className="font-medium">{tech.rating}</span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{tech.experience}</span>
                            </div>
                            {tech.vendor && (
                              <p className="text-sm text-blue-600">{tech.vendor.businessName}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {tech.skills.map((skill, skillIndex) => (
                              <span key={skillIndex} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">📍 {tech.location}</p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">Price Range</p>
                            <p className="font-semibold text-gray-800">
                              ₹{tech.priceRange.min} - ₹{tech.priceRange.max}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            tech.availability === 'Available Today' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tech.availability}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Book Now
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        Message
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-6xl mb-4">👨‍🔧</div>
              <h3 className="text-lg font-medium mb-2">Find Your Perfect Technician</h3>
              <p>Describe your service needs or upload an image to find certified technicians near you</p>
              <p className="text-sm mt-2 text-gray-400">Our AI will match you with the best technicians for your specific needs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindTechnicianTab;