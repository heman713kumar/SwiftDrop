
import { Request, Response } from 'express';
import * as db from '../db';
import { UserProfile } from '../../types';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/users/profile
// FIX: Use standard express types for req and res.
export const getProfile = (req: Request, res: Response) => {
    // FIX: Cast req to AuthenticatedRequest to access custom 'user' property.
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        // FIX: .status and .json are now available on express.Response.
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = db.findUserById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    const notificationPreferences = db.findNotificationPreferencesByUserId(userId) || { orderUpdates: true, promotions: true };


    const userProfile: UserProfile = {
        fullName: user.name,
        email: user.email,
        photo: user.profile_photo_url,
        notificationPreferences
    };
    res.status(200).json(userProfile);
};

// PUT /api/users/profile
// FIX: Use standard express types for req and res.
export const updateProfile = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    // FIX: .body is now available on express.Request.
    const { fullName, email, photoUrl } = req.body;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedDbUser = db.updateUser(userId, { name: fullName, email, profile_photo_url: photoUrl });
    if (!updatedDbUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    const notificationPreferences = db.findNotificationPreferencesByUserId(userId) || { orderUpdates: true, promotions: true };

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
// FIX: Use standard express types for req and res.
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
    // FIX: .send is now available on express.Response.
    res.status(204).send();
};