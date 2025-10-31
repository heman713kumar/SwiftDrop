import { v4 as uuidv4 } from 'uuid';
import { UserProfile, OrderDetails, ServiceCategory, LocationInfo, PackageDetails, PriceBreakdown, OrderStatus, OrderHistoryItem, UserStats, SupportTicketStatus, SupportTicketPriority, FaqItem, SupportTicket, SupportMessage } from '../types';

// ===================================================================================
// == PRODUCTION DATABASE ARCHITECTURE NOTE
// ===================================================================================
// This file simulates a database using in-memory Maps for demonstration purposes.
// In a production environment, this would be replaced by a robust, multi-service
// data layer:
//
// 1. PostgreSQL (Primary Database):
//    - Used for persistent, relational data that requires ACID compliance.
//    - Connection pooling would be essential for managing connections efficiently.
//    - Tables would include: users, orders, partners, media, chat_messages, etc.
//
// 2. Redis (Caching & Volatile Data):
//    - Used for high-speed, temporary data storage to reduce load on PostgreSQL.
//    - Ideal for:
//        - Caching frequently accessed, non-critical data.
//        - Storing session information (like active refresh tokens).
//        - Managing short-lived data (like OTP codes).
//        - Pub/Sub for real-time notifications and WebSocket events.
//        - Storing JWT blacklists for quick invalidation checks.
//
// Below, data stores are marked with `[PostgreSQL]` or `[Redis]` to indicate
// where they would reside in a production architecture.
// ===================================================================================


// --- DATABASE TABLE INTERFACES ---

export interface DbUser {
    id: string;
    phone: string | null;
    email: string;
    name: string;
    password_hash: string | null; // For password-based auth
    profile_photo_url: string | null;
    auth_provider: 'phone' | 'google';
    google_id: string | null;
    phone_verified: boolean;
    status: 'active' | 'deactivated';
    created_at: Date;
    updated_at: Date;
}

// NEW: Media Table
interface DbMedia {
    id: string;
    user_id: string;
    file_type: 'profile_photo' | 'package_photo';
    file_name: string;
    url: string; // In a real app, this would be a URL to S3, GCS, etc.
    created_at: Date;
}

// NEW: User Settings Table
interface DbUserSettings {
    user_id: string;
    language: string; // e.g., 'en', 'tw'
    theme: 'light' | 'dark' | 'system';
    default_payment_method: string | null;
    default_address_id: string | null; // Assuming address book feature in future
}

// NEW: Privacy Settings Table
interface DbPrivacySettings {
    user_id: string;
    share_location: boolean;
    data_collection_consent: boolean;
}


// NEW: Notification Preferences Table
interface DbNotificationPreferences {
    user_id: string;
    // FIX: Added missing properties to align with UserProfile type.
    orderUpdates: boolean;
    promotions: boolean;
    push_enabled: boolean;
    sms_enabled: boolean;
    email_enabled: boolean;
    whatsapp_enabled: boolean;
    quiet_hours_start: string | null; // "HH:MM"
    quiet_hours_end: string | null;   // "HH:MM"
}

interface DbOrder {
    id: string;
    customer_id: string;
    partner_id: string | null; // NEW: To link a delivery partner
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

interface DbOrderTracking {
    id: string;
    order_id: string;
    latitude: number;
    longitude: number;
    status: string;
    timestamp: Date;
}

interface DbOrderRating {
    id: string;
    order_id: string;
    customer_id: string;
    partner_id: string;
    rating: number;
    review: string | null;
    created_at: Date;
}

// NEW: For public-facing rating data
export interface PublicRating {
    reviewerName: string;
    rating: number;
    review: string | null;
    date: string;
}

interface DbOrderDispute {
    id: string;
    order_id: string;
    customer_id: string;
    reason: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved';
    created_at: Date;
    resolved_at: Date | null;
}

// NEW: Delivery Partner Interface
interface DbPartner {
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

// NEW: Partner Availability Interface
interface DbPartnerAvailability {
    partner_id: string;
    day_of_week: number; // 0 for Sunday, 1 for Monday, etc.
    start_time: string;  // "HH:MM" format (24-hour)
    end_time: string;    // "HH:MM" format (24-hour)
}

// NEW: Chat Message Interface
interface DbChatMessage {
    id: string;
    order_id: string;
    sender_id: string; // Can be a customer or partner ID
    sender_type: 'customer' | 'partner';
    message: string;
    timestamp: Date;
    read_at: Date | null;
}

// NEW: Call Log Interface
interface DbCallLog {
    id: string;
    order_id: string;
    caller_id: string;
    receiver_id: string;
    duration: number; // in seconds
    timestamp: Date;
}

// UPDATED: Device Token Interface
interface DbDeviceToken {
    id: string;
    user_id: string;
    token: string; // The FCM or other push service token
    platform: 'web' | 'ios' | 'android'; // NEW
    created_at: Date;
}

// UPDATED: Notification Log Interface
interface DbNotificationLog {
    id: string;
    user_id: string;
    type: 'order_status' | 'promotion' | 'account' | 'chat_message'; // NEW
    title: string;
    body: string;
    sent_at: Date; // RENAMED from created_at
    read_at: Date | null; // UPDATED from boolean
}

// NEW: Event Log Interface (replaces AnalyticsEvent)
interface DbEventLog {
    id: string;
    user_id: string;
    event_type: string;
    event_data: object;
    timestamp: Date;
}

// NEW: User Analytics Interface
interface DbUserAnalytics {
    user_id: string;
    total_orders: number;
    total_spent: number;
    average_rating_given: number | null;
    last_order_at: Date | null;
}

// NEW: Support Ticket Interface
interface DbSupportTicket {
    id: string;
    user_id: string;
    subject: string;
    description: string;
    status: SupportTicketStatus;
    priority: SupportTicketPriority;
    created_at: Date;
    updated_at: Date;
}

// NEW: Support Message Interface
interface DbSupportMessage {
    id: string;
    ticket_id: string;
    sender_id: string; // user_id or 'agent_id'
    sender_type: 'customer' | 'agent';
    message: string;
    timestamp: Date;
}


// --- IN-MEMORY DATA STORES ("TABLES") ---

// [PostgreSQL] Core relational data
const users = new Map<string, DbUser>();
const media = new Map<string, DbMedia>();
const usersByPhone = new Map<string, DbUser>();
const usersByEmail = new Map<string, DbUser>();
const usersByGoogleId = new Map<string, DbUser>();
const userSettings = new Map<string, DbUserSettings>();
const privacySettings = new Map<string, DbPrivacySettings>();
const orders = new Map<string, DbOrder>();
const ordersByCustomerId = new Map<string, DbOrder[]>();
const orderTracking = new Map<string, DbOrderTracking[]>();
const orderRatings = new Map<string, DbOrderRating>();
const orderDisputes = new Map<string, DbOrderDispute>();
const partners = new Map<string, DbPartner>();
const ratingsByPartnerId = new Map<string, DbOrderRating[]>();
const ratingsByCustomerId = new Map<string, DbOrderRating[]>();
const partnerAvailability = new Map<string, DbPartnerAvailability[]>();
const chatMessages = new Map<string, DbChatMessage[]>();
const callLogs = new Map<string, DbCallLog[]>();
const deviceTokensByUser = new Map<string, DbDeviceToken[]>();
const notificationPreferences = new Map<string, DbNotificationPreferences>();
const notificationLogsByUser = new Map<string, DbNotificationLog[]>();
const eventLogsByUser = new Map<string, DbEventLog[]>();
const userAnalytics = new Map<string, DbUserAnalytics>();
const supportTickets = new Map<string, DbSupportTicket>();
const supportTicketsByUserId = new Map<string, DbSupportTicket[]>();
const supportMessagesByTicketId = new Map<string, DbSupportMessage[]>();
const faqItems: FaqItem[] = [];

// [Redis] Volatile/Cached data
const jwtBlacklist = new Map<string, number>(); // Stores token -> expiry timestamp
const activeRefreshTokens = new Map<string, string>(); // refreshToken -> userId


// --- DATABASE FUNCTIONS ---

// JWT Blacklist Management (simulates Redis)
export const addToBlacklist = (token: string, expiresAt: number) => {
    jwtBlacklist.set(token, expiresAt);
};
export const isBlacklisted = (token: string): boolean => {
    return jwtBlacklist.has(token);
};
// Periodically clean up expired tokens from blacklist (can be a cron job in real app)
setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    for (const [token, expiry] of jwtBlacklist.entries()) {
        if (expiry < now) {
            jwtBlacklist.delete(token);
        }
    }
}, 60 * 1000);

// Active Refresh Token Management
export const addRefreshToken = (token: string, userId: string) => {
    activeRefreshTokens.set(token, userId);
};
export const findUserByRefreshToken = (token: string): string | undefined => {
    return activeRefreshTokens.get(token);
};
export const deleteRefreshToken = (token: string) => {
    activeRefreshTokens.delete(token);
};


// User Management
export const findUserById = (id: string): DbUser | undefined => users.get(id);
export const findUserByPhone = (phone: string): DbUser | undefined => usersByPhone.get(phone);
export const findUserByEmail = (email: string): DbUser | undefined => usersByEmail.get(email);
export const findUserByGoogleId = (googleId: string): DbUser | undefined => usersByGoogleId.get(googleId);

export const createUser = (details: { phone?: string | null; name: string; email: string; photoUrl?: string | null; authProvider: 'phone' | 'google', googleId?: string | null, phone_verified?: boolean }): DbUser => {
    const newUser: DbUser = {
        id: `user_${uuidv4()}`,
        phone: details.phone || null,
        name: details.name,
        email: details.email,
        password_hash: null,
        profile_photo_url: details.photoUrl || null,
        auth_provider: details.authProvider,
        google_id: details.googleId || null,
        phone_verified: details.phone_verified ?? (details.authProvider === 'phone' && !!details.phone),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
    };
    users.set(newUser.id, newUser);
    if (newUser.phone) usersByPhone.set(newUser.phone, newUser);
    usersByEmail.set(newUser.email, newUser);
    if (newUser.google_id) usersByGoogleId.set(newUser.google_id, newUser);
    
    // Create default notification preferences for the new user
    const defaultNotifPrefs: DbNotificationPreferences = {
        user_id: newUser.id,
        orderUpdates: true,
        promotions: true,
        push_enabled: true,
        sms_enabled: true,
        email_enabled: true,
        whatsapp_enabled: false,
        quiet_hours_start: null,
        quiet_hours_end: null,
    };
    notificationPreferences.set(newUser.id, defaultNotifPrefs);

    // Create default user settings
    const defaultUserSettings: DbUserSettings = {
        user_id: newUser.id,
        language: 'en',
        theme: 'system',
        default_payment_method: null,
        default_address_id: null,
    };
    userSettings.set(newUser.id, defaultUserSettings);

    // Create default privacy settings
    const defaultPrivacySettings: DbPrivacySettings = {
        user_id: newUser.id,
        share_location: true,
        data_collection_consent: true,
    };
    privacySettings.set(newUser.id, defaultPrivacySettings);
    
    // NEW: Initialize user analytics record
    initializeUserAnalytics(newUser.id);
    
    return newUser;
};

export const linkGoogleAccount = (userId: string, googleId: string): DbUser | undefined => {
    const user = users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = {
        ...user,
        google_id: googleId,
        updated_at: new Date(),
    };

    users.set(userId, updatedUser);
    usersByGoogleId.set(googleId, updatedUser);
    return updatedUser;
};

export const linkPhoneNumber = (userId: string, phone: string): DbUser | undefined => {
    const user = users.get(userId);
    // Can't link if user doesn't exist or already has a phone number
    if (!user || user.phone) return undefined; 

    const updatedUser = {
        ...user,
        phone: phone,
        phone_verified: true, // They just verified via OTP to get here
        updated_at: new Date(),
    };
    
    users.set(userId, updatedUser);
    usersByPhone.set(phone, updatedUser); // Add to the phone lookup map
    return updatedUser;
}

export const updateUser = (id: string, updates: Partial<Pick<DbUser, 'name' | 'email' | 'profile_photo_url'>>): DbUser | undefined => {
    const user = users.get(id);
    if (!user) return undefined;
    
    const updatedUser: DbUser = {
        ...user,
        name: updates.name ?? user.name,
        email: updates.email ?? user.email,
        profile_photo_url: updates.profile_photo_url !== undefined ? updates.profile_photo_url : user.profile_photo_url,
        updated_at: new Date(),
    };
    users.set(id, updatedUser);
    if (user.phone) usersByPhone.set(user.phone, updatedUser);
    usersByEmail.set(user.email, updatedUser);
    if (user.google_id) usersByGoogleId.set(user.google_id, updatedUser);
    return updatedUser;
};

// NEW: Deactivate a user account
export const deactivateUser = (id: string): DbUser | undefined => {
    const user = users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, status: 'deactivated' as const, updated_at: new Date() };
    users.set(id, updatedUser);

    // Also remove any active refresh tokens for this user
    for (const [token, userId] of activeRefreshTokens.entries()) {
        if (userId === id) {
            activeRefreshTokens.delete(token);
        }
    }
    
    return updatedUser;
};

export const updateUserPassword = (id: string, password_hash: string): DbUser | undefined => {
    const user = users.get(id);
    if (!user) return undefined;

    const updatedUser = {
        ...user,
        password_hash,
        updated_at: new Date(),
    };
    users.set(id, updatedUser);
    return updatedUser;
};

export const deleteUser = (id: string): boolean => {
    const user = users.get(id);
    if (!user) return false;
    
    if (user.phone) usersByPhone.delete(user.phone);
    if (user.email) usersByEmail.delete(user.email);
    if (user.google_id) usersByGoogleId.delete(user.google_id);
    users.delete(id);
    ordersByCustomerId.delete(id);
    notificationPreferences.delete(id);
    userSettings.delete(id); // NEW
    privacySettings.delete(id); // NEW
    userAnalytics.delete(id); // NEW
    
    // Also remove any active refresh tokens for this user
    for (const [token, userId] of activeRefreshTokens.entries()) {
        if (userId === id) {
            activeRefreshTokens.delete(token);
        }
    }

    return true;
};

// Order Management
export const createOrder = (userId: string, details: OrderDetails): DbOrder => {
    const newOrder: DbOrder = {
        id: `order_${uuidv4()}`,
        customer_id: userId,
        partner_id: null,
        pickup_location: details.pickupLocation!,
        delivery_location: details.deliveryLocation!,
        service_type: details.serviceType!,
        package_description: details.packageDetails?.description || null,
        weight: details.packageDetails?.weight || null,
        special_instructions: details.packageDetails?.specialInstructions || null,
        recipient_phone: details.packageDetails?.recipientPhoneNumber || null,
        price_breakdown: details.priceBreakdown!,
        status: 'Placed',
        created_at: new Date(),
        updated_at: new Date(),
    };
    orders.set(newOrder.id, newOrder);
    if (!ordersByCustomerId.has(userId)) {
        ordersByCustomerId.set(userId, []);
    }
    ordersByCustomerId.get(userId)!.push(newOrder);
    
    // NEW: Update user analytics
    updateUserAnalyticsOnOrder(userId, newOrder);
    
    return newOrder;
};

export const findOrdersByUserId = (userId: string): OrderHistoryItem[] => {
    const userOrders = ordersByCustomerId.get(userId) || [];
    return userOrders
        .map(order => ({
            id: order.id,
            date: order.created_at.toISOString(),
            serviceType: order.service_type,
            pickupAddress: order.pickup_location.address,
            deliveryAddress: order.delivery_location.address,
            totalPrice: order.price_breakdown.total,
            status: order.status,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const findOrderById = (orderId: string): DbOrder | undefined => {
    return orders.get(orderId);
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): DbOrder | undefined => {
    const order = orders.get(orderId);
    if (!order) return undefined;
    order.status = status;
    order.updated_at = new Date();
    
    // Create a notification for the status update
    createNotificationLog(
        order.customer_id, 
        'order_status',
        `Order #${order.id.slice(6, 10)} Update`, 
        `Your order status has been updated to: ${status}`
    );

    return order;
};

export const findActiveOrders = (): DbOrder[] => {
    const active: DbOrder[] = [];
    for (const order of orders.values()) {
        if (order.status === 'Assigned' || order.status === 'On The Way') {
            active.push(order);
        }
    }
    return active;
};

// Order Tracking
export const addOrderTrackingEvent = (orderId: string, latitude: number, longitude: number, status: string) => {
    const newEvent: DbOrderTracking = {
        id: `track_${uuidv4()}`,
        order_id: orderId,
        latitude,
        longitude,
        status,
        timestamp: new Date(),
    };
    if (!orderTracking.has(orderId)) {
        orderTracking.set(orderId, []);
    }
    orderTracking.get(orderId)!.push(newEvent);
};

export const findOrderTrackingHistory = (orderId: string): DbOrderTracking[] => {
    return orderTracking.get(orderId) || [];
};

// Order Rating
export const createOrderRating = (orderId: string, customerId: string, partnerId: string, rating: number, review: string | null): DbOrderRating => {
    const newRating: DbOrderRating = {
        id: `rating_${uuidv4()}`,
        order_id: orderId,
        customer_id: customerId,
        partner_id: partnerId,
        rating,
        review,
        created_at: new Date(),
    };
    orderRatings.set(orderId, newRating);

    // Add to the partner-indexed map
    if (!ratingsByPartnerId.has(partnerId)) {
        ratingsByPartnerId.set(partnerId, []);
    }
    ratingsByPartnerId.get(partnerId)!.push(newRating);

    // NEW: Add to the customer-indexed map for analytics
    if (!ratingsByCustomerId.has(customerId)) {
        ratingsByCustomerId.set(customerId, []);
    }
    ratingsByCustomerId.get(customerId)!.push(newRating);
    
    // NEW: Update user analytics based on the new rating
    updateUserAnalyticsOnRating(customerId);

    return newRating;
};


// Order Dispute
export const createOrderDispute = (orderId: string, customerId: string, reason: string, description: string): DbOrderDispute => {
    const newDispute: DbOrderDispute = {
        id: `dispute_${uuidv4()}`,
        order_id: orderId,
        customer_id: customerId,
        reason,
        description,
        status: 'open',
        created_at: new Date(),
        resolved_at: null,
    };
    orderDisputes.set(orderId, newDispute);
    return newDispute;
};

// NEW: Partner Management
export const findPartnerById = (id: string): DbPartner | undefined => partners.get(id);

export const findAvailablePartners = (): DbPartner[] => {
    const now = new Date();
    const currentDay = now.getDay(); // Sunday = 0, Monday = 1, ...
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // 1. Find partners who have toggled themselves as "available"
    const onlinePartners = Array.from(partners.values()).filter(p => p.is_available);

    // 2. Filter that list by who is currently on their schedule
    return onlinePartners.filter(partner => {
        const schedule = partnerAvailability.get(partner.id);
        if (!schedule) {
            return false; // No schedule means not available
        }

        // Check if current time is within any of the scheduled slots for today
        return schedule.some(slot => {
            return slot.day_of_week === currentDay &&
                   slot.start_time <= currentTime &&
                   slot.end_time > currentTime;
        });
    });
};


export const assignPartnerToOrder = (partnerId: string, orderId: string): boolean => {
    const partner = partners.get(partnerId);
    const order = orders.get(orderId);

    if (!partner || !order) return false;

    partner.is_available = false;
    order.partner_id = partnerId;
    updateOrderStatus(order.id, 'Assigned'); // Use the update function to also trigger a notification
    
    return true;
};

export const updatePartnerLocation = (partnerId: string, lat: number, lng: number): DbPartner | undefined => {
    const partner = partners.get(partnerId);
    if (!partner) return undefined;
    
    partner.current_latitude = lat;
    partner.current_longitude = lng;
    partners.set(partnerId, partner);
    return partner;
};

export const isPartnerAssignedToUser = (partnerId: string, userId: string): boolean => {
    const userOrders = ordersByCustomerId.get(userId) || [];
    // Check if the partner is assigned to any of the user's active orders
    return userOrders.some(
        order => order.partner_id === partnerId && ['Assigned', 'On The Way'].includes(order.status)
    );
};

// NEW: Get partner ratings
export const findRatingsByPartnerId = (partnerId: string): PublicRating[] => {
    const partnerRatings = ratingsByPartnerId.get(partnerId) || [];

    return partnerRatings.map(rating => {
        const customer = findUserById(rating.customer_id);
        const nameParts = customer?.name.split(' ') || ['Anonymous', 'User'];
        // Format name as "John D." for privacy
        const reviewerName = `${nameParts[0]} ${nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) + '.' : ''}`;

        return {
            reviewerName: customer ? reviewerName : 'Anonymous',
            rating: rating.rating,
            review: rating.review,
            date: rating.created_at.toISOString(),
        };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent
};

const addPartnerAvailability = (avail: DbPartnerAvailability) => {
    if (!partnerAvailability.has(avail.partner_id)) {
        partnerAvailability.set(avail.partner_id, []);
    }
    partnerAvailability.get(avail.partner_id)!.push(avail);
};

// NEW: Chat Management
export const createChatMessage = (orderId: string, senderId: string, senderType: 'customer' | 'partner', message: string): DbChatMessage => {
    const newMessage: DbChatMessage = {
        id: `msg_${uuidv4()}`,
        order_id: orderId,
        sender_id: senderId,
        sender_type: senderType,
        message,
        timestamp: new Date(),
        read_at: null,
    };

    if (!chatMessages.has(orderId)) {
        chatMessages.set(orderId, []);
    }
    chatMessages.get(orderId)!.push(newMessage);

    return newMessage;
};

export const findChatMessagesByOrderId = (orderId: string): DbChatMessage[] => {
    return chatMessages.get(orderId) || [];
};

// NEW: Call Log Management
export const createCallLog = (orderId: string, callerId: string, receiverId: string): DbCallLog => {
    const newLog: DbCallLog = {
        id: `call_${uuidv4()}`,
        order_id: orderId,
        caller_id: callerId,
        receiver_id: receiverId,
        duration: 0, // Duration is initially 0, could be updated upon call end
        timestamp: new Date(),
    };

    if (!callLogs.has(orderId)) {
        callLogs.set(orderId, []);
    }
    callLogs.get(orderId)!.push(newLog);
    return newLog;
};

// NEW: Notification Management
export const addDeviceToken = (userId: string, token: string, platform: 'web' | 'ios' | 'android'): DbDeviceToken => {
    const newToken: DbDeviceToken = {
        id: `token_${uuidv4()}`,
        user_id: userId,
        token,
        platform,
        created_at: new Date(),
    };

    if (!deviceTokensByUser.has(userId)) {
        deviceTokensByUser.set(userId, []);
    }
    
    // Avoid duplicate tokens
    const existingTokens = deviceTokensByUser.get(userId)!;
    if (!existingTokens.some(t => t.token === token)) {
        existingTokens.push(newToken);
    }
    
    return newToken;
};

export const createNotificationLog = (userId: string, type: DbNotificationLog['type'], title: string, body: string): DbNotificationLog => {
    const newNotification: DbNotificationLog = {
        id: `notif_${uuidv4()}`,
        user_id: userId,
        type,
        title,
        body,
        sent_at: new Date(),
        read_at: null,
    };
    
    if (!notificationLogsByUser.has(userId)) {
        notificationLogsByUser.set(userId, []);
    }
    
    notificationLogsByUser.get(userId)!.unshift(newNotification); // Add to the start of the array
    
    // In a real app, you would now use the user's device tokens to send a push notification.
    console.log(`[Notification Service] Created '${type}' notification for user ${userId}: "${title}"`);
    
    return newNotification;
};

export const findNotificationsByUserId = (userId: string): DbNotificationLog[] => {
    return notificationLogsByUser.get(userId) || [];
};

export const findNotificationPreferencesByUserId = (userId: string): DbNotificationPreferences | undefined => {
    return notificationPreferences.get(userId);
};

export const updateNotificationPreferences = (userId: string, prefs: Partial<DbNotificationPreferences>): DbNotificationPreferences | undefined => {
    const currentPrefs = notificationPreferences.get(userId);
    if (!currentPrefs) {
        return undefined;
    }
    const updatedPrefs = { ...currentPrefs, ...prefs };
    notificationPreferences.set(userId, updatedPrefs);
    return updatedPrefs;
}

// NEW: User Settings Management
export const findUserSettingsByUserId = (userId: string): DbUserSettings | undefined => {
    return userSettings.get(userId);
};

export const updateUserSettings = (userId: string, settings: Partial<DbUserSettings>): DbUserSettings | undefined => {
    const currentSettings = userSettings.get(userId);
    if (!currentSettings) {
        return undefined;
    }
    const updatedSettings = { ...currentSettings, ...settings };
    userSettings.set(userId, updatedSettings);
    return updatedSettings;
}

// NEW: Privacy Settings Management
export const findPrivacySettingsByUserId = (userId: string): DbPrivacySettings | undefined => {
    return privacySettings.get(userId);
};

export const updatePrivacySettings = (userId: string, settings: Partial<DbPrivacySettings>): DbPrivacySettings | undefined => {
    const currentSettings = privacySettings.get(userId);
    if (!currentSettings) {
        return undefined;
    }
    const updatedSettings = { ...currentSettings, ...settings };
    privacySettings.set(userId, updatedSettings);
    return updatedSettings;
}

// NEW: Media Management
export const createMediaRecord = (details: { userId: string, fileType: 'profile_photo' | 'package_photo', fileName: string, url: string }): DbMedia => {
    const newMedia: DbMedia = {
        id: `media_${uuidv4()}`,
        user_id: details.userId,
        file_type: details.fileType,
        file_name: details.fileName,
        url: details.url, // Use the provided GCS URL
        created_at: new Date(),
    };
    media.set(newMedia.id, newMedia);
    return newMedia;
};

export const findMediaById = (id: string): DbMedia | undefined => {
    return media.get(id);
};

export const deleteMediaRecord = (id: string): boolean => {
    return media.delete(id);
};

// NEW: Data Export
export const exportUserData = (userId: string): object | null => {
    const user = findUserById(userId);
    if (!user) {
        return null;
    }

    // Omit sensitive data like password hash
    const { password_hash, ...publicUser } = user;

    return {
        profile: publicUser,
        orders: findOrdersByUserId(userId),
        notificationPreferences: findNotificationPreferencesByUserId(userId),
        userSettings: findUserSettingsByUserId(userId),
        privacySettings: findPrivacySettingsByUserId(userId),
        notificationHistory: findNotificationsByUserId(userId),
        // Add other data points as needed
    };
};

// --- NEW: Analytics Service Logic ---

const initializeUserAnalytics = (userId: string) => {
    if (!userAnalytics.has(userId)) {
        const newAnalytics: DbUserAnalytics = {
            user_id: userId,
            total_orders: 0,
            total_spent: 0,
            average_rating_given: null,
            last_order_at: null,
        };
        userAnalytics.set(userId, newAnalytics);
    }
};

const updateUserAnalyticsOnOrder = (userId: string, order: DbOrder) => {
    const analytics = userAnalytics.get(userId);
    if (!analytics) {
        initializeUserAnalytics(userId);
        return updateUserAnalyticsOnOrder(userId, order); // Recurse
    }

    analytics.total_orders += 1;
    analytics.total_spent += order.price_breakdown.total;
    analytics.last_order_at = order.created_at;

    userAnalytics.set(userId, analytics);
};

const updateUserAnalyticsOnRating = (userId: string) => {
    const analytics = userAnalytics.get(userId);
    if (!analytics) return;

    const userRatings = ratingsByCustomerId.get(userId) || [];
    if (userRatings.length === 0) {
        analytics.average_rating_given = null;
    } else {
        const totalRating = userRatings.reduce((sum, r) => sum + r.rating, 0);
        analytics.average_rating_given = parseFloat((totalRating / userRatings.length).toFixed(2));
    }
    userAnalytics.set(userId, analytics);
};

export const getUserAnalytics = (userId: string): DbUserAnalytics | undefined => {
    return userAnalytics.get(userId);
};

export const createEventLog = (userId: string, eventType: string, eventData: object): DbEventLog => {
    const newEvent: DbEventLog = {
        id: `event_${uuidv4()}`,
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date(),
    };

    if (!eventLogsByUser.has(userId)) {
        eventLogsByUser.set(userId, []);
    }
    eventLogsByUser.get(userId)!.push(newEvent);

    console.log(`[Analytics] Logged event '${eventType}' for user ${userId}`);

    return newEvent;
};

// --- NEW: Support & Help Service ---

export const createSupportTicket = (userId: string, subject: string, description: string): DbSupportTicket => {
    const newTicket: DbSupportTicket = {
        id: `ticket_${uuidv4()}`,
        user_id: userId,
        subject,
        description,
        status: SupportTicketStatus.Open,
        priority: SupportTicketPriority.Medium, // Default priority
        created_at: new Date(),
        updated_at: new Date(),
    };

    supportTickets.set(newTicket.id, newTicket);
    if (!supportTicketsByUserId.has(userId)) {
        supportTicketsByUserId.set(userId, []);
    }
    supportTicketsByUserId.get(userId)!.push(newTicket);

    return newTicket;
};

export const findSupportTicketById = (ticketId: string): DbSupportTicket | undefined => {
    return supportTickets.get(ticketId);
};

export const findSupportTicketsByUserId = (userId: string): DbSupportTicket[] => {
    return supportTicketsByUserId.get(userId) || [];
};

export const createSupportMessage = (ticketId: string, senderId: string, senderType: 'customer' | 'agent', message: string): DbSupportMessage => {
    const newMessage: DbSupportMessage = {
        id: `msg_${uuidv4()}`,
        ticket_id: ticketId,
        sender_id: senderId,
        sender_type: senderType,
        message,
        timestamp: new Date(),
    };

    if (!supportMessagesByTicketId.has(ticketId)) {
        supportMessagesByTicketId.set(ticketId, []);
    }
    supportMessagesByTicketId.get(ticketId)!.push(newMessage);

    // Update the ticket's updatedAt timestamp
    const ticket = supportTickets.get(ticketId);
    if (ticket) {
        ticket.updated_at = new Date();
    }

    return newMessage;
};

export const findSupportMessagesByTicketId = (ticketId: string): DbSupportMessage[] => {
    return supportMessagesByTicketId.get(ticketId) || [];
};

export const findAllFaqs = (): FaqItem[] => {
    return faqItems;
};



// --- MOCK DATA INITIALIZATION ---
const initMockData = () => {
    const mockPartners: DbPartner[] = [
        { id: 'partner_1', name: 'Kofi Mensah', phone: '+233241112233', vehicle_type: 'Motorbike', current_latitude: 6.698, current_longitude: -1.621, is_available: true, rating: 4.8, total_deliveries: 152 },
        { id: 'partner_2', name: 'Ama Serwaa', phone: '+233554445566', vehicle_type: 'Motorbike', current_latitude: 6.710, current_longitude: -1.635, is_available: true, rating: 4.9, total_deliveries: 210 },
        { id: 'partner_3', name: 'John Appiah', phone: '+233207778899', vehicle_type: 'Motorbike', current_latitude: 6.675, current_longitude: -1.615, is_available: false, rating: 4.6, total_deliveries: 95 },
        { id: 'partner_4', name: 'Esi Frimpong', phone: '+233271231234', vehicle_type: 'Motorbike', current_latitude: 6.689, current_longitude: -1.605, is_available: true, rating: 4.7, total_deliveries: 180 },
    ];
    mockPartners.forEach(p => partners.set(p.id, p));

    // NEW: Mock Partner Availability Data
    // Kofi (partner_1): Mon-Fri, 9am-5pm
    for (let day = 1; day <= 5; day++) {
        addPartnerAvailability({ partner_id: 'partner_1', day_of_week: day, start_time: '09:00', end_time: '17:00' });
    }
    // Ama (partner_2): Weekends, 10am-8pm
    addPartnerAvailability({ partner_id: 'partner_2', day_of_week: 0, start_time: '10:00', end_time: '20:00' }); // Sunday
    addPartnerAvailability({ partner_id: 'partner_2', day_of_week: 6, start_time: '10:00', end_time: '20:00' }); // Saturday
    // John (partner_3): is_available is false, so schedule doesn't matter for now
    addPartnerAvailability({ partner_id: 'partner_3', day_of_week: 1, start_time: '08:00', end_time: '18:00' }); // Mon
    addPartnerAvailability({ partner_id: 'partner_3', day_of_week: 3, start_time: '08:00', end_time: '18:00' }); // Wed
    addPartnerAvailability({ partner_id: 'partner_3', day_of_week: 5, start_time: '08:00', end_time: '18:00' }); // Fri
    // Esi (partner_4): All week, 12pm-4pm
    for (let day = 0; day <= 6; day++) {
        addPartnerAvailability({ partner_id: 'partner_4', day_of_week: day, start_time: '12:00', end_time: '16:00' });
    }

    // Create mock users to leave reviews
    const reviewUser1 = createUser({
        name: 'Yaw Boakye',
        email: 'yaw.b@example.com',
        authProvider: 'phone',
        phone: '+233241112222'
    });
    const reviewUser2 = createUser({
        name: 'Adwoa Akoto',
        email: 'adwoa.a@example.com',
        authProvider: 'phone',
        phone: '+233553334444'
    });
    
    // Create mock ratings for Kofi Mensah (partner_1)
    createOrderRating('mock_order_1', reviewUser1.id, 'partner_1', 5, 'Very fast and professional. Followed instructions perfectly. Highly recommended!');
    const rating2 = createOrderRating('mock_order_2', reviewUser2.id, 'partner_1', 4, 'Good service, but arrived a little later than expected.');
    rating2.created_at = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

    // Create mock rating for Ama Serwaa (partner_2)
    createOrderRating('mock_order_3', reviewUser1.id, 'partner_2', 5, 'Ama is the best! So friendly and careful with the package.');

    // NEW: Mock FAQ Data
    faqItems.push(
        { id: 'faq_1', category: 'General', question: 'What is SwiftDrop?', answer: 'SwiftDrop is a modern, reliable doorstep delivery service for Ghana. We help you easily schedule pickups and deliveries for parcels, food, groceries, and more, all with real-time tracking.' },
        { id: 'faq_2', category: 'Payments', question: 'What payment methods do you accept?', answer: 'We accept Mobile Money (MTN, Vodafone, AirtelTigo), Cash on Delivery, and Bank Transfers. Corporate clients can also use their dedicated accounts.' },
        { id: 'faq_3', category: 'Deliveries', question: 'How do I track my order?', answer: 'Once your order is assigned to a rider, you can access a real-time tracking map directly from the "Tracking" section of the app.' },
        { id: 'faq_4', category: 'Account', question: 'How can I update my profile information?', answer: 'You can update your name and email address in the "Account Settings" section, accessible from the user menu at the top right of the screen.' }
    );
};

initMockData();