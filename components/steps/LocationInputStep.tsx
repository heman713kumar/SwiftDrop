import React, { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext.tsx';
import { LocationInfo, OrderDetails } from '../../types.ts';
import LocationInput from '../LocationInput.tsx';
import { ArrowLeftIcon, ChevronRightIcon } from '../icons.tsx';

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

export default LocationInputStep;
