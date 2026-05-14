export type Locale = "en" | "ar";
export type UserRole = "customer" | "restaurant_staff" | "delivery_staff" | "admin";

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  restaurantId?: string;
}

export interface Restaurant {
  id?: string;
  _id?: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  coverImage: string;
  logo: string;
  cuisines: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  priceLevel: number;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  supportsDelivery: boolean;
  supportsPickup: boolean;
  address: string;
}

export interface MenuCategory {
  id?: string;
  _id?: string;
  restaurantId: string;
  name: string;
  nameAr?: string;
  sortOrder: number;
}

export interface MenuItem {
  id?: string;
  _id?: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  calories: number;
}

export interface Order {
  id?: string;
  _id?: string;
  status: string;
  fulfillmentType: "delivery" | "pickup";
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  items: Array<{ menuItemId: string; name: string; quantity: number; unitPrice: number }>;
  timeline: string[];
  createdAt: string;
}
