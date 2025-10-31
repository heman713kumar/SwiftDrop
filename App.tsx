import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { AppStep, OrderDetails, ServiceCategory, LocationInfo, PackageDetails, Store, MenuItem, CartItem, UserProfile, PaymentMethod, DeliveryTier, PriceBreakdown, MovingDetails, PropertyType, BusinessLogisticsDetails, VehicleType, TripType, OrderHistoryItem, OrderStatus, TrackingData } from './types';
import { SERVICE_TYPES, MOCK_RESTAURANTS, MOCK_MENUS } from './constants';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import LocationInput from './components/LocationInput';
import Notifications from './components/Notifications';
import * as whatsappService from './services/whatsappService';
import * as geminiService from './services/geminiService';
import * as apiService from './services/apiService';
import * as firebaseService from './services/firebaseService';
import { useTranslation } from './contexts/LanguageContext';
import { ChevronRightIcon, ArrowLeftIcon, StarIcon, ShoppingCartIcon, PackageIcon, CalendarIcon, MotorcycleIcon, PhoneIcon, ChatBubbleIcon, UserIcon, MailIcon, CameraIcon, CreditCardIcon, CashIcon, DevicePhoneMobileIcon, GoogleIcon, BanknotesIcon, BuildingOfficeIcon, SmsIcon, WhatsAppIcon, HomeIcon, BuildingStorefrontIcon, TruckIcon, RouteOptimizationIcon, BellIcon, MapPinIcon, ArrowRightOnRectangleIcon, FoodIcon, GroceryIcon, PharmacyIcon, HeavyItemIcon, DocumentIcon, ClipboardDocumentListIcon, SpinnerIcon, ExclamationTriangleIcon } from './components/icons';

// --- CHILD COMPONENTS ---

const RealtimeNotification: React.FC<{ message: string | null; onClose: () => void; }> = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="fixed top-20 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up w-11/12 max-w-sm" role="alert">
            <div className="flex">
                <div className="py-1"><svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
                <div>
                    <p className="font-bold">Live Update</p>
                    <p className="text-sm">{message}</p>
                </div>
                <button onClick={onClose} className="absolute top-0 right-0 mt-2 mr-2 text-green-700 hover:text-green-900">
                     <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    children?: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full animate-fade-in-up">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{message}</p>
                {children}
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-md hover:bg-red-800">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};


const LoginStep: React.FC<{ 
    onPhoneNumberSubmit: (phone: string) => void;
    onGoogleLogin: () => void; 
    isLoading: boolean;
    isGoogleLoading: boolean;
    apiError: string | null;
}> = ({ onPhoneNumberSubmit, onGoogleLogin, isLoading, isGoogleLoading, apiError }) => {
    const [countryCode, setCountryCode] = useState('+233');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    const maxLength = countryCode === '+233' ? 9 : 10;

    useEffect(() => {
        // Initialize Firebase reCAPTCHA when the component mounts
        try {
            firebaseService.setupRecaptcha('recaptcha-container');
            console.log("reCAPTCHA verifier initialized.");
        } catch (err) {
            console.error("Error setting up reCAPTCHA", err);
            setError("Could not set up login verification. Please refresh the page.");
        }
    }, []);

    useEffect(() => {
        if (!phone) {
            setError(null);
            return;
        }

        let isValid = false;
        let errorMessageKey = '';

        if (countryCode === '+233') {
            const ghanaRegex = /^(2[03467]|5[045679])\d{7}$/;
            isValid = ghanaRegex.test(phone);
            errorMessageKey = 'login.phoneError.ghanaInvalid';
        } else if (countryCode === '+44') {
            const ukRegex = /^7[1-9]\d{8}$/;
            isValid = ukRegex.test(phone);
            errorMessageKey = 'login.phoneError.ukInvalid';
        }

        if (isValid) {
            setError(null);
        } else {
            setError(t(errorMessageKey));
        }
    }, [phone, countryCode, t]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone && !error) {
            onPhoneNumberSubmit(countryCode + phone);
        } else if (!phone) {
            const errorMessageKey = countryCode === '+233' ? 'login.phoneError.ghanaInvalid' : 'login.phoneError.ukInvalid';
            setError(t(errorMessageKey));
        }
    };

    return (
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <PackageIcon className="h-10 w-10 text-red-700" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-800">{t('login.welcomeTitle')}</h2>
            <p className="mt-2 text-slate-600">{t('login.welcomeSubtitle')}</p>
            
            <button
                type="button"
                onClick={onGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className="mt-8 w-full flex justify-center items-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-md font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
                {isGoogleLoading ? (
                    <>
                        <SpinnerIcon className="h-5 w-5 mr-3" />
                        {t('login.googleLoading')}
                    </>
                ) : (
                    <>
                        <GoogleIcon className="h-5 w-5 mr-3" />
                        {t('login.googleButton')}
                    </>
                )}
            </button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">{t('login.orSeparator')}</span>
                </div>
            </div>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-left">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="phone-number" className="sr-only">{t('login.phoneNumberLabel')}</label>
                    <div className="flex rounded-lg shadow-sm">
                        <div className="relative flex-shrink-0">
                             <select
                                aria-label="Country code"
                                value={countryCode}
                                onChange={(e) => {
                                    setCountryCode(e.target.value);
                                    setPhone(''); 
                                    setError(null);
                                }}
                                className="h-full bg-slate-50 border border-r-0 border-slate-300 rounded-l-lg pl-3 pr-8 text-slate-600 sm:text-sm focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="+233">GH +233</option>
                                <option value="+44">UK +44</option>
                            </select>
                        </div>
                        <input
                            type="tel"
                            name="phone-number"
                            id="phone-number"
                            className={`focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-slate-300 rounded-r-lg py-3 px-4 ${error ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            placeholder={countryCode === '+233' ? "24 123 4567" : "7123 456789"}
                            value={phone}
                            onChange={(e) => {
                                const digitsOnly = e.target.value.replace(/\D/g, '');
                                if (digitsOnly.length <= maxLength) {
                                    setPhone(digitsOnly);
                                }
                            }}
                            required
                            maxLength={maxLength}
                        />
                    </div>
                     {error && <p className="mt-2 text-sm text-red-600 text-left">{error}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 transition-colors"
                >
                    {isLoading ? <SpinnerIcon className="h-6 w-6 text-white" /> : t('common.continue')}
                </button>
            </form>
        </div>
    );
};

const OtpStep: React.FC<{
    phoneNumber: string;
    onVerify: (otp: string) => void;
    onBack: () => void;
    isError: boolean;
    isLoading: boolean;
}> = ({ phoneNumber, onVerify, onBack, isError, isLoading }) => {
    const [otp, setOtp] = useState('');
    const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length === 6) {
            onVerify(otp);
        }
    };
    
    return (
        <div className="text-center">
             <h2 className="text-2xl font-bold text-slate-800">{t('otp.title')}</h2>
            <p className="mt-2 text-slate-600">{t('otp.subtitle', { phoneNumber })}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                 <div>
                    <label htmlFor="otp" className="sr-only">{t('otp.label')}</label>
                    <input
                        type="tel"
                        name="otp"
                        id="otp"
                        className={`w-full text-center text-2xl tracking-[1em] focus:ring-red-500 focus:border-red-500 block border-slate-300 rounded-lg py-3 ${isError ? 'border-red-500' : ''}`}
                        placeholder="------"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        autoComplete="one-time-code"
                    />
                </div>
                 {isError && <p className="text-sm text-red-600">{t('otp.error')}</p>}
                 <button
                    type="submit"
                    disabled={otp.length < 6 || isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 transition-colors"
                >
                     {isLoading ? <SpinnerIcon className="h-6 w-6 text-white" /> : t('otp.verifyButton')}
                </button>
            </form>

            <div className="mt-6 text-sm text-center">
                <p className="text-slate-500">
                    {t('otp.noCode')}{' '}
                    <button className="font-medium text-red-700 hover:text-red-600">{t('otp.resend')}</button>
                </p>
                <button onClick={onBack} className="mt-2 font-medium text-slate-600 hover:text-slate-800">
                    {t('otp.changeNumber')}
                </button>
            </div>
        </div>
    );
};

const EmailRegistrationStep: React.FC<{
    onComplete: (fullName: string, email: string, photo: File | null) => void;
    onBack: () => void;
    isLoading: boolean;
}> = ({ onComplete, onBack, isLoading }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const { t } = useTranslation();

    const isFormValid = fullName.trim().length > 2 && email.includes('@') && email.includes('.');

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            onComplete(fullName, email, photoFile);
        }
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">{t('register.title')}</h2>
            <p className="mt-2 text-slate-600">{t('register.subtitle')}</p>

             <div className="mt-8 flex flex-col items-center">
                <div className="relative">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Profile Preview" className="h-24 w-24 rounded-full object-cover" />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center">
                            <UserIcon className="h-12 w-12 text-slate-500" />
                        </div>
                    )}
                    <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 bg-red-700 p-2 rounded-full cursor-pointer hover:bg-red-800 transition-colors">
                        <CameraIcon className="h-5 w-5 text-white" />
                        <input id="photo-upload" name="photo-upload" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" />
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                    <label htmlFor="full-name" className="sr-only">{t('register.fullNameLabel')}</label>
                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <UserIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            name="full-name"
                            id="full-name"
                            className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3"
                            placeholder={t('register.fullNamePlaceholder')}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="email" className="sr-only">{t('register.emailLabel')}</label>
                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MailIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3"
                            placeholder={t('register.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 transition-colors"
                >
                    {isLoading ? <SpinnerIcon className="h-6 w-6 text-white" /> : t('register.finishButton')}
                </button>
            </form>

             <div className="mt-6 text-sm text-center">
                <button onClick={onBack} className="mt-2 font-medium text-slate-600 hover:text-slate-800">
                    &larr; {t('common.goBack')}
                </button>
            </div>
        </div>
    );
};

const ServiceSelectionStep: React.FC<{ onSelect: (service: ServiceCategory) => void }> = ({ onSelect }) => {
    const { t } = useTranslation();
    
    // Create a mapping for translation keys
    const serviceTranslationKeys: { [key in ServiceCategory]: { title: string, desc: string } } = {
        [ServiceCategory.Food]: { title: 'services.food.title', desc: 'services.food.desc' },
        [ServiceCategory.Grocery]: { title: 'services.grocery.title', desc: 'services.grocery.desc' },
        [ServiceCategory.Pharmacy]: { title: 'services.pharmacy.title', desc: 'services.pharmacy.desc' },
        [ServiceCategory.Package]: { title: 'services.package.title', desc: 'services.package.desc' },
        [ServiceCategory.Document]: { title: 'services.document.title', desc: 'services.document.desc' },
        [ServiceCategory.Heavy]: { title: 'services.heavy.title', desc: 'services.heavy.desc' },
        [ServiceCategory.Moving]: { title: 'services.moving.title', desc: 'services.moving.desc' },
        [ServiceCategory.BusinessLogistics]: { title: 'services.business.title', desc: 'services.business.desc' },
    };

    return (
        <div>
            <h2 className="text-center text-2xl font-bold text-slate-800">{t('services.title')}</h2>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                {SERVICE_TYPES.map(service => (
                    <button
                        key={service.category}
                        onClick={() => onSelect(service.category)}
                        className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-red-500 hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                            <service.icon className="h-8 w-8 text-red-700" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-slate-800 text-center">{t(serviceTranslationKeys[service.category].title)}</h3>
                        <p className="mt-1 text-xs text-slate-500 text-center hidden sm:block">{t(serviceTranslationKeys[service.category].desc)}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const StoreSelectionStep: React.FC<{
  onStoreSelect: (store: Store) => void;
  onBack: () => void;
}> = ({ onStoreSelect, onBack }) => {
  const { t } = useTranslation();
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const cuisines = useMemo(() => {
    const allCuisines = MOCK_RESTAURANTS.flatMap(r => r.cuisine.split(',').map(c => c.trim()));
    return ['All', ...Array.from(new Set(allCuisines))];
  }, []);

  const filteredAndSortedStores = useMemo(() => {
    let result = MOCK_RESTAURANTS;

    if (selectedCuisine !== 'All') {
      result = result.filter(store => store.cuisine.includes(selectedCuisine));
    }

    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedCuisine, sortBy]);

  return (
    <div>
      <h2 className="text-center text-2xl font-bold text-slate-800">{t('storeSelection.title')}</h2>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-slate-100 rounded-lg">
        <div className="w-full sm:w-1/2">
          <label htmlFor="cuisine-filter" className="text-sm font-medium text-slate-700 block mb-1">{t('storeSelection.filterByCuisine')}</label>
          <select
            id="cuisine-filter"
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md shadow-sm"
          >
            {cuisines.map(c => <option key={c} value={c}>{c === 'All' ? t('storeSelection.allCuisines') : c}</option>)}
          </select>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center pt-2 sm:pt-6">
          <button
            onClick={() => setSortBy('rating')}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${sortBy === 'rating' ? 'bg-red-700 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-50 border'}`}
          >
            {t('storeSelection.sortByRating')}
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAndSortedStores.map(store => (
          <div key={store.id} onClick={() => onStoreSelect(store)} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-red-500 transition-all duration-300 group">
            <div className="h-40 bg-slate-200">
              <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-red-700">{store.name}</h3>
                  <div className="flex items-center bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      <StarIcon className="w-3 h-3 mr-1 text-yellow-500" />
                      {store.rating.toFixed(1)}
                  </div>
              </div>
              <p className="mt-1 text-sm text-slate-500">{store.cuisine}</p>
            </div>
          </div>
        ))}
        {filteredAndSortedStores.length === 0 && (
            <div className="md:col-span-2 text-center py-10">
                <p className="text-slate-500">No stores match your criteria.</p>
            </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="flex items-center justify-center py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-md font-medium text-slate-700 bg-white hover:bg-slate-50">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {t('common.back')}
        </button>
      </div>
    </div>
  );
};


const LocationInputStep: React.FC<{
  onNext: () => void;
  onBack: () => void;
  setPickupLocation: (location: LocationInfo) => void;
  setDeliveryLocation: (location: LocationInfo) => void;
  orderDetails: OrderDetails;
}> = ({ onNext, onBack, setPickupLocation, setDeliveryLocation, orderDetails }) => {
    const [showPickupError, setShowPickupError] = useState(false);
    const [showDeliveryError, setShowDeliveryError] = useState(false);
    const { t } = useTranslation();

    const handleNext = () => {
        const pickupValid = orderDetails.pickupLocation?.validated || false;
        const deliveryValid = orderDetails.deliveryLocation?.validated || false;
        setShowPickupError(!pickupValid);
        setShowDeliveryError(!deliveryValid);

        if(pickupValid && deliveryValid) {
            onNext();
        }
    }
    return (
        <div>
             <h2 className="text-center text-2xl font-bold text-slate-800">{t('location.title')}</h2>
             <p className="text-center text-slate-600 mt-2">{t('location.subtitle')}</p>

            <div className="mt-8 space-y-4 flex flex-col items-center">
                <LocationInput 
                    label={t('location.pickupLabel')}
                    onLocationSelect={setPickupLocation} 
                    initialValue={orderDetails.pickupLocation}
                    showValidationError={showPickupError}
                />
                <div className="h-8 w-px bg-slate-300 border border-dashed"></div>
                <LocationInput 
                    label={t('location.deliveryLabel')}
                    onLocationSelect={setDeliveryLocation} 
                    initialValue={orderDetails.deliveryLocation}
                    showValidationError={showDeliveryError}
                />
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={onBack} className="flex items-center justify-center py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-md font-medium text-slate-700 bg-white hover:bg-slate-50">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    {t('common.back')}
                </button>
                <button onClick={handleNext} className="flex items-center justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-red-700 hover:bg-red-800">
                    {t('common.next')}
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                </button>
            </div>
        </div>
    );
}

const PackageDetailsStep: React.FC<{
  onNext: (details: PackageDetails) => void;
  onBack: () => void;
  initialDetails: PackageDetails | null;
}> = ({ onNext, onBack, initialDetails }) => {
    const [description, setDescription] = useState(initialDetails?.description || '');
    const [weight, setWeight] = useState(initialDetails?.weight || '0-2kg');
    const [specialInstructions, setSpecialInstructions] = useState(initialDetails?.specialInstructions || '');
    const { t } = useTranslation();

    const handleNext = () => {
        if (description.trim()) {
            onNext({
                description,
                weight,
                specialInstructions,
                // other fields are not implemented in this UI
            });
        }
    };
    
    const weightOptions = ['0-2kg', '2-5kg', '5-10kg', '>10kg'];

    return (
        <div>
            <h2 className="text-center text-2xl font-bold text-slate-800">{t('packageDetails.title')}</h2>
            <p className="text-center text-slate-600 mt-2">{t('packageDetails.subtitle')}</p>
            <div className="mt-8 space-y-6">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700">{t('packageDetails.descriptionLabel')}</label>
                    <textarea
                        id="description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder={t('packageDetails.descriptionPlaceholder')}
                    />
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-slate-700">{t('packageDetails.weightLabel')}</label>
                    <select
                        id="weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                    >
                        {weightOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-8 flex justify-between">
                <button onClick={onBack} className="flex items-center justify-center py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-md font-medium text-slate-700 bg-white hover:bg-slate-50">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    {t('common.back')}
                </button>
                <button onClick={handleNext} disabled={!description.trim()} className="flex items-center justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-red-700 hover:bg-red-800 disabled:bg-red-300">
                    {t('common.next')}
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                </button>
            </div>
        </div>
    );
};


const ConfirmationStep: React.FC<{
  orderDetails: OrderDetails;
  onConfirm: () => void;
  onBack: () => void;
  userProfile: UserProfile;
  onTierSelect: (tier: DeliveryTier) => void;
}> = ({ orderDetails, onConfirm, onBack, userProfile, onTierSelect }) => {
    const { serviceType, pickupLocation, deliveryLocation, packageDetails, movingDetails, businessLogisticsDetails, store, priceBreakdown, deliveryTier } = orderDetails;
    const { t } = useTranslation();

    const serviceTranslationKeys: { [key in ServiceCategory]: string } = {
        [ServiceCategory.Food]: 'services.food.title',
        [ServiceCategory.Grocery]: 'services.grocery.title',
        [ServiceCategory.Pharmacy]: 'services.pharmacy.title',
        [ServiceCategory.Package]: 'services.package.title',
        [ServiceCategory.Document]: 'services.document.title',
        [ServiceCategory.Heavy]: 'services.heavy.title',
        [ServiceCategory.Moving]: 'services.moving.title',
        [ServiceCategory.BusinessLogistics]: 'services.business.title',
    };

    const tierDetails: { [key in DeliveryTier]: { icon: React.ComponentType<{className?: string}>, titleKey: string, descKey: string } } = {
        [DeliveryTier.Express]: { icon: MotorcycleIcon, titleKey: 'confirmation.tier.express.title', descKey: 'confirmation.tier.express.desc' },
        [DeliveryTier.SameDay]: { icon: CalendarIcon, titleKey: 'confirmation.tier.sameDay.title', descKey: 'confirmation.tier.sameDay.desc' },
        [DeliveryTier.Scheduled]: { icon: CalendarIcon, titleKey: 'confirmation.tier.scheduled.title', descKey: 'confirmation.tier.scheduled.desc' },
        [DeliveryTier.Economy]: { icon: PackageIcon, titleKey: 'confirmation.tier.economy.title', descKey: 'confirmation.tier.economy.desc' },
    };

    const isConfirmDisabled = !deliveryTier;

    return (
        <div>
            <h2 className="text-center text-2xl font-bold text-slate-800">{t('confirmation.title')}</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Order Summary */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">{t('confirmation.summaryTitle')}</h3>
                    <div className="text-sm space-y-3">
                         <div>
                            <span className="font-medium text-slate-500">{t('confirmation.serviceType')}:</span>
                            <span className="ml-2 text-slate-800 font-semibold">{t(serviceTranslationKeys[serviceType!])}</span>
                        </div>
                        {store && (
                             <div>
                                <span className="font-medium text-slate-500">{t('confirmation.store')}:</span>
                                <span className="ml-2 text-slate-800">{store.name}</span>
                            </div>
                        )}
                        <div>
                            <span className="font-medium text-slate-500">{t('confirmation.pickup')}:</span>
                            <span className="ml-2 text-slate-800">{pickupLocation?.address}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">{t('confirmation.delivery')}:</span>
                            <span className="ml-2 text-slate-800">{deliveryLocation?.address}</span>
                        </div>
                        {packageDetails && (
                            <>
                                <div className="font-medium text-slate-500 pt-2">{t('confirmation.packageDetails')}:</div>
                                <div className="pl-4 border-l-2 border-slate-200">
                                    <p><span className="font-medium">{t('confirmation.description')}:</span> {packageDetails.description}</p>
                                    <p><span className="font-medium">{t('confirmation.weight')}:</span> {packageDetails.weight}</p>
                                </div>
                            </>
                        )}
                        {movingDetails && (
                            <>
                                <div className="font-medium text-slate-500 pt-2">{t('confirmation.movingDetails')}:</div>
                                 <div className="pl-4 border-l-2 border-slate-200">
                                    <p><span className="font-medium">{t('confirmation.property')}:</span> {movingDetails.propertyType}</p>
                                     <p><span className="font-medium">{t('confirmation.pickupFloor')}:</span> {movingDetails.pickupFloor}</p>
                                </div>
                            </>
                        )}
                        {businessLogisticsDetails && (
                           <>
                                <div className="font-medium text-slate-500 pt-2">{t('confirmation.logisticsDetails')}:</div>
                                 <div className="pl-4 border-l-2 border-slate-200">
                                    <p><span className="font-medium">{t('confirmation.company')}:</span> {businessLogisticsDetails.businessName}</p>
                                     <p><span className="font-medium">{t('confirmation.vehicle')}:</span> {businessLogisticsDetails.vehicleType}</p>
                                </div>
                           </>
                        )}
                    </div>
                </div>

                {/* Right Side: Delivery Tier & Price */}
                <div className="space-y-6">
                    {/* Delivery Tier Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">{t('confirmation.tier.title')}</h3>
                        <div className="mt-4 space-y-3">
                            {/* FIX: Use a capitalized variable for the dynamic component to satisfy JSX syntax. */}
                            {Object.values(DeliveryTier).map(tier => {
                                const TierIcon = tierDetails[tier].icon;
                                return (
                                <button
                                    key={tier}
                                    onClick={() => onTierSelect(tier)}
                                    className={`w-full flex items-center p-3 rounded-lg border-2 text-left transition-all ${deliveryTier === tier ? 'bg-red-50 border-red-500 shadow-md' : 'bg-white border-slate-200 hover:border-red-300'}`}
                                >
                                    <div className="flex-shrink-0">
                                         <div className={`flex items-center justify-center h-10 w-10 rounded-full ${deliveryTier === tier ? 'bg-red-100' : 'bg-slate-100'}`}>
                                            <TierIcon className={`h-6 w-6 ${deliveryTier === tier ? 'text-red-700' : 'text-slate-500'}`} />
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-grow">
                                        <p className={`font-semibold ${deliveryTier === tier ? 'text-red-800' : 'text-slate-800'}`}>{t(tierDetails[tier].titleKey)}</p>
                                        <p className="text-xs text-slate-500">{t(tierDetails[tier].descKey)}</p>
                                    </div>
                                </button>
                            )})}
                        </div>
                    </div>
                    {/* Price Breakdown */}
                    {priceBreakdown && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">{t('confirmation.price.title')}</h3>
                            <div className="mt-4 text-sm space-y-2 text-slate-600">
                                <div className="flex justify-between"><span>{t('confirmation.price.baseFare')}</span><span>GH₵ {priceBreakdown.baseFare.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>{t('confirmation.price.distanceFee')}</span><span>GH₵ {priceBreakdown.distanceFee.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>{t('confirmation.price.weightFee')}</span><span>GH₵ {priceBreakdown.weightFee.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>{t('confirmation.price.tierSurcharge')}</span><span>GH₵ {priceBreakdown.tierSurcharge.toFixed(2)}</span></div>
                                <div className="flex justify-between border-t pt-2 mt-2"><span>{t('confirmation.price.serviceFee')}</span><span>GH₵ {priceBreakdown.serviceFee.toFixed(2)}</span></div>
                                <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t-2 border-slate-300 mt-2"><span>{t('confirmation.price.total')}</span><span>GH₵ {priceBreakdown.total.toFixed(2)}</span></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

             <div className="mt-10 flex justify-between">
                <button onClick={onBack} className="flex items-center justify-center py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-md font-medium text-slate-700 bg-white hover:bg-slate-50">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    {t('common.back')}
                </button>
                <button onClick={onConfirm} disabled={isConfirmDisabled} className="flex items-center justify-center py-3 px-8 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-red-700 hover:bg-red-800 disabled:bg-red-300">
                    {t('confirmation.confirmButton')}
                </button>
            </div>
        </div>
    );
};

// ... other child components like TrackingStep, SettingsStep, etc. will go here ...

// --- MAIN APP COMPONENT ---

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
    const [isInitialising, setIsInitialising] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [loginPhoneNumber, setLoginPhoneNumber] = useState<string>(''); // Used to pass phone number to OTP screen
    const [notificationHandler, setNotificationHandler] = useState<((title: string, body: string) => void) | null>(null);
    const [realtimeMessage, setRealtimeMessage] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const { t } = useTranslation();

    const resetOrder = useCallback(() => {
        setOrderDetails({
            serviceType: null,
            pickupLocation: null,
            deliveryLocation: null,
            packageDetails: null,
        });
        setAppStep(AppStep.SERVICE_SELECTION);
    }, []);

    // Effect to manage Socket.io connection
    useEffect(() => {
        const token = apiService.getAuthToken();

        if (token && userProfile) {
            // Connect
            socketRef.current = io({
                auth: { token }
            });

            socketRef.current.on('connect', () => {
                console.log('[Socket.io] Client connected:', socketRef.current?.id);
            });

            // Listen for real-time events
            socketRef.current.on('partner.assigned', (payload) => {
                setRealtimeMessage(`Rider ${payload.partner.name} assigned! ETA: ${payload.etaMinutes} mins.`);
            });

            socketRef.current.on('partner.on_the_way', (payload) => {
                setRealtimeMessage(payload.message);
            });

            socketRef.current.on('delivery.completed', (payload) => {
                setRealtimeMessage(payload.message);
            });

        } else {
            // Disconnect
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        }
        
        return () => {
            // Cleanup on component unmount or user profile change
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [userProfile]);

    // Effect to auto-hide the real-time notification
    useEffect(() => {
        if (realtimeMessage) {
            const timer = setTimeout(() => {
                setRealtimeMessage(null);
            }, 6000); // Hide after 6 seconds
            return () => clearTimeout(timer);
        }
    }, [realtimeMessage]);


    // Effect to check for existing auth token on app load
    useEffect(() => {
        const checkAuth = async () => {
            if (apiService.getAuthToken()) {
                try {
                    const profile = await apiService.getUserProfile();
                    setUserProfile(profile);
                    setAppStep(AppStep.SERVICE_SELECTION);
                } catch (error) {
                    console.error("Session expired or invalid, clearing.", error);
                    // Token might be invalid, so logout to clear it
                    await apiService.logout();
                    setAppStep(AppStep.LOGIN);
                }
            } else {
                 setAppStep(AppStep.LOGIN);
            }
            setIsInitialising(false);
        };
        checkAuth();
    }, []);

    const handleBackendLogin = async (idToken: string) => {
        const response = await apiService.verifyFirebaseToken(idToken);
        if (response.isNewUser) {
            setAppStep(AppStep.EMAIL_REGISTRATION);
        } else {
            setUserProfile(response.user!);
            setAppStep(AppStep.SERVICE_SELECTION);
        }
    };

    const handlePhoneNumberSubmit = async (phone: string) => {
        setIsLoading(true);
        setApiError(null);
        try {
            await firebaseService.sendOtpToPhone(phone);
            setLoginPhoneNumber(phone);
            setAppStep(AppStep.OTP_VERIFICATION);
        } catch (error: any) {
            console.error("Firebase phone auth error:", error);
            setApiError(error.message || 'Failed to send OTP. Please check the number and try again.');
        } finally {
            setIsLoading(false);
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
            setApiError(error.message || 'OTP verification failed.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const idToken = await firebaseService.signInWithGoogleAndGetToken();
            await handleBackendLogin(idToken);
        } catch (error: any) {
            console.error("Google Sign-In failed:", error);
            setApiError(error.message || 'Google Sign-In failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegistrationComplete = async (fullName: string, email: string, photo: File | null) => {
         setIsLoading(true);
         setApiError(null);
         try {
            // After registration, the user is already authenticated with Firebase.
            // We just need to create their profile on our backend.
            const response = await apiService.register(fullName, email, photo);
            setUserProfile(response.user!);
            setAppStep(AppStep.SERVICE_SELECTION);
         } catch (error: any) {
             setApiError(error.message || 'Registration failed.');
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
        
        switch(service) {
            case ServiceCategory.Food:
            case ServiceCategory.Grocery:
                setAppStep(AppStep.STORE_SELECTION);
                break;
            case ServiceCategory.Package:
            case ServiceCategory.Document:
            case ServiceCategory.Heavy:
                 setAppStep(AppStep.LOCATION_INPUT);
                 break;
            // Add cases for MOVING and BUSINESS_LOGISTICS here
            default:
                setAppStep(AppStep.LOCATION_INPUT);
                break;
        }
    };

    const handleStoreSelect = (store: Store) => {
        setOrderDetails(prev => ({ ...prev, store }));
        // For simplicity, we are skipping Menu Selection for now
        // and going straight to location input.
        // In a real app, the next step would be AppStep.MENU_SELECTION
        setAppStep(AppStep.LOCATION_INPUT);
    };
    
    const setPickupLocation = (location: LocationInfo) => {
        setOrderDetails(prev => ({ ...prev, pickupLocation: location }));
    };
    
    const setDeliveryLocation = (location: LocationInfo) => {
        setOrderDetails(prev => ({ ...prev, deliveryLocation: location }));
    };

    const handleLocationNext = () => {
        // Based on service type, go to the correct details step
        switch (orderDetails.serviceType) {
            case ServiceCategory.Package:
            case ServiceCategory.Document:
            case ServiceCategory.Heavy:
                setAppStep(AppStep.PACKAGE_DETAILS);
                break;
            // Add cases for other service types that require details
            default:
                 // For services like Food/Grocery, we can skip to confirmation
                 handleDetailsNext(null);
                break;
        }
    };

    const handleDetailsNext = (details: PackageDetails | MovingDetails | BusinessLogisticsDetails | null) => {
        // Here you would check the type of `details` and set the correct field
        // in orderDetails. For now, we only handle PackageDetails.
        if (details && 'description' in details) { // Type guard for PackageDetails
             setOrderDetails(prev => ({ ...prev, packageDetails: details as PackageDetails }));
        }

        // MOCK PRICE CALCULATION
        const price: PriceBreakdown = {
            baseFare: 20.00,
            distanceFee: 15.50,
            weightFee: (orderDetails.packageDetails?.weight === '5-10kg') ? 10.00 : 5.00,
            tierSurcharge: 0,
            serviceFee: 2.50,
            subtotal: 0,
            total: 0,
        };
        price.subtotal = price.baseFare + price.distanceFee + price.weightFee + price.serviceFee;
        price.total = price.subtotal; // Will be updated by tier selection
        
        setOrderDetails(prev => ({ ...prev, priceBreakdown: price }));
        setAppStep(AppStep.CONFIRMATION);
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
                ...prev,
                deliveryTier: tier,
                priceBreakdown: {
                    ...prev.priceBreakdown,
                    tierSurcharge: newSurcharge,
                    total: newTotal,
                }
            }
        });
    };

    const handleConfirmOrder = () => {
        console.log("Order Confirmed:", orderDetails);
        // Here you would call an API to create the order
        // and then move to the tracking step.
        // For now, we just reset.
        if (notificationHandler) {
            notificationHandler(t('notifications.paymentSuccess.title'), t('notifications.paymentSuccess.body'));
        }
        resetOrder();
    };


    const renderStep = () => {
        switch (appStep) {
            case AppStep.LOGIN:
                return <LoginStep 
                    onPhoneNumberSubmit={handlePhoneNumberSubmit} 
                    onGoogleLogin={handleGoogleLogin} 
                    isLoading={isLoading} 
                    isGoogleLoading={isLoading}
                    apiError={apiError}
                />;
            case AppStep.OTP_VERIFICATION:
                return <OtpStep 
                    phoneNumber={loginPhoneNumber} 
                    onVerify={handleOtpVerify}
                    onBack={() => { setApiError(null); setAppStep(AppStep.LOGIN); }}
                    isError={!!apiError}
                    isLoading={isLoading}
                />;
            case AppStep.EMAIL_REGISTRATION:
                 return <EmailRegistrationStep 
                    onComplete={handleRegistrationComplete}
                    onBack={() => setAppStep(AppStep.LOGIN)}
                    isLoading={isLoading}
                 />;
            case AppStep.SERVICE_SELECTION:
                return <ServiceSelectionStep onSelect={handleServiceSelect} />;
            case AppStep.STORE_SELECTION:
                return <StoreSelectionStep 
                    onStoreSelect={handleStoreSelect} 
                    onBack={() => setAppStep(AppStep.SERVICE_SELECTION)} 
                />
            case AppStep.LOCATION_INPUT:
                const locationBackStep = (orderDetails.serviceType === ServiceCategory.Food || orderDetails.serviceType === ServiceCategory.Grocery)
                    ? AppStep.STORE_SELECTION
                    : AppStep.SERVICE_SELECTION;
                return <LocationInputStep 
                    onNext={handleLocationNext}
                    onBack={() => setAppStep(locationBackStep)}
                    setPickupLocation={setPickupLocation}
                    setDeliveryLocation={setDeliveryLocation}
                    orderDetails={orderDetails}
                />;
            case AppStep.PACKAGE_DETAILS:
                return <PackageDetailsStep 
                    onNext={(details) => handleDetailsNext(details)}
                    onBack={() => setAppStep(AppStep.LOCATION_INPUT)}
                    initialDetails={orderDetails.packageDetails}
                />;
            case AppStep.CONFIRMATION:
                 const confirmationBackStep = orderDetails.packageDetails 
                    ? AppStep.PACKAGE_DETAILS 
                    : AppStep.LOCATION_INPUT;
                return userProfile ? <ConfirmationStep
                    orderDetails={orderDetails}
                    onConfirm={handleConfirmOrder}
                    onBack={() => setAppStep(confirmationBackStep)}
                    userProfile={userProfile}
                    onTierSelect={handleTierSelect}
                /> : null;
            // ...other cases...
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
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                        {renderStep()}
                    </div>
                </main>
            )}
        </div>
    );
};

export default App;