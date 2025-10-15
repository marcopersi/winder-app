import { WineFilter, DatabaseWineFilter } from '../types';

// Wine tag types that match the database
const WINE_TAG_TYPES = [
  'grape', 'wineType', 'color', 'productionType', 'unit', 'alcohol'
] as const;

/**
 * Sanitizes string list by removing empty strings and trimming
 */
const sanitizeStringList = (list: string[]): string[] => {
  return list.filter(item => item?.trim()).map(item => item.trim());
};

/**
 * Builds tag filter map from WineFilter
 */
const buildTagFilterMap = (filter: WineFilter): { [key: string]: string[] } | undefined => {
  const entries = WINE_TAG_TYPES
    .map((key) => [key, sanitizeStringList((filter as any)[key] || [])] as const)
    .filter(([, values]) => values.length > 0);

  if (entries.length === 0) {
    return undefined;
  }

  return entries.reduce((acc, [key, values]) => {
    acc[key] = values;
    return acc;
  }, {} as { [key: string]: string[] });
};

/**
 * Converts a frontend WineFilter to a DatabaseWineFilter for efficient querying
 * This matches the Web App implementation - simple direct mapping
 */
export const convertToDBFilter = async (frontendFilter: WineFilter): Promise<DatabaseWineFilter> => {
  const dbFilter: DatabaseWineFilter = {};

  // Country filters
  const countries = sanitizeStringList(frontendFilter.country || []);
  if (countries.length > 0) {
    dbFilter.countries = countries;
  }

  // Region filters
  const regions = sanitizeStringList(frontendFilter.region || []);
  if (regions.length > 0) {
    dbFilter.regions = regions;
  }

  // Grape filters
  const grapes = sanitizeStringList(frontendFilter.grape || []);
  if (grapes.length > 0) {
    dbFilter.grape = grapes;
  }

  // Wine type filters
  const wineTypes = sanitizeStringList(frontendFilter.wineType || []);
  if (wineTypes.length > 0) {
    dbFilter.wineType = wineTypes;
  }

  // Color filters
  const colors = sanitizeStringList(frontendFilter.color || []);
  if (colors.length > 0) {
    dbFilter.color = colors;
  }

  // Sweetness filters
  const sweetness = sanitizeStringList(frontendFilter.sweetness || []);
  if (sweetness.length > 0) {
    dbFilter.sweetness = sweetness;
  }

  // Alcohol level filters
  const alcohol = sanitizeStringList(frontendFilter.alcohol || []);
  if (alcohol.length > 0) {
    dbFilter.alcohol = alcohol;
  }

  // Unit filters
  const unit = sanitizeStringList(frontendFilter.unit || []);
  if (unit.length > 0) {
    dbFilter.unit = unit;
  }

  // Price filters
  const price = sanitizeStringList(frontendFilter.price || []);
  if (price.length > 0) {
    dbFilter.price = price;
  }

  // Production type filters
  const productionType = sanitizeStringList(frontendFilter.productionType || []);
  if (productionType.length > 0) {
    dbFilter.productionType = productionType;
  }

  return dbFilter;
};

/**
 * Creates an empty WineFilter with default values
 */
export const createDefaultFilter = (): WineFilter => ({
  // New-style filters matching Web App
  grape: [],
  country: [],
  region: [],
  wineType: [],
  color: [],
  sweetness: [],
  productionType: [],
  unit: [],
  alcohol: [],
  price: [],
  
  // Legacy compatibility
  wineTypes: [],
  maxPrice: 1000,
  minPrice: 0,
  regions: [],
  grapeVarieties: [],
  vintageRange: [1900, 2024],
  alcoholRange: [0, 20],
});