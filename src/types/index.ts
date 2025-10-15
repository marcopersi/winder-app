// Tag interfaces matching the web app
export interface WineTag {
  type: string;
  value: string;
}

export interface TagTranslation {
  tagType: string;
  values: {
    de: string;
    en: string;
    fr: string;
    it: string;
  };
}

// Wine Types - Übertragen von Ihrer Web-App mit proper tag support
export interface Wine {
  id: string;
  name: string;
  vintage: number | null;
  price: number | null;
  region: string;
  grape_variety: string;
  description?: string;
  image?: string;
  image_url?: string; // Alternative field name for image URL
  wine_type: 'red' | 'white' | 'rosé' | 'sparkling' | 'dessert';
  body: 'light' | 'medium' | 'full';
  sweetness: 'dry' | 'off-dry' | 'medium-dry' | 'medium-sweet' | 'sweet';
  acidity: 'low' | 'medium-minus' | 'medium' | 'medium-plus' | 'high';
  tannin?: 'low' | 'medium-minus' | 'medium' | 'medium-plus' | 'high';
  alcohol_content: number;
  wine_tags?: string[]; // Legacy simple tags (for backward compatibility)
  tags?: WineTag[]; // Rich wine tags from database
  tagTranslations?: TagTranslation[]; // Multilingual tag translations
  created_at?: string;
  updated_at?: string;
}

// Supplier information for wine matches
export interface WineSupplier {
  id: string;
  name: string;
  website?: string;
  location?: string;
  price: number;
  currency: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  delivery_info?: string;
}

// Wine with supplier information (for matches view)
export interface WineMatch extends Wine {
  supplier: WineSupplier;
  matched_at: string;
  user_rating?: number;
}

export interface WineFilter {
  // Core filters
  grape: string[];
  country: string[];
  region: string[];
  wineType: string[];
  color: string[];
  sweetness: string[];  // Sweetness level filter
  
  // Production characteristics
  productionType: string[];
  
  // Technical details
  unit: string[];
  alcohol: string[];
  price: string[];  // Price range filter
  
  // Legacy compatibility (keeping for backward compatibility)
  wineTypes: string[];
  maxPrice: number;
  minPrice: number;
  regions: string[];
  grapeVarieties: string[];
  vintageRange: [number, number];
  alcoholRange: [number, number];
}

// Database-level filter interface for efficient querying
// This represents filters that can be applied directly at the database level
// Matches the Web App's DatabaseWineFilter interface
export interface DatabaseWineFilter {
  countries?: string[];           // Filter by country_code
  regions?: string[];            // Filter by region names
  grape?: string[];              // Filter by grape varieties (wine_grapes table)
  wineType?: string[];           // Filter by wine_type_id (wine_types table)
  color?: string[];              // Filter by wine_color_id (wine_colors table)
  sweetness?: string[];          // Filter by sweetness_level_id (sweetness_levels table)
  alcohol?: string[];            // Filter by alcohol_level_id (alcohol_levels table)
  unit?: string[];               // Filter by unit_id (units table)
  price?: string[];              // Filter by price_range_id (price_ranges table)
  productionType?: string[];     // Filter by vinification_method_id (vinification_methods table)
}

// User Types
export interface User {
  id: string;
  email?: string;
  displayName?: string;
  avatar?: string;
}

// Auth Types
export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
}