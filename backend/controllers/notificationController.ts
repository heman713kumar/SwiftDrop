import { Request, Response } from 'express';
import * as db from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

// POST /api/notifications/register-device
export const registerDevice = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { token, platform } = req.body;
    if (!token || !platform) {
        return res.status(400).json({ message: 'Device token and platform are required.' });
    }
    
    if (!['web', 'ios', 'android'].includes(platform)) {
        return res.status(400).json({ message: 'Invalid platform specified.' });
    }
    
    db.addDeviceToken(userId, token, platform);
    console.log(`[BACKEND] Registered ${platform} device token for user ${userId}`);
    
    res.status(201).json({ message: 'Device registered successfully.' });
};

// GET /api/notifications/settings
export const getNotificationSettings = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const settings = db.findNotificationPreferencesByUserId(userId);
    if (!settings) {
        // This case should ideally not happen if preferences are created on user registration
        return res.status(404).json({ message: 'Notification settings not found for user.' });
    }
    
    res.status(200).json(settings);
};

// PUT /api/notifications/settings
export const updateNotificationSettings = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Whitelist the fields that can be updated
    const { 
        // FIX: Added orderUpdates and promotions to the destructured properties.
        orderUpdates,
        promotions,
        push_enabled, 
        sms_enabled, 
        email_enabled, 
        whatsapp_enabled, 
        quiet_hours_start, 
        quiet_hours_end 
    } = req.body;
    
    const settingsToUpdate = {
        // FIX: Added orderUpdates and promotions to the object being passed for update.
        orderUpdates,
        promotions,
        push_enabled,
        sms_enabled,
        email_enabled,
        whatsapp_enabled,
        quiet_hours_start,
        quiet_hours_end
    };
    
    const updatedSettings = db.updateNotificationPreferences(userId, settingsToUpdate);
    if (!updatedSettings) {
        return res.status(404).json({ message: 'User not found.' });
    }
    
    console.log(`[BACKEND] Updated notification settings for user ${userId}`);
    res.status(200).json(updatedSettings);
};

// GET /api/notifications/history
export const getNotificationHistory = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const history = db.findNotificationsByUserId(userId);
    res.status(200).json(history);
};