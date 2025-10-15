// Simple i18n system for wine app
export type Language = 'en' | 'de' | 'fr' | 'it';

export interface Translations {
  // Wine characteristics
  body: {
    light: string;
    medium: string;
    full: string;
  };
  sweetness: {
    dry: string;
    'off-dry': string;
    'medium-dry': string;
    'medium-sweet': string;
    sweet: string;
  };
  acidity: {
    low: string;
    'medium-minus': string;
    medium: string;
    'medium-plus': string;
    high: string;
  };
  tannin: {
    low: string;
    'medium-minus': string;
    medium: string;
    'medium-plus': string;
    high: string;
  };
  wine_type: {
    red: string;
    white: string;
    rosé: string;
    sparkling: string;
    dessert: string;
  };
  // Common UI text
  ui: {
    vintage: string;
    alcohol: string;
    noVintage: string;
    likeButton: string;
    passButton: string;
    matches: string;
    supplier: string;
    price: string;
    availability: string;
    inStock: string;
    outOfStock: string;
    limited: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    body: {
      light: 'Light',
      medium: 'Medium',
      full: 'Full'
    },
    sweetness: {
      dry: 'Dry',
      'off-dry': 'Off-dry',
      'medium-dry': 'Medium-dry',
      'medium-sweet': 'Medium-sweet',
      sweet: 'Sweet'
    },
    acidity: {
      low: 'Low acidity',
      'medium-minus': 'Medium- acidity',
      medium: 'Medium acidity',
      'medium-plus': 'Medium+ acidity',
      high: 'High acidity'
    },
    tannin: {
      low: 'Low tannins',
      'medium-minus': 'Medium- tannins',
      medium: 'Medium tannins',
      'medium-plus': 'Medium+ tannins',
      high: 'High tannins'
    },
    wine_type: {
      red: 'Red Wine',
      white: 'White Wine',
      rosé: 'Rosé Wine',
      sparkling: 'Sparkling Wine',
      dessert: 'Dessert Wine'
    },
    ui: {
      vintage: 'Vintage',
      alcohol: 'Alcohol',
      noVintage: 'N.V.',
      likeButton: '♥ Like',
      passButton: '✕ Pass',
      matches: 'Matches',
      supplier: 'Supplier',
      price: 'Price',
      availability: 'Availability',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      limited: 'Limited'
    }
  },
  de: {
    body: {
      light: 'Leicht',
      medium: 'Mittel',
      full: 'Vollmundig'
    },
    sweetness: {
      dry: 'Trocken',
      'off-dry': 'Halbtrocken',
      'medium-dry': 'Feinherb',
      'medium-sweet': 'Lieblich',
      sweet: 'Süß'
    },
    acidity: {
      low: 'Niedrige Säure',
      'medium-minus': 'Mittlere- Säure',
      medium: 'Mittlere Säure',
      'medium-plus': 'Mittlere+ Säure',
      high: 'Hohe Säure'
    },
    tannin: {
      low: 'Niedrige Tannine',
      'medium-minus': 'Mittlere- Tannine',
      medium: 'Mittlere Tannine',
      'medium-plus': 'Mittlere+ Tannine',
      high: 'Hohe Tannine'
    },
    wine_type: {
      red: 'Rotwein',
      white: 'Weißwein',
      rosé: 'Roséwein',
      sparkling: 'Schaumwein',
      dessert: 'Dessertwein'
    },
    ui: {
      vintage: 'Jahrgang',
      alcohol: 'Alkohol',
      noVintage: 'O.J.',
      likeButton: '♥ Mag ich',
      passButton: '✕ Weiter',
      matches: 'Matches',
      supplier: 'Anbieter',
      price: 'Preis',
      availability: 'Verfügbarkeit',
      inStock: 'Lagernd',
      outOfStock: 'Nicht verfügbar',
      limited: 'Begrenzt'
    }
  },
  fr: {
    body: {
      light: 'Léger',
      medium: 'Moyen',
      full: 'Corsé'
    },
    sweetness: {
      dry: 'Sec',
      'off-dry': 'Demi-sec',
      'medium-dry': 'Demi-sec',
      'medium-sweet': 'Moelleux',
      sweet: 'Doux'
    },
    acidity: {
      low: 'Acidité faible',
      'medium-minus': 'Acidité moyenne-',
      medium: 'Acidité moyenne',
      'medium-plus': 'Acidité moyenne+',
      high: 'Acidité élevée'
    },
    tannin: {
      low: 'Tanins faibles',
      'medium-minus': 'Tanins moyens-',
      medium: 'Tanins moyens',
      'medium-plus': 'Tanins moyens+',
      high: 'Tanins élevés'
    },
    wine_type: {
      red: 'Vin Rouge',
      white: 'Vin Blanc',
      rosé: 'Vin Rosé',
      sparkling: 'Vin Effervescent',
      dessert: 'Vin de Dessert'
    },
    ui: {
      vintage: 'Millésime',
      alcohol: 'Alcool',
      noVintage: 'S.M.',
      likeButton: '♥ J\'aime',
      passButton: '✕ Passer',
      matches: 'Matches',
      supplier: 'Fournisseur',
      price: 'Prix',
      availability: 'Disponibilité',
      inStock: 'En stock',
      outOfStock: 'Épuisé',
      limited: 'Limité'
    }
  },
  it: {
    body: {
      light: 'Leggero',
      medium: 'Medio',
      full: 'Pieno'
    },
    sweetness: {
      dry: 'Secco',
      'off-dry': 'Abboccato',
      'medium-dry': 'Amabile',
      'medium-sweet': 'Dolce',
      sweet: 'Molto dolce'
    },
    acidity: {
      low: 'Acidità bassa',
      'medium-minus': 'Acidità media-',
      medium: 'Acidità media',
      'medium-plus': 'Acidità media+',
      high: 'Acidità alta'
    },
    tannin: {
      low: 'Tannini bassi',
      'medium-minus': 'Tannini medi-',
      medium: 'Tannini medi',
      'medium-plus': 'Tannini medi+',
      high: 'Tannini alti'
    },
    wine_type: {
      red: 'Vino Rosso',
      white: 'Vino Bianco',
      rosé: 'Vino Rosato',
      sparkling: 'Vino Spumante',
      dessert: 'Vino da Dessert'
    },
    ui: {
      vintage: 'Annata',
      alcohol: 'Alcol',
      noVintage: 'S.A.',
      likeButton: '♥ Mi piace',
      passButton: '✕ Passa',
      matches: 'Matches',
      supplier: 'Fornitore',
      price: 'Prezzo',
      availability: 'Disponibilità',
      inStock: 'Disponibile',
      outOfStock: 'Esaurito',
      limited: 'Limitato'
    }
  }
};

// Current language state
let currentLanguage: Language = 'en'; // Default to English

export const i18n = {
  setLanguage: (lang: Language) => {
    currentLanguage = lang;
  },
  
  getCurrentLanguage: (): Language => currentLanguage,
  
  t: (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key; // Return key if translation not found
  },
  
  // Convenience method for wine characteristics
  translateWineProperty: (property: keyof Translations, value: string): string => {
    const propertyTranslations = translations[currentLanguage][property] as Record<string, string>;
    return propertyTranslations?.[value] || value;
  }
};

// Auto-detect system language if possible
export const detectSystemLanguage = (): Language => {
  // In React Native, you might use react-native-localize
  // For now, we'll just use a simple detection
  return 'de'; // Default to German since you're likely in German-speaking area
};

// Initialize with detected language
i18n.setLanguage(detectSystemLanguage());