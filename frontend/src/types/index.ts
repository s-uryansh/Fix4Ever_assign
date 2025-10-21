export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  role: string;
}
export interface Review {
  _id: string;
  serviceId?: string;
  vendorId?: string;
  technicianId?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  type?: string;
}
export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'electronics' | 'appliances' | 'plumbing' | 'electrical' | 'home' | 'other';
  estimatedDuration: number;
  averageRating?: number;
  reviewCount?: number;
}

export interface Technician {
  _id: string;
  name: string;
  skills: string[];
  phone: string;
  experience: number;
  available: boolean;
  currentLocation?: {
    lat: number;
    lon: number;
  };
}

export interface Vendor {
  _id: string;
  ownerId: string;
  businessName: string;
  gstNumber?: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  servicesOffered: Service[];
  technicians: Technician[];
  rating: number;
  serviceAreas: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  estimatedDuration: string;
}

export interface TechnicianFormData {
  name: string;
  skills: string;
  phone: string;
  experience: string;
  available: boolean;
}

export interface Booking {
  _id: string;
  userId: string;
  vendorId: string;
  technicianId?: string;
  serviceId: string;
  status: 'pending' | 'accepted' | 'on-the-way' | 'working' | 'completed' | 'cancelled';
  address: string;
  scheduleTime: string;
  price: number;
  issueDescription?: string;
}
export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}