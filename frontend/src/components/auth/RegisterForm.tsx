'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { countryCodes, CountryCode } from './counterCode';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[1]); // Default to India
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countryCodes;
    
    const query = searchQuery.toLowerCase();
    return countryCodes.filter(country => 
      country.name.toLowerCase().includes(query) ||
      country.dialCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      toast.error(`Password requirements:\n${passwordErrors.join('\n')}`);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.phone.length < 5) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const fullPhoneNumber = selectedCountry.dialCode + formData.phone.replace(/\D/g, '');
      
      await register({
        ...formData,
        phone: fullPhoneNumber
      });
      onSuccess();
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };
  const validatePassword = (password: string) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return errors;
};
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const selectCountry = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setSearchQuery(''); 
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input-field"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="input-field"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="flex space-x-2">
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[120px]"
            >
              <span className="text-sm">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showCountryDropdown && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => selectCountry(country)}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                        selectedCountry.code === country.code ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <span className="text-base">{country.flag}</span>
                      <span className="flex-1 text-sm font-medium">{country.name}</span>
                      <span className="text-sm text-gray-500">{country.dialCode}</span>
                    </button>
                  ))}
                  
                  {filteredCountries.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="flex-1">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              required
              className="input-field"
              placeholder="Phone number"
            />
          </div>
        </div>
        {/* <p className="text-xs text-gray-500 mt-1">
          Selected: {selectedCountry.flag} {selectedCountry.name} {selectedCountry.dialCode}
        </p> */}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="input-field"
          placeholder="Create a password"
          minLength={6}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="input-field"
          placeholder="Confirm your password"
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.form>
  );
};