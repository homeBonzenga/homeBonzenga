import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin
} from 'lucide-react';

// Import logo
import logo from '@/assets/logo.jpg';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer id="contact" className="bg-[#3b2c26] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={logo}
                alt="Home Bonzenga Logo"
                className="h-10 w-10 rounded-full object-cover border-2 border-[#f8d7da] shadow-md"
              />
              <div>
                <h3 className="text-xl font-serif font-bold text-white">HOME BONZENGA</h3>
                <p className="text-[#f8d7da] text-sm font-sans">Premium Beauty Services</p>
              </div>
            </div>

            <div className="space-y-3 font-sans">
              <Link to="/about-us" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">{t('footer.company.about')}</Link>
              <Link to="/careers" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">{t('footer.company.careers')}</Link>
              <Link to="/contact" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">{t('footer.company.contact')}</Link>
            </div>
            </div>

            {/* Services */}
            <div>
            <h4 className="text-lg font-serif font-semibold mb-6 text-white">{t('footer.services.title')}</h4>
            <div className="space-y-3 font-sans">
              <Link to="/at-home-services" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">{t('footer.services.atHome')}</Link>
              <Link to="/salon-visit" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">{t('footer.services.salons')}</Link>
              <Link to="/#services" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">{t('footer.services.categories')}</Link>
              <Link to="/#for-beauticians" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">{t('footer.services.booking')}</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-serif font-semibold mb-6 text-white">{t('footer.support.title')}</h4>
            <div className="space-y-3 font-sans">
              <Link to="/help-center" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">{t('footer.support.help')}</Link>
              <Link to="/terms-and-conditions" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">{t('footer.company.terms')}</Link>
              <Link to="/privacy-policy" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">{t('footer.company.privacy')}</Link>
              <Link to="/faq" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">{t('footer.support.faq')}</Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-lg font-serif font-semibold mb-6 text-white">{t('footer.social.title')}</h4>
            <div className="space-y-3 text-white/70 mb-6 font-sans">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>+243 123 456 789</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@homebonzenga.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Kinshasa, DR Congo</span>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <a href="mailto:info@homebonzenga.com" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#f8d7da] hover:text-[#3b2c26] transition-all duration-300">
                <Mail className="w-4 h-4" />
              </a>
              <a href="tel:+243123456789" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#f8d7da] hover:text-[#3b2c26] transition-all duration-300">
                <Phone className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#f8d7da] hover:text-[#3b2c26] transition-all duration-300">
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-white/60 text-sm mb-4 sm:mb-0 font-sans">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
