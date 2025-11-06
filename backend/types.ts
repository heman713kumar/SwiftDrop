// File: backend/types.ts
// Shared Type Definitions for the Backend Application

import { DecodedIdToken } from 'firebase-admin/auth';

// --- DATABASE TYPES (USED INTERNALLY BY DB MOCK) ---

export interface DbUser {
    id: string;
    phone: string | null;
    email: string;
    name: string;
    profile_photo_url: string | null;
    auth_provider: 'google' | 'phone';
    google_id: string | null;
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
    password_hash: string | null;
}

export interface DbOrder {
    id: string;
    customer_id: string;
    partner_id: string | null;
    status: 'Placed' | 'Assigned' | 'On The Way' | 'Delivered' | 'Cancelled' | 'Completed';
    service_type: string;
    pickup_location: { lat: number, lng: number };
    delivery_location: { lat: number, lng: number };
    price_breakdown: any;
    created_at: Date;
}

// --- CONTROLLER DTOs (Data Transfer Objects) ---

// Used in userController and authController
export interface UserProfile {
    fullName: string;
    email: string;
    photo: string | null;
    notificationPreferences: NotificationPreferences;
}

// Used in analyticsController
export interface UserStats {
    totalOrders: number;
    totalSpent: number;
    averageRatingGiven: number | null;
    lastOrderDate: string | null;
}

// Used in orderController (for tracking history)
export interface TrackingPoint {
    latitude: number;
    longitude: number;
    status: string;
    timestamp: string;
}

// Used in supportController
export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    description: string;
    status: 'Open' | 'Pending' | 'Closed';
    priority: 'Low' | 'Medium' | 'High';
    createdAt: string;
    updatedAt: string;
    messages: SupportMessage[];
}

export interface SupportMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderType: 'customer' | 'agent';
    message: string;
    timestamp: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

// --- AUTH & NOTIFICATION ---

// Used in middleware/auth.ts and controllers
export interface AuthenticatedRequest extends Request {
    user?: DbUser;
}

export interface FirebaseAuthenticatedRequest extends Request {
    firebaseUser?: DecodedIdToken;
}

export interface NotificationPreferences {
    orderUpdates: boolean;
    promotions: boolean;
}

// Add any other types your application requires here!