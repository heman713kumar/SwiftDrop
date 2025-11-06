import React, { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext.tsx';
import { UserIcon, CameraIcon, MailIcon, SpinnerIcon } from '../icons.tsx';

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
            reader.onloadend = () => setPhotoPreview(reader.result as string);
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
                         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><UserIcon className="h-5 w-5 text-slate-400" /></div>
                        <input type="text" name="full-name" id="full-name" className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3" placeholder={t('register.fullNamePlaceholder')} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                </div>
                <div>
                    <label htmlFor="email" className="sr-only">{t('register.emailLabel')}</label>
                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><MailIcon className="h-5 w-5 text-slate-400" /></div>
                        <input type="email" name="email" id="email" className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3" placeholder={t('register.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                </div>

                <button type="submit" disabled={!isFormValid || isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 transition-colors">
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

export default EmailRegistrationStep;
