import express from 'express';
import { findPartner } from '../controllers/matchingController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All matching routes should be protected
router.use(authMiddleware);

router.post('/find-partner', findPartner);

export default router;
