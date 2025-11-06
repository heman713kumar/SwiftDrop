import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { AppStep, OrderDetails, ServiceCategory, LocationInfo, PackageDetails, Store, UserProfile, PriceBreakdown, MovingDetails, BusinessLogisticsDetails, DeliveryTier } from './types.ts';
import Header from './components/Header.tsx';
import Notifications from './components/Notifications.tsx';
import RealtimeNotification from './components/RealtimeNotification.tsx';
import LoginStep from './components/steps/LoginStep.tsx';
import OtpStep from './components/steps/OtpStep.tsx';
import EmailRegistrationStep from './components/steps/EmailRegistrationStep.tsx';
import ServiceSelectionStep from './components/steps/ServiceSelectionStep.tsx';
import StoreSelectionStep from './components/steps/StoreSelectionStep.tsx';
import LocationInputStep from './components/steps/LocationInputStep.tsx';
import PackageDetailsStep from './components/steps/PackageDetailsStep.tsx';
import ConfirmationStep from './components/steps/ConfirmationStep.tsx';
import * as apiService from './services/apiService.ts';
import * as firebaseService from './services/firebaseService.ts';
import { useTranslation } from './contexts/LanguageContext.tsx';
import { SpinnerIcon } from './components/icons.tsx';
import StepIndicator from './components/StepIndicator.tsx';

const App: React.FC = () => {
    const [appStep, setAppStep] = useState<AppStep>(AppStep.LOGIN);
    const [orderDetails, setOrderDetails] = useState<OrderDetails>({
        serviceType: null,
        pickupLocation: null,
        deliveryLocation: null,
        packageDetails: null,
    });
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isInitialising, setIsInitialising] = useState(true);
    const [apiError, setApiError] = useState<{ title: string; message: string; link?: string; linkText?: string; } | null>(null);
    const [loginPhoneNumber, setLoginPhoneNumber] = useState<string>('');
    const [notificationHandler, setNotificationHandler] = useState<((title: string, body: string) => void) | null>(null);
    const [realtimeMessage, setRealtimeMessage] = useState<string | null>(null);
    const [otpNotification, setOtpNotification] = useState<string>('');
    const [resendCooldown, setResendCooldown] = useState<number>(0);
    const socketRef = useRef<Socket | null>(null);

    const { t } = useTranslation();

    const orderFlowSteps = useMemo(() => [
        { step: AppStep.LOCATION_INPUT, label: 'Location' },
        { step: AppStep.PACKAGE_DETAILS, label: 'Details' },
        { step: AppStep.CONFIRMATION, label: 'Confirm' },
    ], []);
    
    const isOrderFlow = useMemo(() => 
        orderFlowSteps.some(s => s.step === appStep),
        [appStep, orderFlowSteps]
    );

    const resetOrder = useCallback(() => {
        setOrderDetails({
            serviceType: null,
            pickupLocation: null,
            deliveryLocation: null,
            packageDetails: null,
        });
        setAppStep(AppStep.SERVICE_SELECTION);
    }, []);
    
    const handleBackendLogin = useCallback(async (idToken: string) => {
        const response = await apiService.verifyFirebaseToken(idToken);
        if (response.isNewUser) {
            setAppStep(AppStep.EMAIL_REGISTRATION);
        } else {
            setUserProfile(response.user!);
            setAppStep(AppStep.SERVICE_SELECTION);
        }
    }, []);

    const initializeAndLogin = useCallback(async () => {
        setIsInitialising(true);
        setApiError(null);
        try {
            // The redirect flow was incompatible with the execution environment.
            // It has been replaced by the popup flow, so we no longer need to
            // check for a redirect result on initialization. We just check for an existing session.
            if (apiService.getAuthToken()) {
                const profile = await apiService.getUserProfile();
                setUserProfile(profile);
                setAppStep(AppStep.SERVICE_SELECTION);
            } else {
                setAppStep(AppStep.LOGIN);
            }
        } catch (error: any) {
            console.error("Initialization failed:", error);
            // If profile fetch fails (e.g., expired token), log out and go to login.
            await apiService.logout();
            setAppStep(AppStep.LOGIN);
        } finally {
            setIsInitialising(false);
        }
    }, []);

    useEffect(() => {
        initializeAndLogin();
    }, [initializeAndLogin]);

    useEffect(() => {
        const token = apiService.getAuthToken();
        if (token && userProfile) {
            const socketUrl = apiService.getSocketUrl();
            socketRef.current = io(socketUrl, { auth: { token } });
            socketRef.current.on('connect', () => console.log('[Socket.io] Client connected:', socketRef.current?.id));
            socketRef.current.on('partner.assigned', (payload) => setRealtimeMessage(`Rider ${payload.partner.name} assigned! ETA: ${payload.etaMinutes} mins.`));
            socketRef.current.on('partner.on_the_way', (payload) => setRealtimeMessage(payload.message));
            socketRef.current.on('delivery.completed', (payload) => setRealtimeMessage(payload.message));
        } else {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [userProfile]);

    useEffect(() => {
        if (realtimeMessage) {
            const timer = setTimeout(() => setRealtimeMessage(null), 6000);
            return () => clearTimeout(timer);
        }
    }, [realtimeMessage]);

    useEffect(() => {
        let timer: number;
        if (resendCooldown > 0) {
            timer = window.setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => window.clearTimeout(timer);
    }, [resendCooldown]);
    
    const sendOtp = async (phone: string): Promise<boolean> => {
        setIsLoading(true);
        setApiError(null);
        setOtpNotification('');
        try {
            await firebaseService.sendOtpToPhone(phone);
            setLoginPhoneNumber(phone);
            setIsLoading(false);
            return true;
        } catch (error: any) {
            console.error("Firebase phone auth error:", error);
            let errorTitle = t('login.error.otpTitle');
            let friendlyMessage = t('login.error.otpGeneric');
            let link, linkText;

            if (error.code === 'auth/invalid-phone-number') friendlyMessage = t('login.error.otpInvalidNumber');
            else if (error.code === 'auth/too-many-requests') friendlyMessage = t('login.error.otpTooManyRequests');
            else if (error.code === 'auth/internal-error' || error.message.includes("reCAPTCHA")) {
                errorTitle = t('login.error.configTitle');
                friendlyMessage = t('login.error.configDomain');
                const config = firebaseService.getFirebaseConfig();
                if (config) {
                   link = `https://console.firebase.google.com/project/${config.projectId}/authentication/settings`;
                   linkText = t('login.error.fixConfigLink');
                }
            }
            setApiError({ title: errorTitle, message: friendlyMessage, link, linkText });
            setIsLoading(false);
            return false;
        }
    };

    const handlePhoneNumberSubmit = async (phone: string) => {
        if (await sendOtp(phone)) {
            setAppStep(AppStep.OTP_VERIFICATION);
            setResendCooldown(30);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        if (await sendOtp(loginPhoneNumber)) {
            setOtpNotification(t('otp.resendSuccess'));
            setResendCooldown(30);
        }
    };

    const handleOtpVerify = async (otp: string) => {
        setIsLoading(true);
        setApiError(null);
        try {
            const idToken = await firebaseService.verifyOtpAndGetToken(otp);
            await handleBackendLogin(idToken);
        } catch (error: any) {
            console.error("OTP verification failed:", error);
            setApiError({ title: t('otp.errorTitle'), message: t('otp.error') });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setApiError(null);
        try {
            // Use the popup flow which is better for embedded/sandboxed environments.
            const idToken = await firebaseService.signInWithGooglePopup();
            if (idToken) {
                await handleBackendLogin(idToken);
            }
            // If idToken is null, the user closed the popup. Do nothing.
        } catch (error: any) {
            console.error("Google Sign-In popup failed:", error);
            let errorTitle = t('login.error.googleTitle');
            let friendlyMessage = t('login.error.googleGeneric');
    
            if (error.code === 'auth/popup-closed-by-user') {
                friendlyMessage = t('login.error.googlePopupClosed');
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                friendlyMessage = "An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.";
            }
            
            setApiError({ title: errorTitle, message: friendlyMessage });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleRegistrationComplete = async (fullName: string, email: string, photo: File | null) => {
         setIsLoading(true);
         setApiError(null);
         try {
            const response = await apiService.register(fullName, email, photo);
            setUserProfile(response.user!);
            setAppStep(AppStep.SERVICE_SELECTION);
         } catch (error: any) {
             setApiError({ title: 'Registration Failed', message: error.message || 'An unknown error occurred.' });
         } finally {
            setIsLoading(false);
         }
    };

    const handleSignOut = async () => {
        await apiService.logout();
        setUserProfile(null);
        setAppStep(AppStep.LOGIN);
    };

    const handleServiceSelect = (service: ServiceCategory) => {
        setOrderDetails(prev => ({ ...prev, serviceType: service }));
        const nextStep = (service === ServiceCategory.Food || service === ServiceCategory.Grocery)
            ? AppStep.STORE_SELECTION
            : AppStep.LOCATION_INPUT;
        setAppStep(nextStep);
    };

    const handleStoreSelect = (store: Store) => {
        setOrderDetails(prev => ({ ...prev, store }));
        setAppStep(AppStep.LOCATION_INPUT);
    };
    
    const setPickupLocation = (location: LocationInfo) => setOrderDetails(prev => ({ ...prev, pickupLocation: location }));
    const setDeliveryLocation = (location: LocationInfo) => setOrderDetails(prev => ({ ...prev, deliveryLocation: location }));

    const handleLocationNext = () => {
        const nextStep = (orderDetails.serviceType === ServiceCategory.Package || orderDetails.serviceType === ServiceCategory.Document || orderDetails.serviceType === ServiceCategory.Heavy)
            ? AppStep.PACKAGE_DETAILS
            : AppStep.CONFIRMATION;
        if (nextStep === AppStep.CONFIRMATION) calculatePriceAndProceed(null);
        else setAppStep(nextStep);
    };
    
    const calculatePriceAndProceed = (details: PackageDetails | MovingDetails | BusinessLogisticsDetails | null) => {
        let updatedDetails = { ...orderDetails };
        if (details && 'description' in details) {
             updatedDetails = { ...updatedDetails, packageDetails: details as PackageDetails };
        }

        const price: PriceBreakdown = {
            baseFare: 20.00,
            distanceFee: 15.50,
            weightFee: (updatedDetails.packageDetails?.weight === '5-10kg') ? 10.00 : 5.00,
            tierSurcharge: 0,
            serviceFee: 2.50,
            subtotal: 0,
            total: 0,
        };
        price.subtotal = price.baseFare + price.distanceFee + price.weightFee + price.serviceFee;
        price.total = price.subtotal;
        
        setOrderDetails({ ...updatedDetails, priceBreakdown: price });
        setAppStep(AppStep.CONFIRMATION);
    }

    const handleDetailsNext = (details: PackageDetails | MovingDetails | BusinessLogisticsDetails | null) => {
        calculatePriceAndProceed(details);
    };

    const handleTierSelect = (tier: DeliveryTier) => {
        const tierSurcharges = {
            [DeliveryTier.Express]: 15.00,
            [DeliveryTier.SameDay]: 5.00,
            [DeliveryTier.Scheduled]: 2.00,
            [DeliveryTier.Economy]: 0,
        };
        setOrderDetails(prev => {
            if (!prev.priceBreakdown) return prev;
            const newSurcharge = tierSurcharges[tier];
            const newTotal = prev.priceBreakdown.subtotal + newSurcharge;
            return {
                ...prev, deliveryTier: tier,
                priceBreakdown: { ...prev.priceBreakdown, tierSurcharge: newSurcharge, total: newTotal }
            }
        });
    };

    const handleConfirmOrder = () => {
        console.log("Order Confirmed:", orderDetails);
        if (notificationHandler) {
            notificationHandler(t('notifications.paymentSuccess.title'), t('notifications.paymentSuccess.body'));
        }
        resetOrder();
    };

    const renderStep = () => {
        switch (appStep) {
            case AppStep.LOGIN:
                return <LoginStep onPhoneNumberSubmit={handlePhoneNumberSubmit} onGoogleLogin={handleGoogleLogin} isLoading={isLoading} isGoogleLoading={isGoogleLoading} apiError={apiError} />;
            case AppStep.OTP_VERIFICATION:
                return <OtpStep phoneNumber={loginPhoneNumber} onVerify={handleOtpVerify} onBack={() => { setApiError(null); setAppStep(AppStep.LOGIN); }} onResend={handleResendOtp} isError={!!apiError && !otpNotification} isLoading={isLoading} resendCooldown={resendCooldown} notification={otpNotification} />;
            case AppStep.EMAIL_REGISTRATION:
                 return <EmailRegistrationStep onComplete={handleRegistrationComplete} onBack={() => setAppStep(AppStep.LOGIN)} isLoading={isLoading} />;
            case AppStep.SERVICE_SELECTION:
                return <ServiceSelectionStep onSelect={handleServiceSelect} />;
            case AppStep.STORE_SELECTION:
                return <StoreSelectionStep onStoreSelect={handleStoreSelect} onBack={() => setAppStep(AppStep.SERVICE_SELECTION)} />;
            case AppStep.LOCATION_INPUT:
                const locationBackStep = (orderDetails.serviceType === ServiceCategory.Food || orderDetails.serviceType === ServiceCategory.Grocery) ? AppStep.STORE_SELECTION : AppStep.SERVICE_SELECTION;
                return <LocationInputStep onNext={handleLocationNext} onBack={() => setAppStep(locationBackStep)} setPickupLocation={setPickupLocation} setDeliveryLocation={setDeliveryLocation} orderDetails={orderDetails} />;
            case AppStep.PACKAGE_DETAILS:
                return <PackageDetailsStep onNext={handleDetailsNext} onBack={() => setAppStep(AppStep.LOCATION_INPUT)} initialDetails={orderDetails.packageDetails} />;
            case AppStep.CONFIRMATION:
                 const confBackStep = orderDetails.packageDetails ? AppStep.PACKAGE_DETAILS : AppStep.LOCATION_INPUT;
                return userProfile ? <ConfirmationStep orderDetails={orderDetails} onConfirm={handleConfirmOrder} onBack={() => setAppStep(confBackStep)} userProfile={userProfile} onTierSelect={handleTierSelect} /> : null;
            default:
                return <div>Coming Soon</div>;
        }
    };
    
    return (
        <div className="bg-slate-50 min-h-screen">
            <Header userProfile={userProfile} onShowSettings={() => setAppStep(AppStep.SETTINGS)} onSignOut={handleSignOut} />
            <Notifications onNotificationGranted={setNotificationHandler} />
            <RealtimeNotification message={realtimeMessage} onClose={() => setRealtimeMessage(null)} />
            {isInitialising ? (
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <div className="text-center">
                        <SpinnerIcon className="h-12 w-12 text-red-700 mx-auto" />
                        <p className="mt-4 text-slate-600">{t('common.loading')}</p>
                    </div>
                </div>
            ) : (
                <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-8">
                        {isOrderFlow && (
                            <div className="flex justify-center">
                                <StepIndicator currentStep={appStep} steps={orderFlowSteps} />
                            </div>
                        )}
                        {renderStep()}
                    </div>
                </main>
            )}
        </div>
    );
};

export default App;
