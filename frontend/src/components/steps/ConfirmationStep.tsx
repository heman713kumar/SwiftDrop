
import React, { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { OrderDetails, UserProfile, DeliveryTier, PaymentMethod, ServiceCategory } from '../../types';
import { 
    ArrowLeftIcon,
    MapPinIcon,
    PackageIcon,
    CalendarIcon,
    CreditCardIcon,
    CashIcon,
    DevicePhoneMobileIcon,
    BanknotesIcon,
    BuildingOfficeIcon,
    MotorcycleIcon,
} from '../icons';

const TierCard: React.FC<{
    tier: DeliveryTier;
    title: string;
    description: string;
    price: number;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ tier, title, description, price, isSelected, onSelect }) => (
    <div
        onClick={onSelect}
        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
            isSelected
                ? 'bg-red-50 border-red-700 ring-2 ring-red-600'
                : 'bg-white border-slate-300 hover:border-red-400'
        }`}
    >
        <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800">{title}</h4>
            <p className="font-semibold text-slate-700">
                {price > 0 ? `+ GHS ${price.toFixed(2)}` : 'Included'}
            </p>
        </div>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
);

const ConfirmationStep: React.FC<{
    orderDetails: OrderDetails;
    onConfirm: () => void;
    onBack: () => void;
    userProfile: UserProfile;
    onTierSelect: (tier: DeliveryTier) => void;
}> = ({ orderDetails, onConfirm, onBack, userProfile, onTierSelect }) => {
    const { t } = useTranslation();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.MobileMoney);
    const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('');

    const { 
        serviceType, 
        pickupLocation, 
        deliveryLocation, 
        packageDetails, 
        priceBreakdown,
        deliveryTier,
    } = orderDetails;

    const selectedTier = deliveryTier ?? DeliveryTier.Economy;
    
    const paymentMethods = [
        { id: PaymentMethod.MobileMoney, icon: DevicePhoneMobileIcon, name: "Mobile Money" },
        { id: PaymentMethod.CashOnDelivery, icon: CashIcon, name: "Cash on Delivery" },
        { id: PaymentMethod.BankTransfer, icon: BanknotesIcon, name: "Bank Transfer" },
        { id: PaymentMethod.CorporateAccount, icon: BuildingOfficeIcon, name: "Corporate Account" },
    ];


    return (
        <div>
            <h2 className="text-center text-2xl font-bold text-slate-800">{t('confirmation.title')}</h2>

            <div className="mt-8 space-y-6">
                {/* Order Summary */}
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">{t('confirmation.summaryTitle')}</h3>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-start">
                            <PackageIcon className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-slate-500">{t('confirmation.serviceType')}</p>
                                <p className="font-medium text-slate-800">{serviceType}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <MapPinIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-slate-500">{t('confirmation.pickup')}</p>
                                <p className="font-medium text-slate-800">{pickupLocation?.address}</p>
                            </div>
                        </div>
                         <div className="flex items-start">
                            <MapPinIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-slate-500">{t('confirmation.delivery')}</p>
                                <p className="font-medium text-slate-800">{deliveryLocation?.address}</p>
                            </div>
                        </div>
                        {packageDetails && (
                             <div className="flex items-start pt-2 border-t border-slate-200">
                                <PackageIcon className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-slate-500">{t('confirmation.packageDetails')}</p>
                                    <p className="font-medium text-slate-800">{t('confirmation.description')}: {packageDetails.description}</p>
                                    <p className="font-medium text-slate-800">{t('confirmation.weight')}: {packageDetails.weight}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delivery Tier */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">{t('confirmation.tier.title')}</h3>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TierCard tier={DeliveryTier.Express} title={t('confirmation.tier.express.title')} description={t('confirmation.tier.express.desc')} price={15.00} isSelected={selectedTier === DeliveryTier.Express} onSelect={() => onTierSelect(DeliveryTier.Express)} />
                        <TierCard tier={DeliveryTier.SameDay} title={t('confirmation.tier.sameDay.title')} description={t('confirmation.tier.sameDay.desc')} price={5.00} isSelected={selectedTier === DeliveryTier.SameDay} onSelect={() => onTierSelect(DeliveryTier.SameDay)} />
                        <TierCard tier={DeliveryTier.Scheduled} title={t('confirmation.tier.scheduled.title')} description={t('confirmation.tier.scheduled.desc')} price={2.00} isSelected={selectedTier === DeliveryTier.Scheduled} onSelect={() => onTierSelect(DeliveryTier.Scheduled)} />
                        <TierCard tier={DeliveryTier.Economy} title={t('confirmation.tier.economy.title')} description={t('confirmation.tier.economy.desc')} price={0.00} isSelected={selectedTier === DeliveryTier.Economy} onSelect={() => onTierSelect(DeliveryTier.Economy)} />
                    </div>
                </div>

                {/* Price Breakdown */}
                {priceBreakdown && (
                     <div className="p-4 border border-slate-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-800">{t('confirmation.price.title')}</h3>
                        <div className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-slate-600">{t('confirmation.price.baseFare')}</span><span>GHS {priceBreakdown.baseFare.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-600">{t('confirmation.price.distanceFee')}</span><span>GHS {priceBreakdown.distanceFee.toFixed(2)}</span></div>
                            {priceBreakdown.weightFee > 0 && <div className="flex justify-between"><span className="text-slate-600">{t('confirmation.price.weightFee')}</span><span>GHS {priceBreakdown.weightFee.toFixed(2)}</span></div>}
                            {priceBreakdown.tierSurcharge > 0 && <div className="flex justify-between"><span className="text-slate-600">{t('confirmation.price.tierSurcharge')}</span><span>GHS {priceBreakdown.tierSurcharge.toFixed(2)}</span></div>}
                            <div className="flex justify-between border-t border-dashed pt-1 mt-1"><span className="text-slate-600">{t('confirmation.price.serviceFee')}</span><span>GHS {priceBreakdown.serviceFee.toFixed(2)}</span></div>
                            <div className="flex justify-between text-lg font-bold text-slate-800 border-t pt-2 mt-2"><span>{t('confirmation.price.total')}</span><span>GHS {priceBreakdown.total.toFixed(2)}</span></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={onBack} className="flex items-center justify-center py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-md font-medium text-slate-700 bg-white hover:bg-slate-50">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    {t('common.back')}
                </button>
                <button onClick={onConfirm} className="flex items-center justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-red-700 hover:bg-red-800">
                    {t('confirmation.confirmButton')}
                </button>
            </div>
        </div>
    );
};

export default ConfirmationStep;