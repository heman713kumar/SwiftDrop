import express from 'express';
import { 
    getUserStats,
    trackEvent,
} from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Protect all analytics routes
router.use(authMiddleware);

router.get('/user-stats', getUserStats);
router.post('/events', trackEvent);

export default router;