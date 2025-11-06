// This service encapsulates all Firebase Authentication logic for the frontend.
// It provides a clean, production-ready interface for the main App component.
// UPDATED: Refactored to use signInWithPopup, which is compatible with sandboxed environments.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// Define types based on the firebase v8 namespace
type FirebaseApp = firebase.app.App;
type Auth = firebase.auth.Auth;
type RecaptchaVerifier = firebase.auth.RecaptchaVerifier;
type ConfirmationResult = firebase.auth.ConfirmationResult;
type UserCredential = firebase.auth.UserCredential;

// This configuration now matches your 'sdrop-authentication-project'.
const firebaseConfigProvided = {
  apiKey: "AIzaSyCDTq_BcnQUpFCCKSvven6vQjxUa9GpbJg",
  authDomain: "sdrop-authentication-project.firebaseapp.com",
  projectId: "sdrop-authentication-project",
  storageBucket: "sdrop-authentication-project.firebasestorage.app",
  messagingSenderId: "141416292469",
  appId: "1:141416292469:web:3808098570668b1f70d83c",
  measurementId: "G-P37LTZ2JNR"
};

let recaptchaVerifier: RecaptchaVerifier | null = null;
let auth: Auth;
let firebaseConfig: any;

// Self-initialize on module load
(() => {
    if (typeof window !== 'undefined' && firebaseConfigProvided.apiKey) {
        if (!firebase.apps.length) {
            const app: FirebaseApp = firebase.initializeApp(firebaseConfigProvided);
            auth = firebase.auth(app);
            firebaseConfig = firebaseConfigProvided;
            console.log("Firebase initialized successfully for project:", firebaseConfig.projectId);
        } else {
            const app = firebase.app();
            auth = firebase.auth(app);
            firebaseConfig = app.options;
        }
    }
})();

export const getFirebaseConfig = () => firebaseConfig;

let phoneConfirmationResult: ConfirmationResult | null = null;

export const cleanupRecaptcha = () => {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
        const container = document.getElementById('recaptcha-container');
        if (container) {
            container.innerHTML = '';
        }
        console.log("reCAPTCHA verifier cleaned up.");
    }
};

export const sendOtpToPhone = async (phoneNumber: string): Promise<void> => {
    if (!auth) throw new Error("Firebase not initialized.");
    cleanupRecaptcha();
    try {
        const verifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': () => console.log("reCAPTCHA verification successful."),
            'expired-callback': () => console.log("reCAPTCHA expired.")
        });
        await verifier.render();
        recaptchaVerifier = verifier;
        phoneConfirmationResult = await auth.signInWithPhoneNumber(phoneNumber, verifier);
        console.log(`OTP sent to ${phoneNumber}`);
    } catch (error) {
        console.error("Error sending OTP:", error);
        cleanupRecaptcha();
        throw error;
    }
};

export const verifyOtpAndGetToken = async (otp: string): Promise<string> => {
    if (!phoneConfirmationResult) {
        throw new Error("OTP verification has not been initiated.");
    }
    const userCredential: UserCredential = await phoneConfirmationResult.confirm(otp);
    if (!userCredential.user) {
        throw new Error("Could not verify user after OTP confirmation.");
    }
    return await userCredential.user.getIdToken(true);
};

/**
 * Initiates the Google Sign-In flow using a popup window. This is more compatible
 * with sandboxed environments than the redirect method.
 * @returns A promise that resolves with the Firebase ID token if successful, otherwise null.
 */
export const signInWithGooglePopup = async (): Promise<string | null> => {
    if (!auth) throw new Error("Firebase not initialized.");
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        if (result.user) {
            const idToken = await result.user.getIdToken(true);
            return idToken;
        }
        return null;
    } catch (error) {
        console.error("Error with Google Popup Sign-In:", error);
        throw error; // Re-throw to be handled by the UI
    }
};

export const getCurrentUserIdToken = async (): Promise<string | null> => {
    if (!auth || !auth.currentUser) {
        return null;
    }
    return auth.currentUser.getIdToken(true); // `true` forces a refresh
};
