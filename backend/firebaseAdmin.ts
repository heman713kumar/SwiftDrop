// This service initializes the Firebase Admin SDK for backend operations.
// It's used for securely verifying ID tokens sent from the frontend.

import * as admin from 'firebase-admin';
// FIX: Replaced 'require' with a standard ES module import for the service account key to resolve the "Cannot find name 'require'" error. This requires `resolveJsonModule: true` in tsconfig.
import serviceAccount from './serviceAccountKey.json';

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
            const parsedServiceAccount = JSON.parse(serviceAccountJson);
            admin.initializeApp({
                credential: admin.credential.cert(parsedServiceAccount),
            });
            console.log('[Firebase Admin] Initialized from environment variable.');
        } else {
            // Local Development: Fallback to using the local JSON file.
            // Ensure `serviceAccountKey.json` is in your /backend directory and added to .gitignore.
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
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