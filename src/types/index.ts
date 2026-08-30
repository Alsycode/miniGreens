// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  images: any[];
  unit: string;
  weight: string;
  nutrition: NutritionInfo;
  benefits: string[];
  ingredients?: string[];
  storage: string;
  consumptionTips: string[];
  isFeatured: boolean;
  isSeasonal: boolean;
  isBestSeller: boolean;
  isPreorder: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
}

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  vitamins: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  productCount: number;
  color: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  ctaLink: string;
  textColor: string;
  gradientStart: string;
  gradientEnd: string;
}

export interface ArticleBlock {
  /** Optional sub-heading rendered above the paragraph. */
  heading?: string;
  /** Body copy for this block. */
  body: string;
}

export interface LifestyleArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
  author: string;
  publishedAt: string;
  /** Full article body, rendered block by block in the reader. */
  content: ArticleBlock[];
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  role: string;
  content: string;
  rating: number;
}

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  deliveryFrequency: string;
  items: string[];
  benefits: string[];
  isPopular: boolean;
  color: string;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  deliveryFee: number;
  deliveryAddress: Address;
  deliveryDate: string;
  deliveryTime: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  dateOfBirth: string;
  preferences: string[];
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'recent';
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Navigation Types
export type RootTabParamList = {
  home: undefined;
  explore: undefined;
  subscriptions: undefined;
  orders: undefined;
  profile: undefined;
};
