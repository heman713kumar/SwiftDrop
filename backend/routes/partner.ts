import express from 'express';
import { getPartnerInfo, getPartnerRatings } from '../controllers/partnerController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All partner routes should be protected
router.use(authMiddleware);

router.get('/:id/info', getPartnerInfo);
router.get('/:id/ratings', getPartnerRatings);

export default router;
