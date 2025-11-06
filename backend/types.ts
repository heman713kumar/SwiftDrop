// File: backend/types.ts
// FINAL SHARED TYPE DEFINITIONS (Comprehensive Version)

import { DecodedIdToken } from 'firebase-admin/auth';
import { Request } from 'express';

// ===============================================
// === ENUMS & SIMPLE TYPES ======================
// ===============================================

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

export type OrderStatus = 'Placed' | 'Assigned' | 'On The Way' | 'Delivered' | 'Cancelled' | 'Completed';
export type ServiceCategory = 'Express' | 'Standard' | 'Truck';


// ===============================================
// === DATABASE INTERFACES (Used Everywhere) =====
// ===============================================

// DbUser and DbOrder are needed by controllers and db.ts, so they live here.
export interface DbUser {
    id: string;
    phone: string | null;
    email: string;
    name: string;
    password_hash: string | null;
    profile_photo_url: string | null;
    auth_provider: 'phone' | 'google';
    google_id: string | null;
    phone_verified: boolean;
    status: 'active' | 'deactivated';
    created_at: Date;
    updated_at: Date;
}

export interface DbOrder {
    id: string;
    customer_id: string;
    partner_id: string | null;
    pickup_location: LocationInfo;
    delivery_location: LocationInfo;
    service_type: ServiceCategory;
    package_description: string | null;
    weight: string | null;
    special_instructions: string | null;
    recipient_phone: string | null;
    price_breakdown: PriceBreakdown;
    status: OrderStatus;
    created_at: Date;
    updated_at: Date;
}

// These interfaces (and all others below) are now guaranteed to be exported.

export interface DbMedia {
    id: string;
    user_id: string;
    file_type: 'profile_photo' | 'package_photo';
    file_name: string;
    url: string;
    created_at: Date;
}

export interface DbUserSettings {
    user_id: string;
    language: string;
    theme: 'light' | 'dark' | 'system';
    default_payment_method: string | null;
    default_address_id: string | null;
}

export interface DbPrivacySettings {
    user_id: string;
    share_location: boolean;
    data_collection_consent: boolean;
}

export interface DbOrderTracking {
    id: string;
    order_id: string;
    latitude: number;
    longitude: number;
    status: string;
    // FIX: Changed from Date to string to match the .toISOString() usage in orderController.ts
    timestamp: Date; 
}

export interface DbOrderRating {
    id: string;
    order_id: string;
    customer_id: string;
    partner_id: string;
    rating: number;
    review: string | null;
    created_at: Date;
}

export interface DbOrderDispute {
    id: string;
    order_id: string;
    customer_id: string;
    reason: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved';
    created_at: Date;
    resolved_at: Date | null;
}

export interface DbPartner {
    id: string;
    name: string;
    phone: string;
    vehicle_type: 'Motorbike' | 'Van' | 'Truck';
    current_latitude: number;
    current_longitude: number;
    is_available: boolean;
    rating: number;
    total_deliveries: number;
}

export interface DbPartnerAvailability {
    partner_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
}

export interface DbChatMessage {
    id: string;
    order_id: string;
    sender_id: string;
    sender_type: 'customer' | 'partner';
    message: string;
    timestamp: Date;
    read_at: Date | null;
}

export interface DbCallLog {
    id: string;
    order_id: string;
    caller_id: string;
    receiver_id: string;
    duration: number;
    timestamp: Date;
}

export interface DbDeviceToken {
    id: string;
    user_id: string;
    token: string;
    platform: 'web' | 'ios' | 'android';
    created_at: Date;
}

export interface DbNotificationLog {
    id: string;
    user_id: string;
    type: 'order_status' | 'promotion' | 'account' | 'chat_message';
    title: string;
    body: string;
    sent_at: Date;
    read_at: Date | null;
}

export interface DbEventLog {
    id: string;
    user_id: string;
    event_type: string;
    event_data: object;
    timestamp: Date;
}

export interface DbUserAnalytics {
    user_id: string;
    total_orders: number;
    total_spent: number;
    average_rating_given: number | null;
    last_order_at: Date | null;
}

export interface DbSupportTicket {
    id: string;
    user_id: string;
    subject: string;
    description: string;
    status: SupportTicketStatus;
    priority: SupportTicketPriority;
    created_at: Date;
    updated_at: Date;
}

export interface DbNotificationPreferences {
    user_id: string;
    orderUpdates: boolean;
    promotions: boolean;
    push_enabled: boolean;
    sms_enabled: boolean;
    email_enabled: boolean;
    whatsapp_enabled: boolean;
    quiet_hours_start: string | null;
    quiet_hours_end: string | null;
}

export interface DbSupportMessage {
    id: string;
    ticket_id: string;
    sender_id: string;
    sender_type: 'customer' | 'agent';
    message: string;
    timestamp: Date;
}

export interface OrderDetails {
    serviceType: ServiceCategory;
    pickupLocation: LocationInfo;
    deliveryLocation: LocationInfo;
    packageDetails?: PackageDetails;
    priceBreakdown: PriceBreakdown;
}

export interface PublicRating {
    reviewerName: string;
    rating: number;
    review: string | null;
    date: string;
}

export interface SupportTicket {
    id: string;
    // FIX: Using lowercase to map directly to the DB entity property
    user_id: string; 
    subject: string;
    senderType: 'customer' | 'agent';
    message: string;
    // FIX D: Change type to string to match toISOString() usage in controller
    timestamp: string; 
}

// ===============================================
// === DTOs and Primitives (Used by db.ts imports) ===
// ===============================================

export interface LocationInfo {
    address: string;
    lat: number;
    lng: number;
}

export interface PackageDetails {
    description: string;
    weight: string;
    recipientName: string;
    recipientPhoneNumber: string;
    specialInstructions: string | null;
}

export interface PriceBreakdown {
    baseFare: number;
    serviceFee: number;
    tax: number;
    discount: number;
    total: number;
}

export interface UserProfile {
    fullName: string;
    email: string;
    photo: string | null;
    // FIX E: Corrected name to the actual interface name
    notificationPreferences: DbNotificationPreferences; 
}

export interface SupportTicketDTO {
    id: string;
    user_id: string;
    subject: string;
    description: string;
    status: SupportTicketStatus;
    priority: SupportTicketPriority;
    created_at: string; // ISO string for DTO
    updated_at: string; // ISO string for DTO
    messages?: SupportMessageDTO[];
}

export interface SupportMessageDTO {
    id: string;
    ticketId: string;
    senderId: string;
    senderType: 'customer' | 'agent';
    message: string;
    timestamp: string; // ISO string for DTO
}

export interface OrderHistoryItem {
    id: string;
    date: string;
    serviceType: ServiceCategory;
    pickupAddress: string;
    deliveryAddress: string;
    totalPrice: number;
    status: OrderStatus;
}

export interface UserProfile {
    fullName: string;
    email: string;
    photo: string | null;
    // FIX E: Corrected name to match the exported type name
    notificationPreferences: DbNotificationPreferences;
}

export interface UserStats {
    totalOrders: number;
    totalSpent: number;
    averageRatingGiven: number | null;
    lastOrderDate: string | null;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export interface AuthenticatedRequest extends Request {
    user?: { id: string; [key: string]: any };
}

export interface FirebaseAuthenticatedRequest extends Request {
    firebaseUser?: DecodedIdToken;
}