import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WineFilter } from '../types';
import { createDefaultFilter } from '../utils/filterUtils';

// Import filter options service
import { 
  getAllFilterOptions, 
  fetchCountryOptions
} from '../services/filterOptionsService';

// Import filter components
import FilterHeader from './filters/FilterHeader';
import FilterActions from './filters/FilterActions';
import GrapeFilter from './filters/GrapeFilter';
import CountryFilter from './filters/CountryFilter';
import WineTypeFilter from './filters/WineTypeFilter';
import CharacteristicFilter from './filters/CharacteristicFilter';
import CollapsibleCard from './filters/CollapsibleCard';

interface FilterMenuProps {
  isVisible: boolean;
  onClose: () => void;
  currentFilter: WineFilter;
  onFilterChange: (filter: WineFilter) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  isVisible,
  onClose,
  currentFilter,
  onFilterChange,
}) => {
  const [filter, setFilter] = useState<WineFilter>({ ...currentFilter });
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({
    grape: [],
    country: [],
    region: [],
    wineType: [],
    color: [],
    sweetness: [],      // ADD - wie Web App
    productionType: [],
    unit: [],
    alcohol: [],
    price: []           // ADD - wie Web App
  });
  const [countryLabels, setCountryLabels] = useState<Record<string, string>>({});
  const [hasLoadedOptions, setHasLoadedOptions] = useState(false); // Track if we've loaded options

  // Update local filter when currentFilter changes
  useEffect(() => {
    setFilter({ ...currentFilter });
  }, [currentFilter]);

  // Load filter options from database - load when visible and not yet loaded
  useEffect(() => {
    const loadFilterOptions = async () => {
      
      try {
        // Load dynamic options and countries in parallel
        const [dynamicOptions, countries] = await Promise.all([
          getAllFilterOptions('de'),
          fetchCountryOptions('de')
        ]);

        // Extract country codes and create label mapping
        const countryCodes = countries
          .map(c => c.country_code.toUpperCase())
          .filter((code): code is string => code.length > 0);
        
        const labelMap = countries.reduce<Record<string, string>>((acc, country) => {
          const code = country.country_code.toUpperCase();
          acc[code] = country.name;
          return acc;
        }, {});
        
        // Update filter options with database values
        const newFilterOptions = {
          grape: dynamicOptions.grape,
          country: countryCodes,
          region: [],
          wineType: dynamicOptions.wineType,
          color: dynamicOptions.color,
          sweetness: dynamicOptions.sweetness,
          productionType: dynamicOptions.productionType,
          unit: dynamicOptions.unit,
          alcohol: dynamicOptions.alcohol,
          price: dynamicOptions.price
        };
        
        setFilterOptions(newFilterOptions);
        setCountryLabels(labelMap);
        setHasLoadedOptions(true);
      } catch (error) {
        console.error('FilterMenu: Failed to load filter options:', error);
        throw error;
      }
    };

    // Load options when visible AND not yet loaded
    if (isVisible && !hasLoadedOptions) {
      loadFilterOptions();
    }
  }, [isVisible, hasLoadedOptions]);

  const handleApplyFilter = () => {
    onFilterChange(filter);
    onClose();
  };

  const handleReset = () => {
    const resetFilter = createDefaultFilter();
    setFilter(resetFilter);
    onFilterChange(resetFilter);
    onClose();
  };





  // Handle new-style filter toggles (exactly like Web App)
  const handleToggleOption = (
    category: keyof Pick<WineFilter, 'grape' | 'country' | 'region' | 'wineType' | 'color' | 'sweetness' | 'productionType' | 'unit' | 'alcohol' | 'price'>, 
    value: string
  ) => {
    setFilter(prev => {
      const updated = { ...prev };
      const currentArray = updated[category] || [];
      
      if (currentArray.includes(value)) {
        updated[category] = currentArray.filter((item: string) => item !== value) as any;
      } else {
        updated[category] = [...currentArray, value] as any;
      }
      
      return updated;
    });
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <FilterHeader onClose={onClose} />
        
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={true}
        >
          {/* NEW: COLLAPSIBLE CARD LAYOUT */}
          
          {/* Grape Filter */}
          <CollapsibleCard title={`Grapes (${filterOptions.grape.length})`} defaultExpanded={false}>
            <GrapeFilter
              options={filterOptions.grape}
              selectedOptions={filter.grape || []}
              onToggleOption={(value) => handleToggleOption('grape', value)}
            />
          </CollapsibleCard>
          
          {/* Country Filter */}
          <CollapsibleCard title={`Countries (${(filterOptions.country || []).length})`} defaultExpanded={false}>
            <CountryFilter
              options={filterOptions.country || []}
              selectedOptions={filter.country || []}
              onToggleOption={(value) => handleToggleOption('country', value)}
              labelMap={countryLabels}
            />
          </CollapsibleCard>
          
          {/* Wine Type Filter */}
          <CollapsibleCard title={`Wine Types (${(filterOptions.wineType || []).length})`} defaultExpanded={false}>
            <WineTypeFilter
              options={filterOptions.wineType || []}
              selectedOptions={filter.wineType || []}
              onToggleOption={(value) => handleToggleOption('wineType', value)}
            />
          </CollapsibleCard>
          
          {/* Color Filter */}
          <CollapsibleCard title={`Colors (${(filterOptions.color || []).length})`} defaultExpanded={false}>
            <CharacteristicFilter
              type="color"
              options={filterOptions.color || []}
              selectedOptions={filter.color || []}
              onToggleOption={(value) => handleToggleOption('color', value)}
            />
          </CollapsibleCard>
          
          {/* Sweetness Filter */}
          <CollapsibleCard title={`Sweetness (${(filterOptions.sweetness || []).length})`} defaultExpanded={false}>
            <CharacteristicFilter
              type="sweetness"
              options={filterOptions.sweetness || []}
              selectedOptions={filter.sweetness || []}
              onToggleOption={(value) => handleToggleOption('sweetness', value)}
            />
          </CollapsibleCard>
          
          {/* Alcohol Filter */}
          <CollapsibleCard title={`Alcohol (${(filterOptions.alcohol || []).length})`} defaultExpanded={false}>
            <CharacteristicFilter
              type="alcohol"
              options={filterOptions.alcohol || []}
              selectedOptions={filter.alcohol || []}
              onToggleOption={(value) => handleToggleOption('alcohol', value)}
            />
          </CollapsibleCard>
          
          {/* Price Filter */}
          <CollapsibleCard title={`Price (${(filterOptions.price || []).length})`} defaultExpanded={false}>
            <CharacteristicFilter
              type="price"
              options={filterOptions.price || []}
              selectedOptions={filter.price || []}
              onToggleOption={(value) => handleToggleOption('price', value)}
            />
          </CollapsibleCard>
        </ScrollView>

        <FilterActions
          onReset={handleReset}
          onApply={handleApplyFilter}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  bottomPadding: {
    height: 100,
  },
});

export default FilterMenu;