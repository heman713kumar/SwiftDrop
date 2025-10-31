// A mock JWT implementation for demonstration purposes.
// In a real application, use a library like 'jsonwebtoken'.
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { Buffer } from 'buffer';

const SECRET_KEY = 'swift-drop-secret-key-that-should-be-in-env';

export interface JwtPayload {
    userId?: string;
    firebaseUid?: string;
    exp: number; // Expiration timestamp in seconds
    [key: string]: any; // Allow other properties like 'purpose'
}

// Use Node.js Buffer for base64url encoding, which is safe for server-side execution.
const toBase64Url = (str: string): string => {
    return Buffer.from(str, 'utf-8').toString('base64url');
};

const fromBase64Url = (str: string): string => {
    return Buffer.from(str, 'base64url').toString('utf-8');
};

export const createToken = (payload: Omit<JwtPayload, 'exp'>, expiresIn: string): string => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    
    let expiryInSeconds = 0;
    const value = parseInt(expiresIn.slice(0, -1), 10);
    const unit = expiresIn.slice(-1);

    if (unit === 'm') expiryInSeconds = value * 60;
    else if (unit === 'd') expiryInSeconds = value * 24 * 60 * 60;
    else if (unit === 'h') expiryInSeconds = value * 60 * 60;
    
    const fullPayload: JwtPayload = { ...payload, exp: now + expiryInSeconds };
    
    const encodedHeader = toBase64Url(JSON.stringify(header));
    const encodedPayload = toBase64Url(JSON.stringify(fullPayload));
    
    // Mock signature - in a real app this would be a crypto hash
    const signature = `mock_signature_for_${encodedPayload}`;
    const encodedSignature = toBase64Url(signature);
    
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
        if (!encodedHeader || !encodedPayload || !encodedSignature) {
            return null;
        }

        const payload: JwtPayload = JSON.parse(fromBase64Url(encodedPayload));
        
        // Mock signature verification
        const expectedSignature = toBase64Url(`mock_signature_for_${encodedPayload}`);
        if (encodedSignature !== expectedSignature) {
            console.error("[JWT] Invalid signature.");
            return null;
        }

        // Check expiration
        if (payload.exp < Math.floor(Date.now() / 1000)) {
            console.log("[JWT] Token expired.");
            return null;
        }
        
        return payload;
    } catch (error) {
        console.error("[JWT] Error verifying token:", error);
        return null;
    }
};

/**
 * Verifies a Firebase ID token using the Firebase Admin SDK.
 * @param token The Firebase ID token from the client.
 * @returns A promise that resolves with the decoded token payload.
 */
export const verifyFirebaseToken = (token: string): Promise<DecodedIdToken> => {
    return getAuth().verifyIdToken(token);
};