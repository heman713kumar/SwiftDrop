import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { Store } from '../../types';
import { MOCK_RESTAURANTS } from '../../constants';
import { StarIcon, ArrowLeftIcon } from '../icons';

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
          <select id="cuisine-filter" value={selectedCuisine} onChange={(e) => setSelectedCuisine(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md shadow-sm">
            {cuisines.map(c => <option key={c} value={c}>{c === 'All' ? t('storeSelection.allCuisines') : c}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2 self-end sm:self-center pt-2 sm:pt-6">
          <button onClick={() => setSortBy('rating')} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${sortBy === 'rating' ? 'bg-red-700 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-50 border'}`}>
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
            <div className="md:col-span-2 text-center py-10"><p className="text-slate-500">No stores match your criteria.</p></div>
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

export default StoreSelectionStep;