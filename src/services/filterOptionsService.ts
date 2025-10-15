import { supabase } from '../lib/supabase';

/**
 * Filter Options Service
 * Loads dynamic filter options from the database
 * Based on the web app's filterOptionsApi.ts
 */

export interface CountryOption {
  country_code: string;
  name: string;
}

export interface RegionOption {
  country_code: string;
  name: string;
}

// Cache for filter options to avoid repeated API calls
const filterOptionsCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

const shouldUseCache = (cacheKey: string): boolean => {
  const timestamp = cacheTimestamps.get(cacheKey);
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_TTL;
};

const setCacheValue = (cacheKey: string, value: any): void => {
  filterOptionsCache.set(cacheKey, value);
  cacheTimestamps.set(cacheKey, Date.now());
};

const getCacheValue = (cacheKey: string): any => {
  if (shouldUseCache(cacheKey)) {
    return filterOptionsCache.get(cacheKey);
  }
  return null;
};

// Normalize language code (same as web app)
const normalizeLanguageCode = (languageCode: string = 'de'): string => {
  const supportedLanguages = ['de', 'en', 'fr', 'it'];
  const baseCode = languageCode.toLowerCase().split('-')[0];
  return supportedLanguages.includes(baseCode) ? baseCode : 'de';
};

/**
 * Fetch grape varieties from the grapes table
 */
// Fetch grape options from grapes reference table (wie Web App)
export const fetchGrapeOptions = async (): Promise<string[]> => {
  console.log('🍇 [FilterOptions] Fetching grape options...');
  
  const { data, error } = await supabase
    .from('grapes')
    .select('name')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('❌ [FilterOptions] Error fetching grape options:', error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error('No grape options found in database');
  }
  
  const grapeOptions = data
    .map(item => item.name)
    .filter(Boolean);
  
  console.log(`✅ [FilterOptions] Loaded ${grapeOptions.length} grape options`);
  return grapeOptions;
};

/**
 * Fetch country options with translations
 */
export const fetchCountryOptions = async (languageCode: string = 'en'): Promise<CountryOption[]> => {
  const normalizedLanguage = normalizeLanguageCode(languageCode);
  const cacheKey = `countries_${normalizedLanguage}`;
  
  const cached = getCacheValue(cacheKey);
  if (cached) return cached;

  console.log(`🌍 [FilterOptions] Fetching countries for language: ${normalizedLanguage}`);
  
  // Step 1: Get unique country codes from wines (to know which countries have wines)
  const { data: wineData, error: wineError } = await supabase
    .from('wines')
    .select('regions!inner(country_code)')
    .not('regions.country_code', 'is', null);

  if (wineError) {
    console.error('❌ [FilterOptions] Error fetching wine countries:', wineError);
    throw wineError;
  }

  if (!wineData || wineData.length === 0) {
    throw new Error('No wines found with country data');
  }

  // Extract unique country codes
  const countryCodeSet = new Set<string>();
  wineData.forEach((wine: any) => {
    const countryCode = wine.regions?.country_code;
    if (countryCode) {
      countryCodeSet.add(countryCode);
    }
  });

  const countryCodes = Array.from(countryCodeSet);
  console.log(`📊 [FilterOptions] Found ${countryCodes.length} unique countries with wines:`, countryCodes);

  if (countryCodes.length === 0) {
    throw new Error('No countries found with wines');
  }

  // Step 2: Get translated names for these country codes
  const { data: translations, error: translationError } = await supabase
    .from('country_translations')
    .select('country_code, name')
    .eq('language_code', normalizedLanguage)
    .in('country_code', countryCodes)
    .order('name', { ascending: true });

  if (translationError) {
    console.error('❌ [FilterOptions] Error fetching country translations:', translationError);
    throw translationError;
  }

  if (!translations || translations.length === 0) {
    throw new Error(`No country translations found for language ${normalizedLanguage}`);
  }

  console.log(`✅ [FilterOptions] Loaded ${translations.length} translated country names`);
  
  setCacheValue(cacheKey, translations);
  return translations
};

/**
 * Fetch regions from database
 */
export const fetchRegionOptions = async (): Promise<RegionOption[]> => {
  const cacheKey = 'regions';
  
  const cached = getCacheValue(cacheKey);
  if (cached) return cached;

  try {
    console.log('Fetching regions from database');
    
    const { data: regions, error } = await supabase
      .from('regions')
      .select('country_code, name')
      .order('country_code', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }

    if (!regions) {
      throw new Error('No region data returned from database');
    }

    setCacheValue(cacheKey, regions);
    return regions;
  } catch (error) {
    console.error('Error fetching regions:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Group regions by country code
 */
export const fetchRegionsByCountry = async (): Promise<Record<string, string[]>> => {
  try {
    const regions = await fetchRegionOptions();
    
    const grouped: Record<string, string[]> = {};
    regions.forEach(region => {
      const countryCode = region.country_code;
      if (!grouped[countryCode]) {
        grouped[countryCode] = [];
      }
      grouped[countryCode].push(region.name);
    });

    return grouped;
  } catch (error) {
    console.error('Error grouping regions by country:', error);
    return {};
  }
};

/**
 * Fetch wine type options from wine_types_translations (NOT wine_tag_translations!)
 * Matches Web App implementation exactly
 */
export const fetchWineTypeOptions = async (languageCode: string = 'de'): Promise<string[]> => {
  const normalizedLanguage = normalizeLanguageCode(languageCode);
  const cacheKey = `wineTypes_${normalizedLanguage}`;
  
  const cached = getCacheValue(cacheKey);
  if (cached) return cached;

  console.log('🍷 [FilterOptions] Fetching wine type options from wine_types_translations');

  const { data: wineTypes, error } = await supabase
    .from('wine_types_translations')
    .select('translated_name')
    .eq('language_code', normalizedLanguage)
    .order('translated_name', { ascending: true });

  if (error) {
    console.error('❌ [FilterOptions] Error fetching wine type options:', error);
    throw error;
  }

  if (!wineTypes || wineTypes.length === 0) {
    throw new Error(`No wine type options found for language ${normalizedLanguage}`);
  }

  const uniqueValues = [...new Set(wineTypes.map(wt => wt.translated_name).filter(value => value))];
  
  if (uniqueValues.length === 0) {
    throw new Error(`No wine type options found for language ${normalizedLanguage}`);
  }
  
  console.log(`✅ [FilterOptions] Fetched ${uniqueValues.length} wine type options from database`);
  setCacheValue(cacheKey, uniqueValues);
  return uniqueValues;
};

/**
 * Fetch color options from wine_colors_translations (NOT wine_tag_translations!)
 * Matches Web App implementation exactly
 */
export const fetchColorOptions = async (languageCode: string = 'de'): Promise<string[]> => {
  const normalizedLanguage = normalizeLanguageCode(languageCode);
  const cacheKey = `colors_${normalizedLanguage}`;
  
  const cached = getCacheValue(cacheKey);
  if (cached) return cached;

  try {
    console.log(`Fetching color options from wine_colors_translations for language: ${normalizedLanguage}`);

    const { data: colors, error } = await supabase
      .from('wine_colors_translations')
      .select('translated_name')
      .eq('language_code', normalizedLanguage)
      .order('translated_name', { ascending: true });

    if (error) {
      console.error('Error fetching color options:', error);
      throw error;
    }

    const colorValues = colors?.map((color) => color.translated_name).filter((value): value is string => Boolean(value)) ?? [];
    const uniqueColors = [...new Set(colorValues)];
    
    console.log(`Fetched ${uniqueColors.length} color options from database:`, uniqueColors);
    
    if (uniqueColors.length === 0) {
      throw new Error(`No color options found in database for language ${normalizedLanguage}`);
    }
    
    setCacheValue(cacheKey, uniqueColors);
    return uniqueColors;
  } catch (error) {
    console.error('Error fetching color options:', error);
    throw error;
  }
};

/**
 * Fetch production type options from vinification_methods_translations (NOT wine_tag_translations!)
 * Matches Web App implementation exactly
 */
export const fetchProductionTypeOptions = async (languageCode: string = 'de'): Promise<string[]> => {
  const normalizedLanguage = normalizeLanguageCode(languageCode);
  const cacheKey = `productionTypes_${normalizedLanguage}`;
  
  const cached = getCacheValue(cacheKey);
  if (cached) return cached;

  try {
    console.log('Fetching production type options from vinification_methods_translations');

    const { data: productionTypes, error } = await supabase
      .from('vinification_methods_translations')
      .select('translated_name')
      .eq('language_code', normalizedLanguage)
      .order('translated_name', { ascending: true });

    if (error) {
      console.error('Error fetching production type options:', error);
      throw error;
    }

    if (!productionTypes || productionTypes.length === 0) {
      throw new Error(`No production type options found in database for language ${normalizedLanguage}`);
    }

    const uniqueValues = [...new Set(productionTypes.map(pt => pt.translated_name).filter(value => value))];
    
    console.log(`Fetched ${uniqueValues.length} production type options from database`);
    
    if (uniqueValues.length === 0) {
      throw new Error(`No production type options found in database for language ${normalizedLanguage}`);
    }
    
    setCacheValue(cacheKey, uniqueValues);
    return uniqueValues;
  } catch (error) {
    console.error('Error fetching production type options:', error);
    throw error;
  }
};

/**
 * Fetch sweetness options from sweetness_levels_translations
 * Matches Web App implementation exactly
 */
export const fetchSweetnessOptions = async (languageCode: string = 'de'): Promise<string[]> => {
  const normalizedLanguage = normalizeLanguageCode(languageCode);
  const cacheKey = `sweetness_${normalizedLanguage}`;
  
  const cached = getCacheValue(cacheKey);
  if (cached) return cached;

  try {
    console.log('Fetching sweetness options from sweetness_levels_translations');

    const { data: sweetness, error } = await supabase
      .from('sweetness_levels_translations')
      .select('translated_name')
      .eq('language_code', normalizedLanguage)
      .order('translated_name', { ascending: true });

    if (error) {
      console.error('Error fetching sweetness options:', error);
      throw error;
    }

    if (!sweetness || sweetness.length === 0) {
      throw new Error(`No sweetness options found in database for language ${normalizedLanguage}`);
    }

    const uniqueValues = [...new Set(sweetness.map(s => s.translated_name).filter(value => value))];
    console.log(`Fetched ${uniqueValues.length} sweetness options from database`);

    if (uniqueValues.length === 0) {
      throw new Error(`No sweetness options found in database for language ${normalizedLanguage}`);
    }

    setCacheValue(cacheKey, uniqueValues);
    return uniqueValues;
  } catch (error) {
    console.error('Error fetching sweetness options:', error);
    throw error;
  }
};

/**
 * Fetch alcohol level options from alcohol_levels_translations
 * Matches Web App implementation exactly
 */
export const fetchAlcoholOptions = async (languageCode: string = 'de'): Promise<string[]> => {
  const normalizedLanguage = normalizeLanguageCode(languageCode);
  const cacheKey = `alcohol_${normalizedLanguage}`;
  
  const cached = getCacheValue(cacheKey);
  if (cached) return cached;

  try {
    console.log('Fetching alcohol options from alcohol_levels_translations');

    const { data: alcohol, error } = await supabase
      .from('alcohol_levels_translations')
      .select('translated_label')
      .eq('language_code', normalizedLanguage)
      .order('translated_label', { ascending: true });

    if (error) {
      console.error('Error fetching alcohol options:', error);
      throw error;
    }

    if (!alcohol || alcohol.length === 0) {
      throw new Error(`No alcohol options found in database for language ${normalizedLanguage}`);
    }

    const uniqueValues = [...new Set(alcohol.map(a => a.translated_label).filter(value => value))];
    console.log(`Fetched ${uniqueValues.length} alcohol options from database`);

    if (uniqueValues.length === 0) {
      throw new Error(`No alcohol options found in database for language ${normalizedLanguage}`);
    }

    setCacheValue(cacheKey, uniqueValues);
    return uniqueValues;
  } catch (error) {
    console.error('Error fetching alcohol options:', error);
    throw error;
  }
};

/**
 * Fetch unit options from units table
 * Matches Web App implementation exactly
 */
export const fetchUnitOptions = async (): Promise<string[]> => {
  const cacheKey = 'units';
  
  const cached = getCacheValue(cacheKey);
  if (cached) return cached;

  try {
    console.log('Fetching unit options from units table');

    const { data: units, error } = await supabase
      .from('units')
      .select('volume')
      .order('volume', { ascending: true });

    if (error) {
      console.error('Error fetching unit options:', error);
      throw error;
    }

    if (!units || units.length === 0) {
      throw new Error('No unit options found in database');
    }

    // Format volumes as "0.75L" etc
    const uniqueValues = [...new Set(units.map(u => `${u.volume}L`).filter(value => value))];
    console.log(`Fetched ${uniqueValues.length} unit options from database`);

    if (uniqueValues.length === 0) {
      throw new Error('No unit options found in database');
    }

    setCacheValue(cacheKey, uniqueValues);
    return uniqueValues;
  } catch (error) {
    console.error('Error fetching unit options:', error);
    throw error;
  }
};

/**
 * Fetch price range options from price_ranges_translations
 * Matches Web App implementation exactly
 */
export const fetchPriceOptions = async (languageCode: string = 'de'): Promise<string[]> => {
  const normalizedLanguage = normalizeLanguageCode(languageCode);
  const cacheKey = `price_${normalizedLanguage}`;
  
  const cached = getCacheValue(cacheKey);
  if (cached) return cached;

  try {
    console.log('Fetching price options from price_ranges_translations');

    const { data: prices, error } = await supabase
      .from('price_ranges_translations')
      .select('translated_label')
      .eq('language_code', normalizedLanguage)
      .order('translated_label', { ascending: true });

    if (error) {
      console.error('Error fetching price options:', error);
      throw error;
    }

    if (!prices || prices.length === 0) {
      throw new Error(`No price options found in database for language ${normalizedLanguage}`);
    }

    const uniqueValues = [...new Set(prices.map(p => p.translated_label).filter(value => value))];
    console.log(`Fetched ${uniqueValues.length} price options from database`);

    if (uniqueValues.length === 0) {
      throw new Error(`No price options found in database for language ${normalizedLanguage}`);
    }

    setCacheValue(cacheKey, uniqueValues);
    return uniqueValues;
  } catch (error) {
    console.error('Error fetching price options:', error);
    throw error;
  }
};

/**
 * Get all filter options for a specific language
 * Matches Web App's getFilterOptions exactly
 * NO FALLBACKS - throws immediately on any error
 */
export const getAllFilterOptions = async (languageCode: string = 'de'): Promise<Record<string, string[]>> => {
  console.log(`🔍 [FilterOptions] Loading all filter options for language: ${languageCode}`);
  
  // TEMPORARILY use Promise.allSettled to see which fetches fail
  const results = await Promise.allSettled([
    fetchGrapeOptions(),
    fetchWineTypeOptions(languageCode),
    fetchColorOptions(languageCode),
    fetchSweetnessOptions(languageCode),
    fetchProductionTypeOptions(languageCode),
    fetchUnitOptions(),
    fetchAlcoholOptions(languageCode),
    fetchPriceOptions(languageCode)
  ]);

  const filterNames = ['grape', 'wineType', 'color', 'sweetness', 'productionType', 'unit', 'alcohol', 'price'];
  
  // Log which filters succeeded and which failed
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`✅ [FilterOptions] ${filterNames[index]}: SUCCESS - ${result.value.length} items`);
    } else {
      console.error(`❌ [FilterOptions] ${filterNames[index]}: FAILED - ${result.reason}`);
    }
  });

  const filterOptions = {
    grape: results[0].status === 'fulfilled' ? results[0].value : [],
    wineType: results[1].status === 'fulfilled' ? results[1].value : [],
    color: results[2].status === 'fulfilled' ? results[2].value : [],
    sweetness: results[3].status === 'fulfilled' ? results[3].value : [],
    productionType: results[4].status === 'fulfilled' ? results[4].value : [],
    unit: results[5].status === 'fulfilled' ? results[5].value : [],
    alcohol: results[6].status === 'fulfilled' ? results[6].value : [],
    price: results[7].status === 'fulfilled' ? results[7].value : []
  };

  console.log(`📊 [FilterOptions] Final counts:`, {
    grape: filterOptions.grape.length,
    wineType: filterOptions.wineType.length,
    color: filterOptions.color.length,
    sweetness: filterOptions.sweetness.length,
    productionType: filterOptions.productionType.length,
    unit: filterOptions.unit.length,
    alcohol: filterOptions.alcohol.length,
    price: filterOptions.price.length
  });

  return filterOptions;
};

/**
 * Clear the filter options cache
 */
export const clearFilterOptionsCache = (): void => {
  filterOptionsCache.clear();
  cacheTimestamps.clear();
  console.log('Filter options cache cleared');
};