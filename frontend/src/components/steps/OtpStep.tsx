import React, { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { SpinnerIcon } from '../icons';

const OtpStep: React.FC<{
    phoneNumber: string;
    onVerify: (otp: string) => void;
    onBack: () => void;
    onResend: () => void;
    isError: boolean;
    isLoading: boolean;
    resendCooldown: number;
    notification: string;
}> = ({ phoneNumber, onVerify, onBack, onResend, isError, isLoading, resendCooldown, notification }) => {
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

             {notification && <p className="mt-4 text-sm text-green-600 font-medium">{notification}</p>}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                 <div>
                    <label htmlFor="otp" className="sr-only">{t('otp.label')}</label>
                    <input
                        type="tel" name="otp" id="otp"
                        className={`w-full text-center text-2xl tracking-[1em] focus:ring-red-500 focus:border-red-500 block border-slate-300 rounded-lg py-3 ${isError ? 'border-red-500' : ''}`}
                        placeholder="------" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        maxLength={6} autoComplete="one-time-code"
                    />
                </div>
                 {isError && <p className="text-sm text-red-600">{t('otp.error')}</p>}
                 <button type="submit" disabled={otp.length < 6 || isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 transition-colors">
                     {isLoading ? <SpinnerIcon className="h-6 w-6 text-white" /> : t('otp.verifyButton')}
                </button>
            </form>

            <div className="mt-6 text-sm text-center">
                <p className="text-slate-500">
                    {t('otp.noCode')}{' '}
                    <button type="button" onClick={onResend} disabled={resendCooldown > 0} className="font-medium text-red-700 hover:text-red-600 disabled:text-slate-400 disabled:cursor-not-allowed">
                        {resendCooldown > 0 ? t('otp.resendCooldown', { seconds: resendCooldown }) : t('otp.resend')}
                    </button>
                </p>
                <button onClick={onBack} className="mt-2 font-medium text-slate-600 hover:text-slate-800">
                    {t('otp.changeNumber')}
                </button>
            </div>
        </div>
    );
};

export default OtpStep;