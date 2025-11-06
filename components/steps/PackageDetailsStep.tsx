import React, { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext.tsx';
import { PackageDetails } from '../../types.ts';
import { ArrowLeftIcon, ChevronRightIcon } from '../icons.tsx';

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
            onNext({ description, weight, specialInstructions });
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
                        id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder={t('packageDetails.descriptionPlaceholder')}
                    />
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-slate-700">{t('packageDetails.weightLabel')}</label>
                    <select id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md">
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

export default PackageDetailsStep;
