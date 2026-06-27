import { Listing, User } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    fullName: 'Rahul Sharma',
    rollNumber: 'CS22B1045',
    mobileNumber: '+91 98765 43210',
    telegramUsername: 'rahulse',
    isBanned: false,
    isAdmin: false,
    createdAt: '2026-05-15T10:00:00Z',
  },
  {
    id: 'user_2',
    fullName: 'Priya Patel',
    rollNumber: 'EE23B1082',
    mobileNumber: '+91 87654 32109',
    telegramUsername: 'priya_ee',
    isBanned: false,
    isAdmin: false,
    createdAt: '2026-06-01T14:30:00Z',
  },
  {
    id: 'user_3',
    fullName: 'Amit Verma',
    rollNumber: 'ME21B1012',
    mobileNumber: '+91 76543 21098',
    telegramUsername: 'amit_v',
    isBanned: false,
    isAdmin: false,
    createdAt: '2026-06-10T09:15:00Z',
  },
  {
    id: 'admin_1',
    fullName: 'Campus Admin',
    rollNumber: 'ADMIN01',
    mobileNumber: '+91 99999 88888',
    telegramUsername: 'campus_admin',
    isBanned: false,
    isAdmin: true,
    createdAt: '2026-01-01T00:00:00Z',
  }
];

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'list_1',
    title: 'H.C. Verma Concepts of Physics (Vol 1 & 2)',
    description: 'Perfect condition. No markings or highlights. Highly recommended for JEE preparation and first-year physics courses.',
    price: 350,
    category: 'Books',
    type: 'sell',
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600'
    ],
    sellerId: 'user_1',
    sellerName: 'Rahul Sharma',
    sellerTelegram: 'rahulse',
    sellerMobile: '+91 98765 43210',
    isSold: false,
    createdAt: '2026-06-20T10:30:00Z',
  },
  {
    id: 'list_2',
    title: 'Sony WH-1000XM4 Noise Canceling Headphones',
    description: 'Looking to rent out for exam week. Active noise cancellation is incredible for long study sessions in the library. Comes with carrying case and AUX cable.',
    price: 150, // Per day or total
    category: 'Electronics',
    type: 'rent',
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600'
    ],
    sellerId: 'user_2',
    sellerName: 'Priya Patel',
    sellerTelegram: 'priya_ee',
    sellerMobile: '+91 87654 32109',
    isSold: false,
    createdAt: '2026-06-22T16:45:00Z',
  },
  {
    id: 'list_3',
    title: 'Decathlon Rockrider MTB Bicycle',
    description: '6-speed mountain bike, ideal for campus commute. Dual disk brakes, broad tires, front suspension. Serviced last month. Selling because I am graduating.',
    price: 4500,
    category: 'Cycle & Transport',
    type: 'sell',
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&q=80&w=600'
    ],
    sellerId: 'user_3',
    sellerName: 'Amit Verma',
    sellerTelegram: 'amit_v',
    sellerMobile: '+91 76543 21098',
    isSold: false,
    createdAt: '2026-06-24T08:00:00Z',
  },
  {
    id: 'list_4',
    title: 'Draughting Board & T-Square Ruler',
    description: 'A1 size engineering graphics drawing board with heavy-duty stand clamps, T-Square, and set squares. Used for exactly one semester in First Year Lab.',
    price: 600,
    category: 'Lab & Drawing',
    type: 'sell',
    condition: 'fair',
    images: [
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600'
    ],
    sellerId: 'user_1',
    sellerName: 'Rahul Sharma',
    sellerTelegram: 'rahulse',
    sellerMobile: '+91 98765 43210',
    isSold: false,
    createdAt: '2026-06-25T11:20:00Z',
  },
  {
    id: 'list_5',
    title: 'Bajaj 15L Study Room Air Cooler',
    description: 'Renting out for the hot summer months. Super quiet, excellent cooling performance, 3-speed control. Very low power consumption.',
    price: 300, // Monthly or weekly
    category: 'Hostel Essentials',
    type: 'rent',
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1618944913480-b67ee16d7b77?auto=format&fit=crop&q=80&w=600'
    ],
    sellerId: 'user_2',
    sellerName: 'Priya Patel',
    sellerTelegram: 'priya_ee',
    sellerMobile: '+91 87654 32109',
    isSold: false,
    createdAt: '2026-06-25T15:10:00Z',
  }
];
