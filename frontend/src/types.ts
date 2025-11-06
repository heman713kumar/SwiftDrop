// FIX: Import React to make React types like `React.ComponentType` available.
import React from 'react';

export enum ServiceCategory {
  Food = 'Food & Restaurant',
  Grocery = 'Grocery & Supermarket',
  Pharmacy = 'Pharmacy & Medical',
  Package = 'Package & Parcel',
  Document = 'Document',
  Heavy = 'Heavy Items',
  Moving = 'House Moving',
  BusinessLogistics = 'Business Logistics',
}

export interface ServiceType {
  category: ServiceCategory;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface LocationInfo {
  address: string;
  lat?: number;
  lng?: number;
  validated?: boolean;
}

export interface PackageDetails {
  description: string;
  weight: string;
  photo?: File;
  specialInstructions: string;
  declaredValue?: number;
  recipientPhoneNumber?: string;
}

// New types for the store selection flow
export interface Store {
    id: string;
    name: string;
    cuisine: string;
    rating: number;
    imageUrl: string;
    address: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
}

export enum PaymentMethod {
  MobileMoney = 'Mobile Money',
  CashOnDelivery = 'Cash on Delivery',
  CashOnPickup = 'Cash on Pickup',
  BankTransfer = 'Bank Transfer',
  CorporateAccount = 'Corporate Account',
}

export enum DeliveryTier {
    Express = 'Express',
    SameDay = 'Same-Day',
    Scheduled = 'Scheduled',
    Economy = 'Economy',
}

export interface PriceBreakdown {
    baseFare: number;
    distanceFee: number;
    weightFee: number;
    tierSurcharge: number;
    serviceFee: number;
    subtotal: number;
    total: number;
}

export enum PropertyType {
    Apartment = 'Apartment',
    House = 'House',
    Office = 'Office',
}

export interface MovingDetails {
    propertyType: PropertyType;
    propertySize: string; 
    pickupFloor: string;
    pickupElevator: boolean;
    deliveryFloor: string;
    deliveryElevator: boolean;
    packingRequired: boolean;
    assemblyRequired: boolean;
    largeItems: string;
    estimatedBoxes: string;
}

export enum VehicleType {
    SmallVan = 'Small Van',
    MediumTruck = 'Medium Truck (7-ton)',
    LargeTruck = 'Large Truck (14-ton)',
}

export enum TripType {
    OneWay = 'One-Way',
    RoundTrip = 'Round-Trip',
}

export interface BusinessLogisticsDetails {
    businessName: string;
    contactPerson: string;
    goodsType: string;
    vehicleType: VehicleType;
    loadingAssistance: boolean;
    tripType: TripType;
    deliveryNotes: string;
}

export interface OrderDetails {
  serviceType: ServiceCategory | null;
  pickupLocation: LocationInfo | null;
  deliveryLocation: LocationInfo | null;
  packageDetails: PackageDetails | null;
  movingDetails?: MovingDetails | null;
  businessLogisticsDetails?: BusinessLogisticsDetails | null;
  // Fields for the food/grocery flow
  store?: Store | null;
  cart?: CartItem[];
  // Field for scheduled delivery
  schedule?: Date | null;
  deliveryTier?: DeliveryTier | null;
  priceBreakdown?: PriceBreakdown | null;
  // Fields for payment
  paymentMethod?: PaymentMethod | null;
  paymentPhoneNumber?: string | null;
}

export interface UserProfile {
  fullName: string;
  email: string;
  photo?: File | string | null;
  notificationPreferences: {
    orderUpdates: boolean;
    promotions: boolean;
  };
}

export enum AppStep {
  LOGIN,
  OTP_VERIFICATION,
  EMAIL_REGISTRATION,
  SERVICE_SELECTION,
  STORE_SELECTION,
  MENU_SELECTION,
  LOCATION_INPUT,
  PACKAGE_DETAILS,
  MOVING_DETAILS,
  BUSINESS_LOGISTICS_DETAILS,
  CONFIRMATION,
  TRACKING,
  ORDER_HISTORY,
  SETTINGS,
  ORDER_DETAILS,
}

export interface MapSuggestion {
  title: string;
  uri: string;
}

export type OrderStatus = 'Completed' | 'Placed' | 'Assigned' | 'On The Way' | 'Delivered' | 'Cancelled';

export interface OrderHistoryItem {
  id: string;
  date: string;
  serviceType: ServiceCategory;
  pickupAddress: string;
  deliveryAddress: string;
  totalPrice: number;
  status: OrderStatus;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: UserProfile;
  isNewUser: boolean;
}

export interface TrackingPoint {
    latitude: number;
    longitude: number;
    status: string;
    timestamp: string;
}

export interface TrackingData {
    orderId: string;
    status: OrderStatus;
    rider: {
        name: string;
        vehicle: string;
    };
    history: TrackingPoint[];
}

// UPDATED: For Analytics Service to match new DB table
export interface UserStats {
    totalOrders: number;
    totalSpent: number;
    averageRatingGiven: number | null;
    lastOrderDate: string | null;
}

// NEW: Support & Help Service
export enum SupportTicketStatus {
    Open = 'Open',
    InProgress = 'In Progress',
    Closed = 'Closed',
}

export enum SupportTicketPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Urgent = 'Urgent',
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export interface SupportMessage {
    id: string;
    ticketId: string;
    senderId: string; // 'user' for customer, or a support agent ID
    senderType: 'customer' | 'agent';
    message: string;
    timestamp: string;
}

export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    description: string;
    status: SupportTicketStatus;
    priority: SupportTicketPriority;
    createdAt: string;
    updatedAt: string;
    messages?: SupportMessage[]; // Optionally included
}