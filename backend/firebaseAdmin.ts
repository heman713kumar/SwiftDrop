// This service initializes the Firebase Admin SDK for backend operations.
// It's used for securely verifying ID tokens sent from the frontend.

import * as admin from 'firebase-admin';

let isInitialized = false;

/**
 * Initializes the Firebase Admin app. This should be called once when the server starts.
 */
export const initializeFirebaseAdmin = () => {
    if (isInitialized) {
        return;
    }

    // --- IMPORTANT ---
    // In a production environment, you would not use a mock service account.
    // You would download your project's service account key (a JSON file) from the
    // Firebase console and provide its path via an environment variable.
    //
    // Example for production:
    //
    // if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    //     admin.initializeApp({
    //         credential: admin.credential.applicationDefault(),
    //     });
    //     console.log('[Firebase Admin] Initialized with default credentials.');
    // } else {
    //     console.error('[Firebase Admin] GOOGLE_APPLICATION_CREDENTIALS env var not set.');
    // }

    // For this sandboxed environment, we'll initialize with mock credentials
    // to allow the SDK to be imported and used without throwing an error.
    // Note: Any actual API calls (like token verification) will fail with this config.
    // We will mock the verification function itself in the `jwt.ts` file for this environment.
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: "mock-project-id",
                clientEmail: "mock-client-email@example.com",
                privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3\n-----END PRIVATE KEY-----\n",
            }),
        });
        console.log('[Firebase Admin] Initialized with MOCK credentials.');
    } catch (error: any) {
        // This might happen if already initialized in some contexts.
        if (error.code !== 'app/duplicate-app') {
            console.error('[Firebase Admin] Error initializing with mock credentials:', error);
        }
    }
    
    isInitialized = true;
};

// We will use `getAuth().verifyIdToken(token)` directly in our `jwt.ts` file,
// so no further functions are needed here for now. This file's primary role
// is to ensure the admin app is initialized at startup.
