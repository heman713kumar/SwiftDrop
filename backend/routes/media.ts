import express from 'express';
import { 
    uploadMedia,
    deleteMedia,
} from '../controllers/mediaController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Protect all media routes
router.use(authMiddleware);

router.post('/upload', uploadMedia);
router.delete('/:id', deleteMedia);

export default router;