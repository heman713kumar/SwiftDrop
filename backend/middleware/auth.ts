import { Request, Response, NextFunction } from 'express';
import * as db from '../db';
import * as jwt from '../jwt';
import { DecodedIdToken } from 'firebase-admin/auth';

// Define and export a custom AuthenticatedRequest interface to be used across the application.
// This avoids declaration merging issues and provides a single source of truth for the request type.
export interface AuthenticatedRequest extends Request {
    user?: { id: string };
};

export interface FirebaseAuthenticatedRequest extends Request {
    firebaseUser?: DecodedIdToken;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    const token = authHeader.split(' ')[1];
    
    if (db.isBlacklisted(token)) {
        return res.status(401).json({ message: 'Token has been invalidated. Please log in again.' });
    }

    const payload = jwt.verifyToken(token);
    if (!payload || !payload.userId) {
        return res.status(401).json({ message: 'Invalid or expired session token.' });
    }

    const user = db.findUserById(payload.userId);
    if (!user) {
        return res.status(401).json({ message: 'User for this session not found.' });
    }

    (req as AuthenticatedRequest).user = { id: user.id };
    next();
};

export const firebaseTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Firebase authentication token is required.' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await jwt.verifyFirebaseToken(token);
        (req as FirebaseAuthenticatedRequest).firebaseUser = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired Firebase token.' });
    }
};