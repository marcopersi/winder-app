import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

/**
 * Reference Data Service
 * Converts translated filter values (e.g., "Rot", "Weiss") back to canonical names (e.g., "red", "white")
 * Matches Web App's referenceDataService.ts exactly
 */

interface ColorReference {
  name: string; // Canonical name: "red", "white", "rosé", "orange"
  translations: Record<string, string>; // { "de": "Rot", "en": "Red", "fr": "Rouge" }
}

interface WineTypeReference {
  name: string; // Canonical name: "still wine", "sparkling wine", "fortified wine"
  translations: Record<string, string>; // { "de": "Stillwein", "en": "Still Wine" }
}

class ReferenceDataService {
  private readonly cache: {
    wineColors: ColorReference[];
    wineTypes: WineTypeReference[];
  } = {
    wineColors: [],
    wineTypes: [],
  };

  private initialized = false;

  /**
   * Initialize the service by loading all reference data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.referenceData.debug('Initializing...');

    try {
      await Promise.all([
        this.loadWineColors(),
        this.loadWineTypes(),
      ]);

      this.initialized = true;
      logger.referenceData.info('Initialized successfully');
    } catch (error) {
      logger.referenceData.error('Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load wine colors with all translations
   */
  private async loadWineColors(): Promise<void> {
    const { data: colors, error: colorsError } = await supabase
      .from('wine_colors')
      .select('id, name');

    if (colorsError) throw colorsError;

    const { data: translations, error: translationsError } = await supabase
      .from('wine_colors_translations')
      .select('wine_color_id, language_code, translated_name');

    if (translationsError) throw translationsError;

    // Build structured data
    this.cache.wineColors = (colors || []).map((color) => {
      const colorTranslations = (translations || [])
        .filter((t) => t.wine_color_id === color.id)
        .reduce<Record<string, string>>((acc, t) => {
          acc[t.language_code] = t.translated_name;
          return acc;
        }, {});

      return {
        name: color.name,
        translations: colorTranslations,
      };
    });

    logger.referenceData.info(`Loaded ${this.cache.wineColors.length} wine colors`);
  }

  /**
   * Load wine types with all translations
   */
  private async loadWineTypes(): Promise<void> {
    const { data: types, error: typesError } = await supabase
      .from('wine_types')
      .select('id, name');

    if (typesError) throw typesError;

    const { data: translations, error: translationsError } = await supabase
      .from('wine_types_translations')
      .select('wine_type_id, language_code, translated_name');

    if (translationsError) throw translationsError;

    // Build structured data
    this.cache.wineTypes = (types || []).map((type) => {
      const typeTranslations = (translations || [])
        .filter((t) => t.wine_type_id === type.id)
        .reduce<Record<string, string>>((acc, t) => {
          acc[t.language_code] = t.translated_name;
          return acc;
        }, {});

      return {
        name: type.name,
        translations: typeTranslations,
      };
    });

    logger.referenceData.info(`Loaded ${this.cache.wineTypes.length} wine types`);
  }

  /**
   * Convert translated color name to canonical name
   * Examples:
   *   "Rot" (de) → "red"
   *   "Red" (en) → "red"
   *   "Rouge" (fr) → "red"
   *   "Weiss" (de) → "white"
   */
  getWineColorName(value: string): string | null {
    if (!value) return null;

    const normalized = value.toLowerCase().trim();

    const match = this.cache.wineColors.find(
      (color) =>
        color.name.toLowerCase() === normalized ||
        Object.values(color.translations).some(
          (t) => t.toLowerCase() === normalized
        )
    );

    return match?.name || null;
  }

  /**
   * Convert translated wine type name to canonical name
   * Examples:
   *   "Stillwein" (de) → "still wine"
   *   "Still Wine" (en) → "still wine"
   *   "Schaumwein" (de) → "sparkling wine"
   */
  getWineTypeName(value: string): string | null {
    if (!value) return null;

    const normalized = value.toLowerCase().trim();

    const match = this.cache.wineTypes.find(
      (type) =>
        type.name.toLowerCase() === normalized ||
        Object.values(type.translations).some(
          (t) => t.toLowerCase() === normalized
        )
    );

    return match?.name || null;
  }
}

// Export singleton instance
export const referenceDataService = new ReferenceDataService();
