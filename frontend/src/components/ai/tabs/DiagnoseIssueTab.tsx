'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface DiagnosisResult {
  diagnosis: string;
  suggestedServices: string[];
  estimatedCost: { min: number; max: number };
  urgency: 'Low' | 'Medium' | 'High';
  matchingVendors: Array<{
    name: string;
    rating: number;
    skills: string[];
  }>;
}

const DiagnoseIssueTab: React.FC = () => {
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleDiagnose = async () => {
    if (!description.trim() && !image) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      setResult({
        diagnosis: "Based on your description, this appears to be a screen replacement issue for a smartphone. The device likely needs professional screen replacement services.",
        suggestedServices: ["Screen Replacement", "Device Diagnostics", "Quality Testing"],
        estimatedCost: { min: 1500, max: 4000 },
        urgency: "Medium",
        matchingVendors: [
          { name: "TechFix Pro", rating: 4.8, skills: ["Screen Repair", "Electronics", "Mobile Devices"] },
          { name: "Mobile Masters", rating: 4.6, skills: ["Phone Repair", "Screen Replacement", "Warranty Service"] },
          { name: "Gadget Gurus", rating: 4.7, skills: ["Electronics", "Quick Service", "Original Parts"] }
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const resetForm = () => {
    setDescription('');
    setImage(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Diagnose Your Issue</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe Your Issue *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem you're facing in detail. Include device model, symptoms, and when the issue started..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 bg-white/90 backdrop-blur-sm resize-none h-32"
              required
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
                  <img src={image} alt="Uploaded issue" className="max-h-48 mx-auto rounded-lg" />
                  <p className="text-sm text-gray-500">Click to change image</p>
                </div>
              ) : (
                <div className="text-gray-400">
                  <div className="text-4xl mb-2">📸</div>
                  <p>Click to upload an image of the issue</p>
                  <p className="text-sm mt-1">Supports JPG, PNG, WEBP</p>
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
              onClick={handleDiagnose}
              disabled={isAnalyzing || (!description.trim() && !image)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </div>
              ) : (
                'Diagnose Issue'
              )}
            </button>
            
            {result && (
              <button
                onClick={resetForm}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-50"
              >
                New Diagnosis
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-gray-800">Diagnosis Results</h3>
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Diagnosis</h4>
                <p className="text-gray-600">{result.diagnosis}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 p-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Estimated Cost</h4>
                  <p className="text-blue-600 font-semibold text-lg">
                    ₹{result.estimatedCost.min} - ₹{result.estimatedCost.max}
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 p-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Urgency</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.urgency === 'High' ? 'bg-red-100 text-red-800' :
                    result.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {result.urgency} Priority
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Suggested Services</h4>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedServices.map((service, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Recommended Vendors</h4>
                <div className="space-y-3">
                  {result.matchingVendors.map((vendor, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-800">{vendor.name}</p>
                        <p className="text-sm text-gray-500">{vendor.skills.join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-medium">{vendor.rating}</span>
                        </div>
                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                          View Profile →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2">No Diagnosis Yet</h3>
              <p>Describe your issue or upload an image to get started with AI diagnosis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnoseIssueTab;