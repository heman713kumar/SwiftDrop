import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface HeaderProps {
    userProfile: UserProfile | null;
    onShowSettings: () => void;
    onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ userProfile, onShowSettings, onSignOut }) => {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const langDropdownRef = useRef<HTMLDivElement>(null);
    const { language, setLanguage, t } = useTranslation();

    useEffect(() => {
        if (userProfile?.photo) {
            if (typeof userProfile.photo === 'string') {
                setPhotoUrl(userProfile.photo);
                return;
            }
            const url = URL.createObjectURL(userProfile.photo);
            setPhotoUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPhotoUrl(null);
        }
    }, [userProfile?.photo]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
                setIsLangDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const languages = {
        en: 'English (EN)',
        tw: 'Asante Twi (TW)',
    };

    return (
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold text-red-700">SwiftDrop</span>
                        <span className="text-2xl font-light text-slate-600 ml-1">GH</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Language Switcher */}
                        <div className="relative" ref={langDropdownRef}>
                             <button
                                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-800"
                            >
                                {language.toUpperCase()}
                                <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                             {isLangDropdownOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {Object.entries(languages).map(([key, name]) => (
                                        <a
                                            key={key}
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setLanguage(key);
                                                setIsLangDropdownOpen(false);
                                            }}
                                            className={`block px-4 py-2 text-sm ${language === key ? 'bg-red-100 text-red-800' : 'text-slate-700 hover:bg-slate-100'}`}
                                        >
                                            {name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                         {userProfile ? (
                            <div className="flex items-center space-x-4">
                                <div className="relative" ref={userDropdownRef}>
                                    <button
                                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                        className="flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full"
                                    >
                                        <span className="text-sm font-medium text-slate-700 hidden sm:block mr-3">{t('header.greeting')}, {userProfile.fullName.split(' ')[0]}</span>
                                        {photoUrl ? (
                                            <img src={photoUrl} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
                                        ) : (
                                            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center">
                                                <UserIcon className="h-6 w-6 text-slate-500" />
                                            </div>
                                        )}
                                    </button>
                                    {isUserDropdownOpen && (
                                         <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex={-1}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); onShowSettings(); setIsUserDropdownOpen(false); }} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem" tabIndex={-1} id="user-menu-item-0">
                                                <Cog6ToothIcon className="w-5 h-5 mr-3 text-slate-500" />
                                                {t('header.settings')}
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={onSignOut}
                                    className="flex items-center text-sm font-medium text-slate-600 hover:text-red-700 transition-colors"
                                    aria-label={t('header.signOut')}
                                >
                                    <ArrowRightOnRectangleIcon className="w-6 h-6" />
                                    <span className="hidden sm:inline ml-2">{t('header.signOut')}</span>
                                </button>
                            </div>
                        ) : (
                             <div className="h-9 w-9"></div> // Placeholder
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
