import express from 'express';
import { 
    registerDevice,
    getNotificationSettings,
    updateNotificationSettings,
    getNotificationHistory,
} from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Protect all notification routes
router.use(authMiddleware);

router.post('/register-device', registerDevice);
router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);
router.get('/history', getNotificationHistory);

export default router;
