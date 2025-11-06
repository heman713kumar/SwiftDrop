import express from 'express';
import { initiateCall } from '../controllers/callController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Protect all call routes
router.use(authMiddleware);

router.post('/initiate', initiateCall);

export default router;