// Mock Booking API - Temporary implementation
// This will be replaced with Supabase integration later

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  image: string;
  includesProducts: boolean;
  products?: string[];
}

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  serviceName: string;
  status: 'pending_approval' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  scheduledDate: string;
  scheduledTime: string;
  totalAmount: number;
  beautician?: {
    id: string;
    name: string;
    phone: string;
    arrivalTime: string;
    skills: string[];
  };
  customerDetails: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Beautician {
  id: string;
  name: string;
  phone: string;
  skills: string[];
  rating: number;
  experience: number; // years
  isAvailable: boolean;
}

// Mock data
const mockServicesWithProducts: Service[] = [
  {
    id: '1',
    name: 'Premium Hair Styling with Products',
    description: 'Professional hair styling with premium products brought by our beautician',
    price: 15000,
    duration: 120,
    category: 'Hair',
    image: '/images/hair1.jpg',
    includesProducts: true,
    products: ['Professional Shampoo', 'Hair Color Kit', 'Styling Products', 'Hair Oil']
  },
  {
    id: '2',
    name: 'Bridal Makeup with Products',
    description: 'Complete bridal makeup service with professional cosmetics',
    price: 25000,
    duration: 180,
    category: 'Makeup',
    image: '/images/makeup1.jpg',
    includesProducts: true,
    products: ['Foundation Set', 'Eye Shadow Palette', 'Lipstick Collection', 'Setting Spray']
  },
  {
    id: '3',
    name: 'Nail Art with Products',
    description: 'Creative nail art with professional nail products',
    price: 8000,
    duration: 90,
    category: 'Nails',
    image: '/images/nail.jpg',
    includesProducts: true,
    products: ['Nail Polish Set', 'Nail Art Tools', 'Gel Polish', 'Top Coat']
  },
  {
    id: '4',
    name: 'Facial Treatment with Products',
    description: 'Rejuvenating facial with premium skincare products',
    price: 12000,
    duration: 90,
    category: 'Skincare',
    image: '/images/spa1.jpg',
    includesProducts: true,
    products: ['Cleanser', 'Exfoliant', 'Moisturizer', 'Face Mask']
  }
];

const mockServicesWithoutProducts: Service[] = [
  {
    id: '5',
    name: 'Hair Styling (Your Products)',
    description: 'Professional hair styling using your own products',
    price: 10000,
    duration: 90,
    category: 'Hair',
    image: '/images/hair2.jpg',
    includesProducts: false
  },
  {
    id: '6',
    name: 'Makeup Application (Your Products)',
    description: 'Professional makeup using your cosmetics',
    price: 15000,
    duration: 120,
    category: 'Makeup',
    image: '/images/makeup2.jpg',
    includesProducts: false
  },
  {
    id: '7',
    name: 'Manicure (Your Products)',
    description: 'Professional manicure using your nail products',
    price: 5000,
    duration: 60,
    category: 'Nails',
    image: '/images/nail.jpg',
    includesProducts: false
  },
  {
    id: '8',
    name: 'Basic Facial (Your Products)',
    description: 'Facial treatment using your skincare products',
    price: 8000,
    duration: 60,
    category: 'Skincare',
    image: '/images/spa1.jpg',
    includesProducts: false
  }
];

const mockBeauticians: Beautician[] = [
  {
    id: '1',
    name: 'Aaradhya Sharma',
    phone: '+91-9876543210',
    skills: ['Hair Styling', 'Makeup', 'Bridal Services'],
    rating: 4.8,
    experience: 5,
    isAvailable: true
  },
  {
    id: '2',
    name: 'Priya Patel',
    phone: '+91-9876543211',
    skills: ['Nail Art', 'Facial Treatments', 'Skincare'],
    rating: 4.9,
    experience: 7,
    isAvailable: true
  },
  {
    id: '3',
    name: 'Sneha Gupta',
    phone: '+91-9876543212',
    skills: ['Hair Coloring', 'Bridal Makeup', 'Event Styling'],
    rating: 4.7,
    experience: 4,
    isAvailable: true
  },
  {
    id: '4',
    name: 'Anita Singh',
    phone: '+91-9876543213',
    skills: ['Traditional Hair Styling', 'Mehendi', 'Bridal Services'],
    rating: 4.9,
    experience: 8,
    isAvailable: true
  }
];

// Mock bookings storage (in real app, this would be in database)
let mockBookings: Booking[] = [
  {
    id: '1',
    customerId: 'customer-1',
    serviceId: '1',
    serviceName: 'Premium Hair Styling with Products',
    status: 'pending_approval',
    paymentStatus: 'paid',
    scheduledDate: '2025-02-15',
    scheduledTime: '10:00 AM',
    totalAmount: 15000,
    customerDetails: {
      name: 'John Doe',
      phone: '+91-9876543210',
      address: '123 Main Street, City',
      notes: 'Please bring extra hair products'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// API Functions
export const getAtHomeServicesWithProducts = (): Service[] => {
  return mockServicesWithProducts;
};

export const getAtHomeServicesWithoutProducts = (): Service[] => {
  return mockServicesWithoutProducts;
};

export const getServiceById = (id: string): Service | undefined => {
  const allServices = [...mockServicesWithProducts, ...mockServicesWithoutProducts];
  return allServices.find(service => service.id === id);
};

export const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking => {
  const newBooking: Booking = {
    ...bookingData,
    id: `booking-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockBookings.push(newBooking);
  
  // Store in localStorage for persistence
  localStorage.setItem('mockBookings', JSON.stringify(mockBookings));
  
  return newBooking;
};

export const getManagerPendingBookings = (): Booking[] => {
  return mockBookings.filter(booking => booking.status === 'pending_approval');
};

export const updateBookingStatus = (bookingId: string, status: Booking['status'], beautician?: Beautician): Booking | null => {
  const bookingIndex = mockBookings.findIndex(booking => booking.id === bookingId);
  
  if (bookingIndex === -1) return null;
  
  const updatedBooking: Booking = {
    ...mockBookings[bookingIndex],
    status,
    updatedAt: new Date().toISOString()
  };
  
  if (beautician && status === 'confirmed') {
    updatedBooking.beautician = {
      id: beautician.id,
      name: beautician.name,
      phone: beautician.phone,
      arrivalTime: updatedBooking.scheduledTime,
      skills: beautician.skills
    };
  }
  
  mockBookings[bookingIndex] = updatedBooking;
  
  // Update localStorage
  localStorage.setItem('mockBookings', JSON.stringify(mockBookings));
  
  return updatedBooking;
};

export const getBookingsByCustomer = (customerId: string): Booking[] => {
  return mockBookings.filter(booking => booking.customerId === customerId);
};

export const getAvailableBeauticians = (): Beautician[] => {
  return mockBeauticians.filter(beautician => beautician.isAvailable);
};

export const assignBeauticianToBooking = (bookingId: string, beauticianId: string): Booking | null => {
  const booking = mockBookings.find(b => b.id === bookingId);
  const beautician = mockBeauticians.find(b => b.id === beauticianId);
  
  if (!booking || !beautician) return null;
  
  const updatedBooking: Booking = {
    ...booking,
    status: 'confirmed',
    beautician: {
      id: beautician.id,
      name: beautician.name,
      phone: beautician.phone,
      arrivalTime: booking.scheduledTime,
      skills: beautician.skills
    },
    updatedAt: new Date().toISOString()
  };
  
  const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
  mockBookings[bookingIndex] = updatedBooking;
  
  // Update localStorage
  localStorage.setItem('mockBookings', JSON.stringify(mockBookings));
  
  return updatedBooking;
};

// Initialize from localStorage if available
const initializeMockData = () => {
  const storedBookings = localStorage.getItem('mockBookings');
  if (storedBookings) {
    try {
      mockBookings = JSON.parse(storedBookings);
    } catch (error) {
      console.error('Error parsing stored bookings:', error);
    }
  }
};

// Initialize on module load
initializeMockData();
