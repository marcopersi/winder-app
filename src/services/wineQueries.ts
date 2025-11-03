/**
 * Wine Queries - Simplified Native Version
 * 
 * This file replicates the Web App's wine loading logic for React Native.
 * Key differences from the old implementation:
 * - Single fetchWines() function like Web App
 * - Tags come from wines_with_core_details view (NOT wine_tag_translations table)
 * - Direct database filtering
 * - Simpler code structure
 */

import { supabase } from '../lib/supabase';
import { referenceDataService } from './referenceDataService';
import type { Wine, DatabaseWineFilter } from '../types';

const SUPPORTED_LANGUAGES = ['de', 'en', 'fr', 'it'] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Normalize language code to supported language
 */
const normalizeLanguageCode = (languageCode?: string | null): SupportedLanguage => {
  if (!languageCode) {
    return DEFAULT_LANGUAGE;
  }

  const lowerCased = languageCode.toLowerCase();
  const baseCode = lowerCased.split('-')[0];

  return (SUPPORTED_LANGUAGES as readonly string[]).includes(baseCode)
    ? (baseCode as SupportedLanguage)
    : DEFAULT_LANGUAGE;
};

/**
 * Main wine fetching function
 * Loads wines from wines_with_core_details view with all tags and translations embedded
 */
export const fetchWines = async (
  filters?: DatabaseWineFilter,
  languageCode?: string | null
): Promise<Wine[]> => {
  try {
    const activeLanguage = normalizeLanguageCode(languageCode);
    console.log('[fetchWines] Starting with language:', activeLanguage, 'filters:', filters);

    // Start query on wines_with_core_details view
    // This view already has all translations and tags embedded!
    let winesQuery = supabase
      .from('wines_with_core_details')
      .select(`
        id,
        reference_id,
        default_name,
        year,
        image_path,
        region_id,
        region_name_default,
        country_code,
        country_name_default,
        descriptions_by_language,
        region_names_by_language,
        country_names_by_language,
        wine_type,
        wine_type_translations,
        wine_color,
        wine_color_translations,
        sweetness_level,
        sweetness_level_translations,
        alcohol_level,
        alcohol_min,
        alcohol_max,
        alcohol_level_translations,
        vinification_method,
        vinification_category,
        vinification_method_translations,
        price_range,
        price_min,
        price_max,
        price_range_translations,
        unit_volume
      `);

    // Apply filters if provided
    if (filters) {
      // Country filter
      if (filters.countries && filters.countries.length > 0) {
        winesQuery = winesQuery.in('country_code', filters.countries);
      }

      // Region filter  
      if (filters.regions && filters.regions.length > 0) {
        winesQuery = winesQuery.in('region_name_default', filters.regions);
      }

      // Wine type filter - Convert translated names to canonical names
      if (filters.wineType && filters.wineType.length > 0) {
        const wineTypeNames = filters.wineType
          .map((name: string) => referenceDataService.getWineTypeName(name))
          .filter((n): n is string => n !== null);
        
        if (wineTypeNames.length > 0) {
          winesQuery = winesQuery.in('wine_type', wineTypeNames);
        }
      }

      // Wine color filter - Convert translated names to canonical names
      if (filters.color && filters.color.length > 0) {
        const colorNames = filters.color
          .map((name: string) => referenceDataService.getWineColorName(name))
          .filter((n): n is string => n !== null);
        
        if (colorNames.length > 0) {
          winesQuery = winesQuery.in('wine_color', colorNames);
        }
      }

      // Sweetness filter
      if (filters.sweetness && filters.sweetness.length > 0) {
        winesQuery = winesQuery.in('sweetness_level', filters.sweetness);
      }

      // Alcohol filter
      if (filters.alcohol && filters.alcohol.length > 0) {
        winesQuery = winesQuery.in('alcohol_level', filters.alcohol);
      }

      // Production type (vinification method) filter
      if (filters.productionType && filters.productionType.length > 0) {
        winesQuery = winesQuery.in('vinification_method', filters.productionType);
      }

      // Price filter
      if (filters.price && filters.price.length > 0) {
        winesQuery = winesQuery.in('price_range', filters.price);
      }

      // Unit filter
      if (filters.unit && filters.unit.length > 0) {
        const regex = /^(\d+\.?\d*)/;
        const unitVolumes = filters.unit.map((u: string) => {
          // Convert "0.75L" to 0.75
          const match = regex.exec(u);
          return match ? parseFloat(match[1]) : null;
        }).filter((v: number | null) => v !== null);
        
        if (unitVolumes.length > 0) {
          winesQuery = winesQuery.in('unit_volume', unitVolumes);
        }
      }

      // Producer filter
      if (filters.producer && filters.producer.length > 0) {
        console.log('[fetchWines] Applying producer filter:', filters.producer);
        winesQuery = winesQuery.in('producer_id', filters.producer);
      }

      // Grape filter - requires separate query
      if (filters.grape && filters.grape.length > 0) {
        console.log('[fetchWines] Applying grape filter:', filters.grape);
        
        // Query wine_grapes join table to find wines with these grapes
        const { data: wineGrapeData, error: grapeError } = await supabase
          .from('wine_grapes')
          .select('wine_id, grapes!inner(name)')
          .in('grapes.name', filters.grape);

        if (grapeError) {
          console.error('[fetchWines] Error querying grape filter:', grapeError);
        } else if (wineGrapeData && wineGrapeData.length > 0) {
          const wineIdsWithGrapes = [...new Set(wineGrapeData.map((wg: any) => wg.wine_id))];
          winesQuery = winesQuery.in('id', wineIdsWithGrapes);
        } else {
          // No wines match this grape filter
          console.log('[fetchWines] No wines match grape filter');
          return [];
        }
      }
    }

    // Execute query
    const { data: winesData, error: winesError } = await winesQuery;

    if (winesError) {
      console.error('[fetchWines] Error fetching wines:', winesError);
      throw winesError;
    }

    if (!winesData || winesData.length === 0) {
      console.log('[fetchWines] No wines found');
      return [];
    }

    console.log('[fetchWines] Found', winesData.length, 'wines');

    // Load grapes for all wines
    const wineIds = winesData.map((w: any) => w.id).filter(Boolean);
    const grapesMap = await loadGrapesForWines(wineIds);

    // Transform wines to Wine interface
    const wines: Wine[] = winesData.map((wine: any) => {
      // Get translated region name
      const regionNamesByLang = wine.region_names_by_language || {};
      const regionName = regionNamesByLang[activeLanguage] || wine.region_name_default || 'Unknown Region';

      // Build tags from the view's reference columns
      const tags = buildWineTags(wine, activeLanguage);

      // Get grapes
      const grapes = grapesMap[wine.id] || [];

      return {
        id: wine.reference_id || wine.id,
        name: wine.default_name || 'Unknown Wine',
        vintage: wine.year || null,
        price: wine.price_min || null,
        region: regionName,
        grape_variety: grapes.join(', ') || 'Unknown Grape',
        description: '',
        image: wine.image_path || '',
        image_url: wine.image_path || '',
        wine_type: wine.wine_color || 'red',
        body: 'medium',
        sweetness: wine.sweetness_level || 'dry',
        acidity: 'medium',
        tannin: 'medium',
        alcohol_content: wine.alcohol_min || 0,
        tags: tags,
        tagTranslations: [],
      };
    });

    console.log('[fetchWines] Transformed', wines.length, 'wines');
    return wines;

  } catch (error) {
    console.error('[fetchWines] Error:', error);
    return [];
  }
};

/**
 * Build wine tags from the view's embedded reference data
 * Tags are already in the view - we just need to extract and format them
 */
const buildWineTags = (wine: any, activeLanguage: SupportedLanguage): Array<{type: string, value: string}> => {
  const tags: Array<{type: string, value: string}> = [];

  // Wine Type
  if (wine.wine_type) {
    const translations = wine.wine_type_translations || {};
    const value = translations[activeLanguage] || wine.wine_type;
    tags.push({ type: 'wineType', value });
  }

  // Wine Color
  if (wine.wine_color) {
    const translations = wine.wine_color_translations || {};
    const value = translations[activeLanguage] || wine.wine_color;
    tags.push({ type: 'color', value });
  }

  // Sweetness
  if (wine.sweetness_level) {
    const translations = wine.sweetness_level_translations || {};
    const value = translations[activeLanguage] || wine.sweetness_level;
    tags.push({ type: 'sweetness', value });
  }

  // Alcohol
  if (wine.alcohol_level) {
    const translations = wine.alcohol_level_translations || {};
    let value = translations[activeLanguage] || wine.alcohol_level;
    
    // Add actual alcohol range if available
    if (wine.alcohol_min && wine.alcohol_max) {
      value = `${wine.alcohol_min}-${wine.alcohol_max}%`;
    } else if (wine.alcohol_min) {
      value = `${wine.alcohol_min}%`;
    }
    
    tags.push({ type: 'alcohol', value });
  }

  // Production Type (Vinification Method)
  if (wine.vinification_method) {
    const translations = wine.vinification_method_translations || {};
    const value = translations[activeLanguage] || wine.vinification_method;
    tags.push({ type: 'productionType', value });
  }

  // Price Range
  if (wine.price_range) {
    const translations = wine.price_range_translations || {};
    let value = translations[activeLanguage] || wine.price_range;
    
    // Add actual price range if available
    if (wine.price_min && wine.price_max) {
      value = `CHF ${wine.price_min}-${wine.price_max}`;
    } else if (wine.price_min) {
      value = `CHF ${wine.price_min}`;
    }
    
    tags.push({ type: 'price', value });
  }

  // Unit Volume
  if (wine.unit_volume) {
    tags.push({ type: 'unit', value: `${wine.unit_volume}L` });
  }

  return tags;
};

/**
 * Load grapes for multiple wines from wine_grapes join table
 */
const loadGrapesForWines = async (wineIds: string[]): Promise<Record<string, string[]>> => {
  if (wineIds.length === 0) {
    return {};
  }

  try {
    // Match the web app's exact query structure
    const { data, error } = await supabase
      .from('wine_grapes')
      .select('id, wine_id, grape_id, percentage, created_at, grapes ( id, name )')
      .in('wine_id', wineIds);

    if (error) {
      console.error('[loadGrapesForWines] Supabase error:', JSON.stringify(error));
      // Return empty map instead of crashing the app - grapes are optional
      return {};
    }

    if (!data || data.length === 0) {
      console.log('[loadGrapesForWines] No grape data found for wines (this is OK)');
      return {};
    }

    const grapesMap: Record<string, string[]> = {};
    
    (data || []).forEach((row: any) => {
      if (!row.wine_id || !row.grapes?.name) {
        return;
      }
      
      if (!grapesMap[row.wine_id]) {
        grapesMap[row.wine_id] = [];
      }
      
      // Avoid duplicates
      if (!grapesMap[row.wine_id].includes(row.grapes.name)) {
        grapesMap[row.wine_id].push(row.grapes.name);
      }
    });

    console.log(`[loadGrapesForWines] Loaded grapes for ${Object.keys(grapesMap).length} wines`);
    return grapesMap;

  } catch (error) {
    console.error('[loadGrapesForWines] Catch error:', error);
    // Return empty map to prevent app crash - grapes are optional metadata
    return {};
  }
};
