import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { ServiceCategory } from '../../types';
import { SERVICE_TYPES } from '../../constants';

const ServiceSelectionStep: React.FC<{ onSelect: (service: ServiceCategory) => void }> = ({ onSelect }) => {
    const { t } = useTranslation();
    
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
                        className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-red-500 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
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

export default ServiceSelectionStep;