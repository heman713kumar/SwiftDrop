// This service encapsulates all Firebase Authentication logic for the frontend.
// It provides a clean, production-ready interface for the main App component.
// NOTE: Reverted to Firebase v8 syntax to fix compilation errors. The errors
// ("Module has no exported member") strongly indicate that the project's installed
// Firebase version is v8, even though the code was refactored to v9 syntax. This
// change aligns the code with the likely project dependency.
import firebase from 'firebase/app';
import 'firebase/auth';

// --- Type Aliases for v8 SDK ---
type ConfirmationResult = firebase.auth.ConfirmationResult;
type UserCredential = firebase.auth.UserCredential;


declare global {
  interface Window {
    grecaptcha?: any;
    // Store the verifier on the window object to avoid re-creating it on HMR
    recaptchaVerifier?: firebase.auth.RecaptchaVerifier;
  }
}

// --- IMPORTANT ---
// In a real application, these values would come from your Firebase project's configuration
// and should be stored securely in environment variables, not hardcoded.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Replace with your actual Firebase config
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- Initialization for v8 ---
// Initialize Firebase App if it hasn't been already.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
export const auth = firebase.auth();

// Store the confirmation result from phone auth to be used in the OTP step
let phoneConfirmationResult: ConfirmationResult | null = null;

/**
 * Sets up and renders the invisible reCAPTCHA verifier required for phone authentication.
 * @param containerId The ID of the HTML element where the reCAPTCHA should be rendered.
 */
export const setupRecaptcha = (containerId: string) => {
    // Prevent re-initializing the verifier on every render.
    if (window.recaptchaVerifier) {
        return;
    }
    
    // Use v8 syntax for RecaptchaVerifier.
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(containerId, {
        'size': 'invisible',
        'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            console.log("reCAPTCHA solved:", response);
        },
        'expired-callback': () => {
             console.log("reCAPTCHA expired, please try again.");
             if (window.recaptchaVerifier) {
                window.recaptchaVerifier.render().then(widgetId => {
                    window.grecaptcha?.reset(widgetId);
                });
             }
        }
    });
};

/**
 * Sends an OTP code to the provided phone number using Firebase Authentication.
 * @param phoneNumber The full phone number in E.164 format (e.g., +233241234567).
 * @returns A promise that resolves when the OTP has been sent.
 */
export const sendOtpToPhone = async (phoneNumber: string): Promise<void> => {
    const verifier = window.recaptchaVerifier;
    if (!verifier) throw new Error("reCAPTCHA not initialized.");
    
    try {
        // Use v8 syntax for signInWithPhoneNumber.
        phoneConfirmationResult = await auth.signInWithPhoneNumber(phoneNumber, verifier);
        console.log(`OTP sent to ${phoneNumber}`);
    } catch (error) {
        console.error("Error sending OTP:", error);
        // Reset the reCAPTCHA on error to allow for retries
        verifier.render().then(widgetId => {
            if (window.grecaptcha && widgetId !== undefined) {
                window.grecaptcha.reset(widgetId);
            }
        });
        throw error; // Re-throw the error to be handled by the UI
    }
};

/**
 * Verifies the OTP code entered by the user and retrieves a Firebase ID token.
 * @param otp The 6-digit OTP code.
 * @returns A promise that resolves with the user's secure ID token.
 */
export const verifyOtpAndGetToken = async (otp: string): Promise<string> => {
    if (!phoneConfirmationResult) {
        throw new Error("OTP verification has not been initiated. Please enter your phone number first.");
    }
    
    const userCredential: UserCredential = await phoneConfirmationResult.confirm(otp);
    if (!userCredential.user) {
        throw new Error("Could not verify user after OTP confirmation.");
    }
    
    // Get the ID token, which proves the user's identity to your backend
    const idToken = await userCredential.user.getIdToken(true);
    return idToken;
};


/**
 * Initiates the Google Sign-In flow using a popup window.
 * @returns A promise that resolves with the Firebase ID token.
 */
export const signInWithGoogleAndGetToken = async (): Promise<string> => {
    // Use v8 syntax for GoogleAuthProvider and signInWithPopup.
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    
    if (!result.user) {
        throw new Error("Could not sign in with Google.");
    }

    const idToken = await result.user.getIdToken(true);
    return idToken;
};

/**
 * Gets the current user's ID token, refreshing it if necessary.
 * This is useful for authenticating subsequent backend requests, like during registration.
 * @returns A promise that resolves with the ID token, or null if no user is signed in.
 */
export const getCurrentUserIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) {
        return null;
    }
    return auth.currentUser.getIdToken(true); // `true` forces a refresh
};