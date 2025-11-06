// This service initializes the Firebase Admin SDK for backend operations.
// It's used for securely verifying ID tokens sent from the frontend.

import * as admin from 'firebase-admin';
import * as path from 'path'; // ADDED: Import path module for file resolution

let isInitialized = false;

/**
 * Initializes the Firebase Admin app. This should be called once when the server starts.
 */
export const initializeFirebaseAdmin = () => {
    if (isInitialized) {
        return;
    }

    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

        if (serviceAccountJson) {
            // Production: Initialize from the environment variable provided by Cloud Run Secrets.
            // The JSON string is safely parsed here.
            const parsedServiceAccount = JSON.parse(serviceAccountJson);
            admin.initializeApp({
                credential: admin.credential.cert(parsedServiceAccount),
            });
            console.log('[Firebase Admin] Initialized from environment variable.');
        } else {
            // Local Development: Fallback to using the local JSON file path.
            // NOTE: We directly use the file path here, avoiding the problematic TS import.
            const localKeyPath = path.join(__dirname, 'serviceAccountKey.json');
            
            // This assumes the local serviceAccountKey.json contains the correct structure.
            admin.initializeApp({
                credential: admin.credential.cert(localKeyPath),
            });
            console.log('[Firebase Admin] Initialized from local serviceAccountKey.json file.');
        }
    } catch (error: any) {
        // This might happen if already initialized in some contexts (like hot-reloading).
        if (error.code !== 'app/duplicate-app') {
            console.error('[Firebase Admin] Error initializing:', error);
            console.error("CRITICAL: Ensure FIREBASE_SERVICE_ACCOUNT_JSON env var is set in production, or serviceAccountKey.json exists for local dev.");
        }
    }
    
    isInitialized = true;
};