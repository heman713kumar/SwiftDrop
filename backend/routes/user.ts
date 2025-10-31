import express from 'express';
import { 
    getProfile, 
    updateProfile, 
    deleteAccount 
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Protect all user routes with the authentication middleware.
// FIX: Middleware is now compatible due to signature change in middleware/auth.ts
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/account', deleteAccount);

export default router;