import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="ghost"
      size="sm"
      className="h-9 px-3 text-[#4e342e] hover:text-[#3b2c26] hover:bg-[#fdf6f0]/50 transition-all duration-300"
    >
      <Globe className="h-4 w-4 mr-2" />
      <span className="hidden sm:inline-block font-medium">
        {i18n.language === 'en' ? 'FR' : 'EN'}
      </span>
      <span className="sm:hidden">
        {i18n.language === 'en' ? '🇫🇷' : '🇺🇸'}
      </span>
    </Button>
  );
};

export default LanguageToggle;
