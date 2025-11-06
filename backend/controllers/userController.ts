
import { Request, Response } from 'express';
import * as db from '../db';
import { UserProfile } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/users/profile
// Fix: Use namespace-qualified express types to avoid global type conflicts.
// FIX: Import Request and Response from express to fix type errors
export const getProfile = (req: Request, res: Response) => {
    // Cast req to AuthenticatedRequest to access custom 'user' property.
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = db.findUserById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
	const defaultNotifPrefs = { 
    user_id: 'default',
    orderUpdates: true,
    promotions: true,
    push_enabled: true,
    sms_enabled: true,
    email_enabled: true,
    whatsapp_enabled: false,
    quiet_hours_start: null,
    quiet_hours_end: null,
};
    const notificationPreferences = db.findNotificationPreferencesByUserId(userId) || defaultNotifPrefs;


    const userProfile: UserProfile = {
        fullName: user.name,
        email: user.email,
        photo: user.profile_photo_url,
        notificationPreferences
    };
    res.status(200).json(userProfile);
};

// PUT /api/users/profile
// Fix: Use namespace-qualified express types to avoid global type conflicts.
// FIX: Import Request and Response from express to fix type errors
export const updateProfile = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { fullName, email, photoUrl } = req.body;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedDbUser = db.updateUser(userId, { name: fullName, email, profile_photo_url: photoUrl });
    if (!updatedDbUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    const notificationPreferences = db.findNotificationPreferencesByUserId(userId) || defaultNotifPrefs;

    const userProfile: UserProfile = {
        fullName: updatedDbUser.name,
        email: updatedDbUser.email,
        photo: updatedDbUser.profile_photo_url,
        notificationPreferences,
    };

    res.status(200).json({
        message: 'Profile updated successfully',
        user: userProfile
    });
};

// DELETE /api/users/account
// Fix: Use namespace-qualified express types to avoid global type conflicts.
// FIX: Import Request and Response from express to fix type errors
export const deleteAccount = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const success = db.deleteUser(userId);
    if (!success) {
        return res.status(404).json({ message: 'User not found' });
    }

    console.log(`[BACKEND] Deleting user account for ${userId}.`);
    res.status(204).send();
};
