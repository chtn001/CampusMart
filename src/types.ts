export interface User {
  id: string;
  fullName: string;
  rollNumber: string;
  mobileNumber: string;
  telegramUsername: string;
  isBanned: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair';
export type ListingType = 'sell' | 'rent';
export type ListingCategory = 'Books' | 'Electronics' | 'Cycle & Transport' | 'Lab & Drawing' | 'Hostel Essentials' | 'Clothing & Sports' | 'Others';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  type: ListingType;
  condition: ListingCondition;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerTelegram: string;
  sellerMobile?: string; // Visible only to admin
  isSold: boolean;
  createdAt: string;
}
