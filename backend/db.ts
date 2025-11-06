// This file manages the connection to the PostgreSQL database.
// File: db.ts (Initial import block)

// ... (lines 1-4)
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
// FIX: Consolidated and corrected all imports from types.ts. Removed unused duplicated lines.
import { 
    UserProfile, OrderDetails, ServiceCategory, LocationInfo, PackageDetails, PriceBreakdown, OrderStatus, OrderHistoryItem, UserStats, 
    SupportTicketStatus, SupportTicketPriority, FaqItem, 
    PublicRating, DbUser, DbMedia, DbUserSettings, DbPrivacySettings, DbNotificationPreferences, DbOrder, DbOrderTracking, DbOrderRating, DbOrderDispute, DbPartner, DbPartnerAvailability, DbChatMessage, DbCallLog, DbDeviceToken, DbNotificationLog, DbEventLog, DbUserAnalytics, DbSupportTicket, DbSupportMessage
} from './types'; 

// ... (rest of the file)


// These values are now read from environment variables, which will be set by Cloud Run Secrets.
// This is more secure and flexible than hardcoding them.
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST; // e.g., 'aws-1-eu-north-1.pooler.supabase.com'
const dbProjectRef = process.env.DB_PROJECT_REF; // e.g., 'mlisaewbgssgbumndiqc'

if (!dbPassword || !dbHost || !dbProjectRef) {
    console.error('[Database] Missing required database environment variables (DB_PASSWORD, DB_HOST, DB_PROJECT_REF).');
    // For local development, you would typically use a .env file.
    // In production on Cloud Run, these must be set.
}

// Constructs the connection string dynamically from environment variables.
const connectionString = `postgresql://postgres.${dbProjectRef}:${dbPassword}@${dbHost}:6543/postgres`;

export const pool = new Pool({
    connectionString: connectionString,
    // Supabase recommends these settings for the transaction pooler
    ssl: {
        rejectUnauthorized: false,
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('[Database] PostgreSQL connected successfully via pool.');
});

pool.on('error', (err) => {
    console.error('[Database] Unexpected error on idle PostgreSQL client', err);
    // Cast 'process' to 'any' to bypass the TypeScript error for the 'exit' property.
    (process as any).exit(-1);
});

// A helper function to easily query the database
export const query = (text: string, params?: any[]) => pool.query(text, params);


// ===================================================================================
// == PRODUCTION DATABASE ARCHITECTURE NOTE
// ===================================================================================
// This file simulates a database using in-memory Maps for demonstration purposes.
// All interfaces are now imported from ./types.ts.
// ===================================================================================


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

// FIX: Implement missing function
export const initializeUserAnalytics = (userId: string) => {
    const newAnalytics: DbUserAnalytics = {
        user_id: userId,
        total_orders: 0,
        total_spent: 0,
        average_rating_given: null,
        last_order_at: null,
    };
    userAnalytics.set(userId, newAnalytics);
};

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
    // FIX: Call implemented function
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

// FIX: Fix truncated function and incorrect property access
export const updateUser = (id: string, updates: Partial<Pick<DbUser, 'name' | 'email' | 'profile_photo_url'>>): DbUser | undefined => {
    const user = users.get(id);
    if (!user) return undefined;
    
    const oldEmail = user.email;

    const updatedUser: DbUser = {
        ...user,
        name: updates.name ?? user.name,
        email: updates.email ?? user.email,
        profile_photo_url: updates.profile_photo_url !== undefined ? updates.profile_photo_url : user.profile_photo_url,
        updated_at: new Date(),
    };
    users.set(id, updatedUser);

    if (updates.email && updates.email !== oldEmail) {
        usersByEmail.delete(oldEmail);
        usersByEmail.set(updates.email, updatedUser);
    }
    
    return updatedUser;
};

// FIX: Implement missing functions
export const updateUserPassword = (id: string, passwordHash: string): void => {
    const user = users.get(id);
    if (user) {
        user.password_hash = passwordHash;
        user.updated_at = new Date();
        users.set(id, user);
    }
};

export const deleteUser = (id: string): boolean => {
    const user = users.get(id);
    if (!user) return false;

    users.delete(id);
    if (user.phone) usersByPhone.delete(user.phone);
    if (user.email) usersByEmail.delete(user.email);
    if (user.google_id) usersByGoogleId.delete(user.google_id);

    // Also clear associated data
    userSettings.delete(id);
    privacySettings.delete(id);
    notificationPreferences.delete(id);
    userAnalytics.delete(id);
    // In a real DB, you'd handle orders, etc., probably by setting them to a deleted user ID.

    return true;
};

export const deactivateUser = (id: string): void => {
    const user = users.get(id);
    if (user) {
        user.status = 'deactivated';
        user.updated_at = new Date();
        users.set(id, user);
        // Clear all their refresh tokens
        activeRefreshTokens.forEach((userId, token) => {
            if (userId === id) {
                activeRefreshTokens.delete(token);
            }
        });
    }
};

// Notification Preferences
export const findNotificationPreferencesByUserId = (userId: string): DbNotificationPreferences | undefined => {
    return notificationPreferences.get(userId);
};

export const updateNotificationPreferences = (userId: string, updates: Partial<DbNotificationPreferences>): DbNotificationPreferences | undefined => {
    const prefs = notificationPreferences.get(userId);
    if (!prefs) return undefined;

    const updatedPrefs = { ...prefs, ...updates };
    notificationPreferences.set(userId, updatedPrefs);
    return updatedPrefs;
};

// Settings
export const updatePrivacySettings = (userId: string, updates: Partial<DbPrivacySettings>): void => {
    const settings = privacySettings.get(userId);
    if (settings) {
        privacySettings.set(userId, { ...settings, ...updates });
    }
};

export const updateUserSettings = (userId: string, updates: Partial<DbUserSettings>): DbUserSettings | undefined => {
    const settings = userSettings.get(userId);
    if (!settings) return undefined;
    const updatedSettings = { ...settings, ...updates };
    userSettings.set(userId, updatedSettings);
    return updatedSettings;
};

// Data Export
export const exportUserData = (userId: string): object | null => {
    const user = findUserById(userId);
    if (!user) return null;
    return {
        profile: user,
        orders: findOrdersByUserId(userId),
        settings: userSettings.get(userId),
        privacy: privacySettings.get(userId),
        notifications: notificationPreferences.get(userId),
    };
};

// Order Management
export const findOrderById = (id: string): DbOrder | undefined => orders.get(id);

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
    const userOrders = ordersByCustomerId.get(userId) || [];
    userOrders.push(newOrder);
    ordersByCustomerId.set(userId, userOrders);

    return newOrder;
};

export const findOrdersByUserId = (userId: string): OrderHistoryItem[] => {
    const userOrders = ordersByCustomerId.get(userId) || [];
    return userOrders.map(o => ({
        id: o.id,
        date: o.created_at.toISOString(),
        serviceType: o.service_type,
        pickupAddress: o.pickup_location.address,
        deliveryAddress: o.delivery_location.address,
        totalPrice: o.price_breakdown.total,
        status: o.status,
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const findActiveOrders = (): DbOrder[] => {
    const activeStatuses: OrderStatus[] = ['Placed', 'Assigned', 'On The Way'];
    return Array.from(orders.values()).filter(o => activeStatuses.includes(o.status));
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): void => {
    const order = orders.get(orderId);
    if (order) {
        order.status = status;
        order.updated_at = new Date();
        orders.set(orderId, order);
    }
};

// Tracking
export const findOrderTrackingHistory = (orderId: string): DbOrderTracking[] => {
    return orderTracking.get(orderId) || [];
};

export const addOrderTrackingEvent = (orderId: string, lat: number, lng: number, status: string): void => {
    const event: DbOrderTracking = {
        id: `track_${uuidv4()}`,
        order_id: orderId,
        latitude: lat,
        longitude: lng,
        status,
        timestamp: new Date(), // Keep as Date object
    };
    const history = orderTracking.get(orderId) || [];
    history.push(event);
    orderTracking.set(orderId, history);
};

// Ratings and Disputes
export const createOrderRating = (orderId: string, customerId: string, partnerId: string, rating: number, review: string | null): void => {
    const newRating: DbOrderRating = {
        id: `rating_${uuidv4()}`,
        order_id: orderId,
        customer_id: customerId,
        partner_id: partnerId,
        rating,
        review,
        created_at: new Date(),
    };
    orderRatings.set(orderId, newRating); // Assuming one rating per order
    
    const partnerRatings = ratingsByPartnerId.get(partnerId) || [];
    partnerRatings.push(newRating);
    ratingsByPartnerId.set(partnerId, partnerRatings);
    
    const customerRatings = ratingsByCustomerId.get(customerId) || [];
    customerRatings.push(newRating);
    ratingsByCustomerId.set(customerId, customerRatings);
};

export const createOrderDispute = (orderId: string, customerId: string, reason: string, description: string): void => {
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
    orderDisputes.set(newDispute.id, newDispute);
};

// Partner Management
export const findPartnerById = (id: string): DbPartner | undefined => partners.get(id);

export const updatePartnerLocation = (id: string, lat: number, lng: number): void => {
    const partner = partners.get(id);
    if (partner) {
        partner.current_latitude = lat;
        partner.current_longitude = lng;
        partners.set(id, partner);
    }
};

export const isPartnerAssignedToUser = (partnerId: string, userId: string): boolean => {
    const userOrders = findActiveOrders().filter(o => o.customer_id === userId);
    return userOrders.some(o => o.partner_id === partnerId);
};

export const findRatingsByPartnerId = (partnerId: string): PublicRating[] => {
    const partnerRatings = ratingsByPartnerId.get(partnerId) || [];
    return partnerRatings.map(r => {
        const user = findUserById(r.customer_id);
        return {
            reviewerName: user ? user.name.split(' ')[0] : 'Anonymous',
            rating: r.rating,
            review: r.review,
            date: r.created_at.toISOString(),
        };
    });
};

export const findAvailablePartners = (): DbPartner[] => {
    return Array.from(partners.values()).filter(p => p.is_available);
};

export const assignPartnerToOrder = (partnerId: string, orderId: string): void => {
    const partner = partners.get(partnerId);
    if (partner) {
        partner.is_available = false;
        partners.set(partnerId, partner);
    }
    const order = orders.get(orderId);
    if (order) {
        order.partner_id = partnerId;
        order.status = 'Assigned';
        order.updated_at = new Date();
        orders.set(orderId, order);
    }
};

// Chat and Calls
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
    const messages = chatMessages.get(orderId) || [];
    messages.push(newMessage);
    chatMessages.set(orderId, messages);
    return newMessage;
};

export const findChatMessagesByOrderId = (orderId: string): DbChatMessage[] => {
    return chatMessages.get(orderId) || [];
};

export const createCallLog = (orderId: string, callerId: string, receiverId: string): void => {
    const newLog: DbCallLog = {
        id: `call_${uuidv4()}`,
        order_id: orderId,
        caller_id: callerId,
        receiver_id: receiverId,
        duration: 0, // Duration would be updated on call end
        timestamp: new Date(),
    };
    const logs = callLogs.get(orderId) || [];
    logs.push(newLog);
    callLogs.set(orderId, logs);
};

// Device Tokens
export const addDeviceToken = (userId: string, token: string, platform: 'web' | 'ios' | 'android'): void => {
    const newDevice: DbDeviceToken = {
        id: `dev_${uuidv4()}`,
        user_id: userId,
        token,
        platform,
        created_at: new Date(),
    };
    const tokens = deviceTokensByUser.get(userId) || [];
    // Avoid duplicate tokens
    if (!tokens.find(t => t.token === token)) {
        tokens.push(newDevice);
        deviceTokensByUser.set(userId, tokens);
    }
};

// Notifications
export const findNotificationsByUserId = (userId: string): DbNotificationLog[] => {
    return (notificationLogsByUser.get(userId) || []).sort((a, b) => b.sent_at.getTime() - a.sent_at.getTime());
};

export const createNotificationLog = (userId: string, type: DbNotificationLog['type'], title: string, body: string): void => {
    const newLog: DbNotificationLog = {
        id: `notif_${uuidv4()}`,
        user_id: userId,
        type,
        title,
        body,
        sent_at: new Date(),
        read_at: null,
    };
    const logs = notificationLogsByUser.get(userId) || [];
    logs.push(newLog);
    notificationLogsByUser.set(userId, logs);
};

// Media
export const createMediaRecord = (details: { userId: string, fileType: 'profile_photo' | 'package_photo', fileName: string, url: string }): DbMedia => {
    const newMedia: DbMedia = {
        id: `media_${uuidv4()}`,
        user_id: details.userId,
        file_type: details.fileType,
        file_name: details.fileName,
        url: details.url,
        created_at: new Date(),
    };
    media.set(newMedia.id, newMedia);
    return newMedia;
};

export const findMediaById = (id: string): DbMedia | undefined => media.get(id);

export const deleteMediaRecord = (id: string): void => {
    media.delete(id);
};

// Analytics
export const getUserAnalytics = (userId: string): DbUserAnalytics | undefined => userAnalytics.get(userId);

export const createEventLog = (userId: string, eventType: string, payload: object): void => {
    const newLog: DbEventLog = {
        id: `evt_${uuidv4()}`,
        user_id: userId,
        event_type: eventType,
        event_data: payload,
        timestamp: new Date(),
    };
    const logs = eventLogsByUser.get(userId) || [];
    logs.push(newLog);
    eventLogsByUser.set(userId, logs);
};

// Support
export const createSupportTicket = (userId: string, subject: string, description: string): DbSupportTicket => {
    const newTicket: DbSupportTicket = {
        id: `tkt_${uuidv4()}`,
        user_id: userId,
        subject,
        description,
        status: SupportTicketStatus.Open,
        priority: SupportTicketPriority.Medium,
        created_at: new Date(),
        updated_at: new Date(),
    };
    supportTickets.set(newTicket.id, newTicket);
    const userTickets = supportTicketsByUserId.get(userId) || [];
    userTickets.push(newTicket);
    supportTicketsByUserId.set(userId, userTickets);
    return newTicket;
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
    const messages = supportMessagesByTicketId.get(ticketId) || [];
    messages.push(newMessage);
    supportMessagesByTicketId.set(ticketId, messages);
    const ticket = supportTickets.get(ticketId);
    if(ticket) {
        ticket.updated_at = new Date();
        supportTickets.set(ticketId, ticket);
    }
    return newMessage;
};

export const findSupportTicketsByUserId = (userId: string): DbSupportTicket[] => {
    return (supportTicketsByUserId.get(userId) || []).sort((a,b) => b.updated_at.getTime() - a.updated_at.getTime());
};

export const findSupportTicketById = (id: string): DbSupportTicket | undefined => supportTickets.get(id);

export const findSupportMessagesByTicketId = (ticketId: string): DbSupportMessage[] => {
    return supportMessagesByTicketId.get(ticketId) || [];
};

export const findAllFaqs = (): FaqItem[] => faqItems;