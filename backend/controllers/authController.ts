import { Request, Response } from 'express';
import * as db from '../db';
import * as jwt from '../jwt';
import { UserProfile } from '../../types';
import { AuthenticatedRequest, FirebaseAuthenticatedRequest } from '../middleware/auth';

// POST /api/auth/verify-firebase-token
export const verifyFirebaseToken = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    try {
        const decodedToken = await jwt.verifyFirebaseToken(idToken);
        
        let user: db.DbUser | undefined;
        let isNewUser = false;
        
        if (decodedToken.phone_number) {
            user = db.findUserByPhone(decodedToken.phone_number);
        } else if (decodedToken.email) {
            user = db.findUserByEmail(decodedToken.email);
        }
        
        if (!user) {
            isNewUser = true;
            // For new users, we will create a shell account during the registration step.
            // Here, we just acknowledge they are new and need to register.
            const accessToken = jwt.createToken({ firebaseUid: decodedToken.uid, purpose: 'access' }, '15m');
            const refreshToken = jwt.createToken({ firebaseUid: decodedToken.uid, purpose: 'refresh' }, '7d');
             db.addRefreshToken(refreshToken, decodedToken.uid); // Use firebase uid temp
            return res.status(200).json({ isNewUser: true, message: 'User not found. Please complete registration.', accessToken, refreshToken });
        }

        const notificationPreferences = db.findNotificationPreferencesByUserId(user.id) || { orderUpdates: true, promotions: true };
        const accessToken = jwt.createToken({ userId: user.id, purpose: 'access' }, '15m');
        const refreshToken = jwt.createToken({ userId: user.id, purpose: 'refresh' }, '7d');

        db.addRefreshToken(refreshToken, user.id);

        const userProfile: UserProfile = {
            fullName: user.name,
            email: user.email,
            photo: user.profile_photo_url,
            notificationPreferences,
        };

        res.status(200).json({
            message: 'Login successful',
            isNewUser: false,
            accessToken,
            refreshToken,
            user: userProfile
        });

    } catch (error) {
        console.error("Error verifying Firebase token:", error);
        res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }
};


// POST /api/auth/register
export const register = (req: Request, res: Response) => {
    const { fullName, email, photoUrl } = req.body;
    const decodedToken = (req as FirebaseAuthenticatedRequest).firebaseUser;

    if (!decodedToken || !fullName || !email) {
        return res.status(400).json({ message: 'Missing registration information from token or request body.' });
    }
    
    console.log(`[BACKEND] Registering user: ${fullName}, ${email}, Phone: ${decodedToken.phone_number}`);
    
    if (decodedToken.phone_number && db.findUserByPhone(decodedToken.phone_number)) {
        return res.status(409).json({ message: 'A user with this phone number already exists.' });
    }
    if (db.findUserByEmail(email)) {
        return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const newUser = db.createUser({ 
        phone: decodedToken.phone_number || null, 
        name: fullName, 
        email,
        photoUrl: photoUrl || decodedToken.picture || null,
        authProvider: decodedToken.firebase.sign_in_provider === 'google.com' ? 'google' : 'phone',
        googleId: decodedToken.firebase.sign_in_provider === 'google.com' ? decodedToken.uid : null,
    });

    const notificationPreferences = db.findNotificationPreferencesByUserId(newUser.id) || { orderUpdates: true, promotions: true };
    const accessToken = jwt.createToken({ userId: newUser.id, purpose: 'access' }, '15m');
    const refreshToken = jwt.createToken({ userId: newUser.id, purpose: 'refresh' }, '7d');

    db.addRefreshToken(refreshToken, newUser.id);

    const userProfile: UserProfile = {
        fullName: newUser.name,
        email: newUser.email,
        photo: newUser.profile_photo_url,
        notificationPreferences,
    };
    
    res.status(201).json({
        message: 'User registered successfully.',
        accessToken,
        refreshToken,
        user: userProfile
    });
};


// POST /api/auth/logout
// FIX: Use standard express types for req and res.
export const logout = (req: Request, res: Response) => {
    // FIX: .headers is now available on express.Request.
    const token = req.headers.authorization?.split(' ')[1];
    const { refreshToken } = req.body;

    // Blacklist access token
    const payload = token ? jwt.verifyToken(token) : null;
    if (token && payload) {
        db.addToBlacklist(token, payload.exp);
        console.log('[BACKEND] Access token has been blacklisted.');
    }

    // Invalidate refresh token
    if(refreshToken) {
        db.deleteRefreshToken(refreshToken);
        console.log('[BACKEND] Refresh token has been invalidated.');
    }

    res.status(200).json({ message: 'Logged out successfully' });
};

// POST /api/auth/refresh-token
// FIX: Use standard express types for req and res.
export const refreshToken = (req: Request, res: Response) => {
    const { refreshToken: oldRefreshToken } = req.body;
    if (!oldRefreshToken) {
        return res.status(401).json({ message: 'Refresh token is required.' });
    }
    
    // Verify the token signature and expiration
    const payload = jwt.verifyToken(oldRefreshToken);
    if (!payload || (payload.purpose !== 'refresh' && !payload.firebaseUid) || (!payload.userId && !payload.firebaseUid)) {
        return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }

    // Verify if the token is active in our database
    const identityId = payload.userId || payload.firebaseUid;
    const userIdFromDb = db.findUserByRefreshToken(oldRefreshToken);
    if (identityId !== userIdFromDb) {
        return res.status(403).json({ message: 'Refresh token has been revoked.' });
    }

    // Token is valid, perform rotation:
    db.deleteRefreshToken(oldRefreshToken);

    const newAccessToken = jwt.createToken({ userId: payload.userId, firebaseUid: payload.firebaseUid, purpose: 'access' }, '15m');
    const newRefreshToken = jwt.createToken({ userId: payload.userId, firebaseUid: payload.firebaseUid, purpose: 'refresh' }, '7d');
    
    db.addRefreshToken(newRefreshToken, identityId);
    
    console.log(`[BACKEND] Token refreshed for user/uid ${identityId}`);

    res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    });
};

// POST /api/auth/forgot-password
// FIX: Use standard express types for req and res.
export const forgotPassword = (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    const user = db.findUserByEmail(email);
    if (user) {
        // User found, generate a reset token.
        const resetToken = jwt.createToken({ userId: user.id, purpose: 'password-reset' }, '15m');
        
        // In a real app, you would email this link to the user.
        // For this mock, we just log it to the server console.
        console.log(`[BACKEND] Password reset requested for ${email}.`);
        console.log(`[BACKEND] Reset Token: ${resetToken}`);
    } else {
        // To prevent email enumeration attacks, we don't reveal if the user exists.
        console.log(`[BACKEND] Password reset requested for non-existent email: ${email}.`);
    }

    // Always send a success-like response.
    res.status(200).json({ message: 'If your email is in our system, you will receive a password reset link.' });
};

// POST /api/auth/reset-password
// FIX: Use standard express types for req and res.
export const resetPassword = (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    
    if (db.isBlacklisted(token)) {
        return res.status(401).json({ message: 'This reset token has already been used.' });
    }

    const payload = jwt.verifyToken(token);
    if (!payload || payload.purpose !== 'password-reset' || !payload.userId) {
        return res.status(401).json({ message: 'Invalid or expired password reset token.' });
    }

    const user = db.findUserById(payload.userId);
    if (!user) {
        // This case is unlikely if the token is valid, but it's a good safeguard.
        return res.status(404).json({ message: 'User not found.' });
    }

    // In a real app, you would hash the password with bcrypt here.
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // For this mock, we store it as a fake hash.
    const mockPasswordHash = `hashed_${newPassword}`;
    db.updateUserPassword(user.id, mockPasswordHash);

    // Invalidate the token so it can't be used again
    db.addToBlacklist(token, payload.exp);
    
    console.log(`[BACKEND] Password has been reset for user ${user.id}.`);
    res.status(200).json({ message: 'Password has been reset successfully.' });
};