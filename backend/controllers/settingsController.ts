import { Request, Response } from 'express';
import * as db from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/settings/account
export const getAccountSettings = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = db.findUserById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Return account-specific details
    const accountInfo = {
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        provider: user.auth_provider,
        createdAt: user.created_at,
    };
    
    res.status(200).json(accountInfo);
};

// PUT /api/settings/account
export const updateAccountSettings = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { fullName, email } = req.body;
    
    // Basic validation
    if (!fullName || !email) {
        return res.status(400).json({ message: 'Full name and email are required.' });
    }

    const updatedUser = db.updateUser(userId, { name: fullName, email });

    if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Account settings updated successfully.' });
};

// PUT /api/settings/privacy
export const updatePrivacySettings = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { shareLocation, dataCollectionConsent } = req.body;
    const settingsToUpdate: { share_location?: boolean, data_collection_consent?: boolean } = {};

    if (typeof shareLocation === 'boolean') {
        settingsToUpdate.share_location = shareLocation;
    }
    if (typeof dataCollectionConsent === 'boolean') {
        settingsToUpdate.data_collection_consent = dataCollectionConsent;
    }
    
    db.updatePrivacySettings(userId, settingsToUpdate);

    res.status(200).json({ message: 'Privacy settings updated successfully.' });
};

// PUT /api/settings/preferences
export const updatePreferences = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { language, theme, defaultPaymentMethod, defaultAddressId } = req.body;
    const settingsToUpdate = { language, theme, defaultPaymentMethod, defaultAddressId };

    const updatedSettings = db.updateUserSettings(userId, settingsToUpdate);
    if (!updatedSettings) {
        return res.status(404).json({ message: 'User not found.' });
    }
    
    res.status(200).json({ message: 'Preferences updated successfully.', settings: updatedSettings });
};

// GET /api/settings/languages
export const getLanguages = (req: Request, res: Response) => {
    // In a real app, this might come from a config file or a database table
    const supportedLanguages = [
        { code: 'en', name: 'English' },
        { code: 'tw', name: 'Asante Twi' },
        { code: 'fr', name: 'French' },
    ];
    res.status(200).json(supportedLanguages);
};

// POST /api/settings/deactivate-account
export const deactivateAccount = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    db.deactivateUser(userId);

    // The user's refresh tokens are already cleared in the deactivateUser function
    console.log(`[BACKEND] Deactivated account for user ${userId}`);

    res.status(200).json({ message: 'Account has been deactivated.' });
};

// POST /api/settings/export-data
export const exportData = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userData = db.exportUserData(userId);
    if (!userData) {
        return res.status(404).json({ message: 'User not found.' });
    }
    
    // Set headers to prompt a file download on the client side
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="swiftdrop_data_${userId}.json"`);
    res.status(200).json(userData);
};