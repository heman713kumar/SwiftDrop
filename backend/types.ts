// File: backend/types.ts
// FINAL SHARED TYPE DEFINITIONS

import { DecodedIdToken } from 'firebase-admin/auth';
import { Request } from 'express';

// ===============================================
// === DATABASE INTERFACES (MUST BE EXPORTED) ====
// ===============================================

// NOTE: These interfaces are typically defined in db.ts and EXPORTED from there.
// If your current setup prevents importing DbUser/DbOrder into controllers, 
// we must define the final DTOs and required types here.

// Used in supportController and db.ts
export enum SupportTicketStatus {
    Open = 'Open',
    Pending = 'Pending',
    Closed = 'Closed',
}

export enum SupportTicketPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
}

// ===============================================
// === TYPES REQUIRED by db.ts (The Failing Imports) ===
// ===============================================

// FIX: Added missing LocationInfo properties (lat/lng) to match db.ts usage.
export interface LocationInfo {
    address: string;
    lat: number; 
    lng: number; 
}

// FIX: Added missing OrderDetails properties to match db.ts usage.
export interface PackageDetails {
    description: string;
    weight: string;
    recipientName: string;
    recipientPhoneNumber: string;
    specialInstructions: string | null;
}

// FIX: Added missing PriceBreakdown properties to match db.ts usage.
export interface PriceBreakdown {
    baseFare: number;
    serviceFee: number;
    tax: number;
    discount: number;
    total: number;
}

// FIX: Added OrderStatus type definition
export type OrderStatus = 'Placed' | 'Assigned' | 'On The Way' | 'Delivered' | 'Cancelled' | 'Completed';

// FIX: Added ServiceCategory type definition
export type ServiceCategory = 'Express' | 'Standard' | 'Truck';

// FIX: Added OrderDetails interface definition
export interface OrderDetails {
    serviceType: ServiceCategory;
    pickupLocation: LocationInfo;
    deliveryLocation: LocationInfo;
    packageDetails?: PackageDetails;
    priceBreakdown: PriceBreakdown;
}

// FIX: Added OrderHistoryItem interface definition
export interface OrderHistoryItem {
    id: string;
    date: string;
    serviceType: ServiceCategory;
    pickupAddress: string;
    deliveryAddress: string;
    totalPrice: number;
    status: OrderStatus;
}

// FIX: Added SupportTicketStatus and SupportTicketPriority exports (from enums above)
// FIX: Added SupportMessage interface definition
export interface SupportMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderType: 'customer' | 'agent';
    message: string;
    timestamp: string; 
}

// FIX: Added SupportTicket interface definition
export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    description: string;
    status: SupportTicketStatus;
    priority: SupportTicketPriority;
    createdAt: string; 
    updatedAt: string; 
    messages: SupportMessage[];
}

// FIX: Added FaqItem interface definition
export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

// NEW: Missing from db.ts import list, but used in other controllers/db code
export interface UserProfile {
    fullName: string;
    email: string;
    photo: string | null;
    notificationPreferences: NotificationPreferences;
}

export interface UserStats {
    totalOrders: number;
    totalSpent: number;
    averageRatingGiven: number | null;
    lastOrderDate: string | null;
}

export interface NotificationPreferences {
    orderUpdates: boolean;
    promotions: boolean;
    push_enabled?: boolean;
    sms_enabled?: boolean;
    email_enabled?: boolean;
    whatsapp_enabled?: boolean;
    quiet_hours_start?: string | null;
    quiet_hours_end?: string | null;
}

// --- REQUEST MIDDLEWARE TYPES ---

export interface AuthenticatedRequest extends Request {
    user?: { id: string; [key: string]: any }; 
}

export interface FirebaseAuthenticatedRequest extends Request {
    firebaseUser?: DecodedIdToken;
}

// (The remaining missing types from db.ts's import line, like DbUser, DbOrder, etc., 
// are now correctly defined inside db.ts and EXPORTED from there, or are defined above.)