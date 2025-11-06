import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { fetchPlaceSuggestions } from '../services/geminiService';
import { getCurrentPosition } from '../services/geolocationService';
import { LocationInfo, MapSuggestion } from '../types';
import { MapPinIcon, MyLocationIcon } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface LocationInputProps {
  label: string;
  onLocationSelect: (location: LocationInfo) => void;
  initialValue: LocationInfo | null;
  showValidationError: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({ label, onLocationSelect, initialValue, showValidationError }) => {
  const [query, setQuery] = useState(initialValue?.address || '');
  const [suggestions, setSuggestions] = useState<MapSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const debouncedFetch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const results = await fetchPlaceSuggestions(searchQuery, null); // For now, not passing coords to search
        setSuggestions(results);
      } catch (err) {
        // Already handled in service, but can add UI feedback here
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsSuggesting(true);
    onLocationSelect({ address: value, validated: false });
    debouncedFetch(value);
  };

  const handleSuggestionClick = (suggestion: MapSuggestion) => {
    setQuery(suggestion.title);
    setSuggestions([]);
    setIsSuggesting(false);
    onLocationSelect({ address: suggestion.title, validated: true });
  };
  
  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const { lat, lng } = await getCurrentPosition();
        const address = `${t('location.currentLocationLabel')} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setQuery(address);
        onLocationSelect({ address, lat, lng, validated: true });
    } catch (err: any) {
        setError(err.message || t('location.currentLocationError'));
    } finally {
        setIsLoading(false);
        setIsSuggesting(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPinIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onBlur={() => setTimeout(() => setIsSuggesting(false), 200)}
          onFocus={() => setIsSuggesting(true)}
          className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
          placeholder={t('location.placeholder')}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button type="button" onClick={handleUseCurrentLocation} className="text-gray-400 hover:text-red-700">
                <MyLocationIcon className="h-5 w-5"/>
            </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {showValidationError && <p className="mt-2 text-sm text-red-600">{t('location.validationError')}</p>}
      {isSuggesting && (isLoading || suggestions.length > 0) && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
            {isLoading && !suggestions.length && <li className="px-4 py-2 text-sm text-gray-500">{t('location.searching')}...</li>}
            {suggestions.map((suggestion, index) => (
                <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="cursor-pointer hover:bg-red-100 px-4 py-2 text-sm text-gray-800"
                >
                {suggestion.title}
                </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default LocationInput;