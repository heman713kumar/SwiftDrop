import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { PackageIcon, GoogleIcon, SpinnerIcon, ExclamationTriangleIcon } from '../icons';
import * as firebaseService from '../../services/firebaseService';

const LoginStep: React.FC<{ 
    onPhoneNumberSubmit: (phone: string) => void;
    onGoogleLogin: () => void; 
    isLoading: boolean;
    isGoogleLoading: boolean;
    apiError: { title: string; message: string; link?: string; linkText?: string; } | null;
}> = ({ onPhoneNumberSubmit, onGoogleLogin, isLoading, isGoogleLoading, apiError }) => {
    const [countryCode, setCountryCode] = useState('+233');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    const maxLength = countryCode === '+233' ? 9 : 10;

    useEffect(() => {
        return () => {
            firebaseService.cleanupRecaptcha();
        };
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
        setError(isValid ? null : t(errorMessageKey));
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
                    <><SpinnerIcon className="h-5 w-5 mr-3" />{t('login.googleLoading')}</>
                ) : (
                    <><GoogleIcon className="h-5 w-5 mr-3" />{t('login.googleButton')}</>
                )}
            </button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-300" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">{t('login.orSeparator')}</span></div>
            </div>

            {apiError && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-md text-left">
                <div className="flex">
                  <div className="flex-shrink-0"><ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" /></div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-red-800">{apiError.title}</h3>
                    <p className="mt-1 text-sm text-red-700">{apiError.message}</p>
                    {apiError.link && apiError.linkText && (
                        <a href={apiError.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-red-700 hover:text-red-600 underline">
                            {apiError.linkText} &rarr;
                        </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="phone-number" className="sr-only">{t('login.phoneNumberLabel')}</label>
                    <div className="flex rounded-lg shadow-sm">
                        <div className="relative flex-shrink-0">
                             <select aria-label="Country code" value={countryCode} onChange={(e) => { setCountryCode(e.target.value); setPhone(''); setError(null);}} className="h-full bg-slate-50 border border-r-0 border-slate-300 rounded-l-lg pl-3 pr-8 text-slate-600 sm:text-sm focus:ring-red-500 focus:border-red-500">
                                <option value="+233">GH +233</option>
                                <option value="+44">UK +44</option>
                            </select>
                        </div>
                        <input
                            type="tel" name="phone-number" id="phone-number"
                            className={`focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-slate-300 rounded-r-lg py-3 px-4 ${error ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            placeholder={countryCode === '+233' ? "24 123 4567" : "7123 456789"}
                            value={phone}
                            onChange={(e) => {
                                const digitsOnly = e.target.value.replace(/\D/g, '');
                                if (digitsOnly.length <= maxLength) setPhone(digitsOnly);
                            }}
                            required maxLength={maxLength}
                        />
                    </div>
                     {error && <p className="mt-2 text-sm text-red-600 text-left">{error}</p>}
                </div>

                <button type="submit" disabled={isLoading || isGoogleLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 transition-colors">
                    {isLoading ? <SpinnerIcon className="h-6 w-6 text-white" /> : t('common.continue')}
                </button>
            </form>
        </div>
    );
};

export default LoginStep;