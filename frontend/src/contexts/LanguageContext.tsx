import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation data
const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      services: "Services",
      howItWorks: "How It Works",
      login: "Login",
      signup: "Sign Up",
      logout: "Logout"
    },
    // Hero Section
    hero: {
      title: "Beauty, Anytime, Anywhere",
      subtitle: "Book trusted stylists at your home or visit our verified partner salons – safe, reliable, professional.",
      bookAtHome: "Book At-Home Service",
      findSalon: "Find a Salon Near Me"
    },
    // Services Section
    services: {
      title: "Our Services",
      subtitle: "Choose how you want to experience beauty",
      atHome: {
        title: "At-Home Services",
        description: "Get a certified stylist at your doorstep. Convenient, safe, and professional.",
        button: "Book Now"
      },
      salon: {
        title: "Salon Visits",
        description: "Visit our trusted partner salons for a premium in-salon experience.",
        button: "Explore Salons"
      },
      categories: {
        title: "Service Categories",
        hair: {
          title: "Hair Styling",
          description: "Professional cuts, styling, coloring, and treatments"
        },
        face: {
          title: "Face Care", 
          description: "Facials, skincare treatments, and beauty services"
        },
        extras: {
          title: "Extras",
          description: "Manicures, pedicures, makeup, and special occasion styling"
        }
      }
    },
    // How It Works
    howItWorks: {
      title: "How It Works",
      subtitle: "Simple steps to book your perfect beauty service",
      steps: {
        step1: {
          title: "Choose Service Type",
          description: "Select At-Home or Salon service"
        },
        step2: {
          title: "Select Category", 
          description: "Pick from Hair, Face, or Extras"
        },
        step3: {
          title: "Pick Date & Time",
          description: "Choose your preferred appointment slot"
        },
        step4: {
          title: "Get Matched",
          description: "Manager assigns a verified stylist or salon"
        },
        step5: {
          title: "Enjoy Your Appointment",
          description: "Relax and enjoy professional beauty services"
        }
      }
    },
    // Why Choose Us
    whyChoose: {
      title: "Why Choose Bonzenga?",
      subtitle: "Professional beauty services you can trust",
      features: {
        verified: {
          title: "Verified Stylists & Salons",
          description: "All professionals are certified and background-checked"
        },
        flexible: {
          title: "Flexible: Home or Salon",
          description: "Choose the experience that works best for you"
        },
        secure: {
          title: "Secure Booking & Payments",
          description: "Safe, encrypted transactions and booking system"
        },
        updates: {
          title: "Real-time Updates",
          description: "Stay informed with live booking and service updates"
        }
      }
    },
    // Newsletter
    newsletter: {
      title: "Stay Updated",
      subtitle: "Get beauty tips and exclusive offers delivered to your inbox",
      placeholder: "Enter your email address",
      button: "Subscribe"
    },
    // Footer
    footer: {
      company: {
        title: "Company",
        about: "About Us",
        careers: "Careers",
        contact: "Contact",
        privacy: "Privacy Policy",
        terms: "Terms of Service"
      },
      services: {
        title: "Services",
        atHome: "At-Home Services",
        salons: "Partner Salons",
        categories: "All Categories",
        booking: "Book Appointment"
      },
      support: {
        title: "Support",
        help: "Help Center",
        faq: "FAQ",
        contact: "Contact Support",
        safety: "Safety Guidelines"
      },
      social: {
        title: "Follow Us"
      },
      copyright: "© 2024 HOME BONZENGA. All rights reserved."
    }
  },
  fr: {
    // Navigation
    nav: {
      home: "Accueil",
      services: "Services",
      howItWorks: "Comment ça marche",
      login: "Connexion",
      signup: "S'inscrire",
      logout: "Déconnexion"
    },
    // Hero Section
    hero: {
      title: "Beauté, à tout moment, partout",
      subtitle: "Réservez des stylistes de confiance à votre domicile ou visitez nos salons partenaires vérifiés – sûr, fiable, professionnel.",
      bookAtHome: "Réserver un Service à Domicile",
      findSalon: "Trouver un Salon Près de Moi"
    },
    // Services Section
    services: {
      title: "Nos Services",
      subtitle: "Choisissez comment vous voulez vivre la beauté",
      atHome: {
        title: "Services à Domicile",
        description: "Obtenez un styliste certifié à votre porte. Pratique, sûr et professionnel.",
        button: "Réserver Maintenant"
      },
      salon: {
        title: "Visites de Salon",
        description: "Visitez nos salons partenaires de confiance pour une expérience premium en salon.",
        button: "Explorer les Salons"
      },
      categories: {
        title: "Catégories de Services",
        hair: {
          title: "Coiffure",
          description: "Coupes professionnelles, coiffage, coloration et soins"
        },
        face: {
          title: "Soins du Visage",
          description: "Soins du visage, traitements de la peau et services de beauté"
        },
        extras: {
          title: "Extras",
          description: "Manucures, pédicures, maquillage et coiffage pour occasions spéciales"
        }
      }
    },
    // How It Works
    howItWorks: {
      title: "Comment ça marche",
      subtitle: "Étapes simples pour réserver votre service de beauté parfait",
      steps: {
        step1: {
          title: "Choisissez le Type de Service",
          description: "Sélectionnez service à domicile ou en salon"
        },
        step2: {
          title: "Sélectionnez la Catégorie",
          description: "Choisissez parmi Cheveux, Visage ou Extras"
        },
        step3: {
          title: "Choisissez Date et Heure",
          description: "Choisissez votre créneau de rendez-vous préféré"
        },
        step4: {
          title: "Soyez Jumelé",
          description: "Le gestionnaire assigne un styliste ou salon vérifié"
        },
        step5: {
          title: "Profitez de Votre Rendez-vous",
          description: "Détendez-vous et profitez des services de beauté professionnels"
        }
      }
    },
    // Why Choose Us
    whyChoose: {
      title: "Pourquoi Choisir Bonzenga?",
      subtitle: "Services de beauté professionnels en qui vous pouvez avoir confiance",
      features: {
        verified: {
          title: "Stylistes et Salons Vérifiés",
          description: "Tous les professionnels sont certifiés et vérifiés"
        },
        flexible: {
          title: "Flexible: Domicile ou Salon",
          description: "Choisissez l'expérience qui vous convient le mieux"
        },
        secure: {
          title: "Réservation et Paiements Sécurisés",
          description: "Transactions et système de réservation sûrs et cryptés"
        },
        updates: {
          title: "Mises à Jour en Temps Réel",
          description: "Restez informé avec les mises à jour de réservation et de service en direct"
        }
      }
    },
    // Newsletter
    newsletter: {
      title: "Restez à Jour",
      subtitle: "Recevez des conseils beauté et des offres exclusives dans votre boîte mail",
      placeholder: "Entrez votre adresse email",
      button: "S'abonner"
    },
    // Footer
    footer: {
      company: {
        title: "Entreprise",
        about: "À Propos",
        careers: "Carrières",
        contact: "Contact",
        privacy: "Politique de Confidentialité",
        terms: "Conditions d'Utilisation"
      },
      services: {
        title: "Services",
        atHome: "Services à Domicile",
        salons: "Salons Partenaires",
        categories: "Toutes les Catégories",
        booking: "Réserver un Rendez-vous"
      },
      support: {
        title: "Support",
        help: "Centre d'Aide",
        faq: "FAQ",
        contact: "Contacter le Support",
        safety: "Consignes de Sécurité"
      },
      social: {
        title: "Suivez-Nous"
      },
      copyright: "© 2024 HOME BONZENGA. Tous droits réservés."
    }
  }
};

type Language = 'en' | 'fr';
type TranslationKey = string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get saved language from localStorage or default to 'en'
    const saved = localStorage.getItem('language') as Language;
    return saved && (saved === 'en' || saved === 'fr') ? saved : 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // Fallback to English if translation not found
    if (value === undefined) {
      let fallback: any = translations.en;
      for (const k of keys) {
        fallback = fallback?.[k];
      }
      return fallback || key;
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
