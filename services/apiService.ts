import { UserProfile, OrderDetails, LoginResponse, OrderHistoryItem, TrackingData, UserStats, SupportTicket, SupportMessage, FaqItem } from '../types';

const API_BASE_URL = '/api';
const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY);
let refreshToken: string | null = localStorage.getItem(REFRESH_TOKEN_KEY);
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void, reject: (reason?: any) => void }> = [];

// NEW: Helper to convert a File object to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // result is "data:image/jpeg;base64,LzlqLzRBQ...". We only want the part after the comma.
            const base64String = (reader.result as string).split(',')[1];
            if (base64String) {
                resolve(base64String);
            } else {
                reject(new Error("Could not read file as base64."));
            }
        };
        reader.onerror = error => reject(error);
    });
};


const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const setTokens = (newAccessToken: string, newRefreshToken: string) => {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
};

const clearTokens = () => {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getAuthToken = (): string | null => {
    return accessToken;
};

const handleResponse = async (response: Response) => {
    if (response.status === 401) {
        // This specific status is handled by the authedFetch logic for retries
        throw new Error('Unauthorized');
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message);
    }
    if (response.status === 204) { // No Content
        return;
    }
    return response.json();
};

const refreshTokenFlow = async (): Promise<{accessToken: string, refreshToken: string}> => {
    const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!currentRefreshToken) {
        throw new Error("No refresh token available");
    }
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    return response.json();
}

const authedFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const executeFetch = (token: string | null) => {
        const headers = new Headers(options.headers);
        headers.set('Content-Type', 'application/json');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    };

    try {
        let response = await executeFetch(accessToken);

        if (response.status === 401) {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshTokenFlow();
                    setTokens(newAccessToken, newRefreshToken);
                    processQueue(null, newAccessToken);
                    response = await executeFetch(newAccessToken); // Retry original request
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    clearTokens();
                    // Force a reload to the login page if refresh fails
                    window.location.href = '/'; 
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    return executeFetch(token as string).then(handleResponse);
                });
            }
        }
        
        return handleResponse(response);
    } catch (error) {
         // This will catch network errors or errors from handleResponse
        return Promise.reject(error);
    }
};

// --- Authentication ---

export const verifyFirebaseToken = async (idToken: string): Promise<LoginResponse> => {
    const data: LoginResponse = await fetch(`${API_BASE_URL}/auth/verify-firebase-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    }).then(response => handleResponse(response));

    if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
    }
    return data;
};

export const register = async (fullName: string, email: string, photo: File | null): Promise<LoginResponse> => {
    // The user is already authenticated with Firebase, so we can get their ID token
    // to prove their identity to our backend for this registration step.
    const idToken = await firebaseService.getCurrentUserIdToken();
    if (!idToken) {
        throw new Error("User is not authenticated. Cannot complete registration.");
    }

    const headers: Record<string, string> = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}` // Use the Firebase token for this specific request
    };
    
    let photoUrl: string | null = null;
    if (photo) {
        // First, upload the photo to get a URL
        const uploadResponse = await uploadMedia(photo, 'profile_photo');
        photoUrl = uploadResponse.media.url;
    }
    
    const data: LoginResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fullName, email, photoUrl }),
    }).then(response => handleResponse(response));

    // After successful registration, the backend returns our app's tokens.
    if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
    }
    return data;
};

export const logout = async (): Promise<void> => {
    const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
        await authedFetch('/auth/logout', { 
            method: 'POST',
            body: JSON.stringify({ refreshToken: currentRefreshToken })
        });
    } catch (error) {
        console.error("Logout failed on server, clearing token locally anyway.", error);
    } finally {
        clearTokens();
    }
};

// --- User Profile ---

export const getUserProfile = (): Promise<UserProfile> => {
    return authedFetch('/users/profile');
};

export const updateUserProfile = async (profileData: UserProfile): Promise<UserProfile> => {
    let photoUrl = profileData.photo; // Can be an existing string URL or null

    // If the photo is a File object, it means a new one was selected for upload.
    if (profileData.photo instanceof File) {
        const uploadResponse = await uploadMedia(profileData.photo, 'profile_photo');
        photoUrl = uploadResponse.media.url;
    }
    
    const data = await authedFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ 
            fullName: profileData.fullName,
            email: profileData.email,
            photoUrl: photoUrl // Send the URL, not the file object
        }),
    });
    return data.user;
};

export const deleteAccount = (): Promise<void> => {
    return authedFetch('/users/account', { method: 'DELETE' });
};

// --- Media Upload ---

export const uploadMedia = async (file: File, fileType: 'profile_photo' | 'package_photo'): Promise<{ media: { url: string } }> => {
    const base64File = await fileToBase64(file);
    return authedFetch('/media/upload', {
        method: 'POST',
        body: JSON.stringify({
            file: base64File,
            fileName: file.name,
            fileType: fileType,
        }),
    });
};

// --- Order Management ---

export const createOrder = (orderDetails: OrderDetails): Promise<{ id: string }> => {
    return authedFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderDetails),
    });
};

export const getOrders = (): Promise<OrderHistoryItem[]> => {
    return authedFetch('/orders');
};

export const getOrderDetails = (orderId: string): Promise<any> => {
    return authedFetch(`/orders/${orderId}`);
};

export const getOrderTracking = (orderId: string): Promise<TrackingData> => {
    return authedFetch(`/orders/${orderId}/tracking`);
};

export const cancelOrder = (orderId: string): Promise<void> => {
    return authedFetch(`/orders/${orderId}/cancel`, { method: 'PUT' });
};

export const rateOrder = (orderId: string, rating: number, review: string): Promise<void> => {
    return authedFetch(`/orders/${orderId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating, review }),
    });
};

export const disputeOrder = (orderId: string, reason: string, description: string): Promise<void> => {
    return authedFetch(`/orders/${orderId}/dispute`, {
        method: 'POST',
        body: JSON.stringify({ reason, description }),
    });
};

// --- Analytics ---

export const getUserStats = (): Promise<UserStats> => {
    return authedFetch('/analytics/user-stats');
};

export const trackEvent = (eventType: string, payload: object): Promise<void> => {
    return authedFetch('/analytics/events', {
        method: 'POST',
        body: JSON.stringify({ eventType, payload }),
    });
};

// --- NEW: Support & Help ---

export const createSupportTicket = (subject: string, description: string): Promise<SupportTicket> => {
    return authedFetch('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, description }),
    });
};

export const getSupportTickets = (): Promise<SupportTicket[]> => {
    return authedFetch('/support/tickets');
};

export const getSupportTicketDetails = (ticketId: string): Promise<SupportTicket> => {
    return authedFetch(`/support/tickets/${ticketId}`);
};

export const addSupportMessage = (ticketId: string, message: string): Promise<SupportMessage> => {
    return authedFetch(`/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
    });
};

export const getFaqs = (): Promise<FaqItem[]> => {
    // This is a public endpoint, so we don't need authedFetch
    return fetch(`${API_BASE_URL}/support/faq`).then(handleResponse);
};

// This needs to be imported here to avoid circular dependencies
import * as firebaseService from './firebaseService';