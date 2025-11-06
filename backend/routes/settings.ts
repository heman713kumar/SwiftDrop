import express from 'express';
import {
    getAccountSettings,
    updateAccountSettings,
    updatePrivacySettings,
    updatePreferences,
    getLanguages,
    deactivateAccount,
    exportData,
} from '../controllers/settingsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Protect all settings routes
router.use(authMiddleware);

router.get('/account', getAccountSettings);
router.put('/account', updateAccountSettings);
router.put('/privacy', updatePrivacySettings);
router.put('/preferences', updatePreferences);
router.get('/languages', getLanguages);
router.post('/deactivate-account', deactivateAccount);
router.post('/export-data', exportData);

export default router;
