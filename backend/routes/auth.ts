import express from 'express';
import { 
    register, 
    verifyFirebaseToken, 
    logout,
    forgotPassword,
    resetPassword,
    refreshToken,
} from '../controllers/authController';
import { firebaseTokenMiddleware, authMiddleware } from '../middleware/auth';

const router = express.Router();

// This endpoint uses a Firebase token for initial sign-in or to link accounts
router.post('/verify-firebase-token', verifyFirebaseToken);

// Registration requires a valid, verified Firebase token to prove identity
router.post('/register', firebaseTokenMiddleware, register);

// These routes use the app's own JWT for authentication
router.post('/logout', authMiddleware, logout);
router.post('/refresh-token', refreshToken);

// Other auth endpoints (to be implemented)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


export default router;