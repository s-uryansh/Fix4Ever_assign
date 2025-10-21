import axios from 'axios';
import { Service, Technician, Vendor, ServiceFormData, TechnicianFormData } from '@/types/index';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No valid token found');
      delete config.headers.Authorization;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const reviewAPI = {
  submitReview: (reviewData: {
    serviceId?: string;
    vendorId?: string;
    technicianId?: string;
    rating: number;
    comment: string;
    userName?: string;
    type?: 'service' | 'vendor' | 'technician';
  }) => {
    const payload: any = {
      rating: reviewData.rating,
      comment: reviewData.comment
    };

    if (reviewData.type === 'service' && reviewData.serviceId) {
      payload.serviceId = reviewData.serviceId;
    } else if (reviewData.type === 'vendor' && reviewData.vendorId) {
      payload.vendorId = reviewData.vendorId;
    } else if (reviewData.type === 'technician' && reviewData.technicianId) {
      payload.technicianId = reviewData.technicianId;
    }

    if (reviewData.userName) {
      payload.userName = reviewData.userName;
    }

    if (reviewData.type) {
      payload.type = reviewData.type;
    }

    return api.post('/reviews/submit', payload);
  },

  getServiceReviews: (serviceId: string) =>
    api.get(`/reviews/service/${serviceId}`),

  getVendorReviews: (vendorId: string) =>
    api.get(`/reviews/vendor/${vendorId}`),

  getTechnicianReviews: (technicianId: string) =>
    api.get(`/reviews/technician/${technicianId}`),
};
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/users/login', { email, password }),
  
  register: (userData: any) => 
    api.post('/users/register', userData),
  
  sendVerification: () => 
    api.post('/users/send-verification'),
  
  verifyEmail: (otp: string) => 
    api.post('/users/verify-email', { otp }),
  
  checkVendorEligibility: () => 
    api.get('/users/check-vendor-eligibility'),
};

export const vendorAPI = {
  create: (vendorData: any) => 
    api.post('/vendors', vendorData),
  
  getAll: (params?: any) => 
    api.get('/vendors', { params }),
  
  getById: (id: string) => 
    api.get(`/vendors/${id}`),
  
  getMyVendor: (): Promise<{ data: { success: boolean; vendor: Vendor } }> => 
    api.get('/vendors/my-vendor'),
  
  addService: (vendorId: string, serviceData: ServiceFormData) => 
    api.post(`/vendors/${vendorId}/services`, serviceData),
  
  updateService: (serviceId: string, serviceData: ServiceFormData) => 
    api.put(`/vendors/services/${serviceId}`, serviceData),
  
  removeService: (serviceId: string) => 
    api.delete(`/vendors/services/${serviceId}`),
  
  addTechnician: (vendorId: string, techData: TechnicianFormData) => 
    api.post(`/vendors/${vendorId}/technicians`, techData),
  
  updateTechnician: (techId: string, techData: TechnicianFormData) => 
    api.put(`/vendors/technicians/${techId}`, techData),
  
  removeTechnician: (techId: string) => 
    api.delete(`/vendors/technicians/${techId}`),
  
  updateVendor: (vendorId: string, vendorData: Partial<Vendor>) => 
    api.put(`/vendors/${vendorId}`, vendorData),
};

export const aiAPI = {
  diagnoseIssue: (data: any) => 
    api.post('/ai/diagnose-issue', data),
  
  suggestTechnician: (data: any) => 
    api.post('/ai/suggest-technician', data),
  
  chatSupport: (data: any) => 
    api.post('/ai/chat-support', data),
  
  generateInvoice: (bookingId: string) => 
    api.post(`/ai/generate-invoice/${bookingId}`),
};

export const bookingAPI = {
  create: (bookingData: any) => 
    api.post('/bookings', bookingData),
  
  getMyBookings: () => 
    api.get('/bookings'),
  
  getById: (id: string) => 
    api.get(`/bookings/${id}`),
  
  updateStatus: (id: string, status: string) => 
    api.put(`/bookings/${id}/status`, { status }),
  
  assignTechnician: (id: string, techId: string) => 
    api.put(`/bookings/${id}/assign-tech`, { techId }),
};